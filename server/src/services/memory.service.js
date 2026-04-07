// src/services/memory.service.js
import { prisma } from '../config/database.js';
import { getModel } from '../config/gemini.js';

/**
 * Extract key facts from conversation and update project's core memory
 * Called after each assistant response in sendChatMessage
 */
export const updateCoreMemoryFromConversation = async (
  projectId,
  userMessage,
  assistantMessage,
  currentCoreMemory = ''
) => {
  try {
    console.log('🧠 [Memory Service] Starting memory extraction...');

    // Build memory extraction prompt
    const extractionPrompt = `You are a memory extraction agent. Your job is to identify key facts from conversations that should persist.

CURRENT CORE MEMORY (facts already remembered):
${currentCoreMemory || '(Empty - this is the first extraction)'}

NEW CONVERSATION:
User: ${userMessage.substring(0, 500)}
Assistant: ${assistantMessage.substring(0, 500)}

TASK: Extract 2-3 NEW key facts from this conversation that:
- Are specific and useful for future conversations
- Are not already in the current core memory
- Clarify user preferences, constraints, domain knowledge, or requirements
- Can be expressed as brief statements

FORMAT: Return ONLY bullet points. Example:
• User prefers concise technical explanations
• Project requires compliance with GDPR standards
• Team uses TypeScript with strict mode enabled

If no new relevant facts to extract, respond with: "No new facts to extract"`;

    // Use the project's model configuration for extraction
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { model: true, temperature: true }
    });

    if (!project) {
      console.warn('⚠️  [Memory Service] Project not found for memory extraction');
      return null;
    }

    // Call AI model for memory extraction (use lower temperature for consistency)
    console.log('📞 [Memory Service] Calling AI for memory extraction...');

    let extractedFacts;
    try {
      const { callOpenRouterWithContext } = await import('./openrouter.service.js');
      const response = await callOpenRouterWithContext(
        { ...project, model: project.model, temperature: Math.min(project.temperature, 0.3) },
        extractionPrompt,
        [], // No history needed for extraction
        'You are a memory extraction agent. Extract key facts from conversations concisely.'
      );
      extractedFacts = response;
    } catch (error) {
      console.log('⚠️  [Memory Service] OpenRouter extraction failed, trying fallback...');
      try {
        const { callLocalLLM } = await import('./local-llm.service.js');
        extractedFacts = await callLocalLLM(
          extractionPrompt,
          [],
          'You are a memory extraction agent. Extract key facts from conversations concisely.'
        );
      } catch (localError) {
        console.error('❌ [Memory Service] Both extraction methods failed:', localError.message);
        return null;
      }
    }

    console.log('✅ [Memory Service] Extraction successful:', extractedFacts.substring(0, 100));

    // Check if extraction returned "No new facts"
    if (extractedFacts.toLowerCase().includes('no new facts')) {
      console.log('📌 [Memory Service] No new facts to add to memory');
      return {
        projectId,
        newFacts: [],
        updatedMemory: currentCoreMemory,
      };
    }

    // Parse and deduplicate new facts
    const newFactsList = extractedFacts
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(fact => fact.length > 0 && !currentCoreMemory.includes(fact));

    console.log('✅ [Memory Service] Extracted facts:', newFactsList);

    if (newFactsList.length === 0) {
      console.log('📌 [Memory Service] No unique facts to add');
      return {
        projectId,
        newFacts: [],
        updatedMemory: currentCoreMemory,
      };
    }

    // Build updated memory
    const memoryLines = currentCoreMemory
      ? currentCoreMemory.split('\n').filter(line => line.trim().length > 0)
      : [];

    const updatedMemory = [
      ...memoryLines,
      ...newFactsList.map(fact => `• ${fact}`),
    ]
      .filter((value, index, self) => self.indexOf(value) === index) // Deduplicate
      .join('\n');

    console.log('💾 [Memory Service] Updating project memory...');

    // Update project's core memory in database
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        coreMemory: updatedMemory,
        memoryUpdatedAt: new Date(),
      },
      select: {
        id: true,
        coreMemory: true,
        memoryUpdatedAt: true,
      },
    });

    console.log('✅ [Memory Service] Core memory updated successfully');

    return {
      projectId,
      newFacts: newFactsList,
      updatedMemory: updatedProject.coreMemory,
      updatedAt: updatedProject.memoryUpdatedAt,
    };
  } catch (error) {
    console.error('❌ [Memory Service] Error updating core memory:', error);
    // Don't throw - memory update should be non-blocking
    return null;
  }
};

/**
 * Get formatted core memory for injection into AI prompt
 */
export const getFormattedCoreMemory = (coreMemory = '') => {
  if (!coreMemory || coreMemory.trim().length === 0) {
    return '';
  }

  return `\n\n📌 CORE MEMORY (Remember these important facts from past interactions):
${coreMemory}`;
};

/**
 * Clear project's core memory (optional manual reset)
 */
export const clearCoreMemory = async (projectId, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project || project.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      coreMemory: '',
      memoryUpdatedAt: new Date(),
    },
    select: {
      id: true,
      coreMemory: true,
      memoryUpdatedAt: true,
    },
  });

  return updated;
};
