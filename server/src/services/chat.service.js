// src/services/chat.service.js
import { prisma } from '../config/database.js';
import { getModel } from '../config/gemini.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { getCached, setCached, invalidateUserConversationsCache } from '../utils/cache.js';

/**
 * Get or create system prompt for project
 */
export const getActiveSystemPrompt = async (projectId) => {
  const prompt = await prisma.prompt.findFirst({
    where: {
      projectId,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return prompt?.content || 'You are a helpful AI assistant.';
};

/**
 * Get conversation history (last N messages)
 */
export const getConversationHistory = async (conversationId, limit = 10) => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: -limit, // Get last N messages
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return messages;
};

/**
 * Create conversation
 * POST /api/v1/projects/:projectId/conversations
 */
export const createConversation = async (projectId, userId, title = 'New Conversation') => {
  // CRITICAL: Validate project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!project) {
    throw new NotFoundError('Project', projectId);
  }
  
  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  // Validate title
  if (title && title.length > 200) {
    throw new BadRequestError('Title must be less than 200 characters');
  }

  const conversation = await prisma.conversation.create({
    data: {
      projectId,
      userId,
      title: title || 'New Conversation',
    },
    include: {
      _count: { select: { messages: true } },
    },
  });

  // Invalidate user conversations cache
  invalidateUserConversationsCache(userId);

  return {
    id: conversation.id,
    projectId: conversation.projectId,
    userId: conversation.userId,
    title: conversation.title,
    messageCount: conversation._count.messages,
    messages: [],
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

/**
 * Get all conversations for project
 * GET /api/v1/projects/:projectId/conversations
 * CRITICAL: Filter by projectId and verify user ownership
 */
export const getProjectConversations = async (
  projectId,
  userId,
  page = 1,
  limit = 50,
  sortBy = 'updated_at',
  sortOrder = 'desc',
  includeMessages = false
) => {
  // Validate project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  // Validate pagination
  if (page < 1 || limit < 1 || limit > 100) {
    throw new BadRequestError('Invalid pagination parameters');
  }

  // Check cache first
  const cacheKey = `conversations:${projectId}:page:${page}:limit:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const skip = (page - 1) * limit;
  const orderByMap = {
    'updated_at': { updatedAt: sortOrder },
    'created_at': { createdAt: sortOrder },
    'title': { title: sortOrder },
  };

  const orderBy = orderByMap[sortBy] || { updatedAt: 'desc' };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        projectId,
        userId,
        deletedAt: null, // Exclude soft-deleted conversations
      },
      skip,
      take: limit,
      orderBy,
      include: {
        messages: includeMessages
          ? {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
              },
            }
          : false,
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.count({
      where: {
        projectId,
        userId,
        deletedAt: null,
      },
    }),
  ]);

  const result = {
    conversations: conversations.map((conv) => ({
      id: conv.id,
      projectId: conv.projectId,
      userId: conv.userId,
      title: conv.title,
      messageCount: conv._count.messages,
      lastMessage:
        includeMessages && conv.messages.length > 0
          ? {
              role: conv.messages[0].role,
              content: conv.messages[0].content.substring(0, 100),
              createdAt: conv.messages[0].createdAt,
            }
          : null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Cache result for 2 minutes
  setCached(cacheKey, result, 120);

  return result;
};

/**
 * Get conversation with messages
 * GET /api/v1/projects/:projectId/conversations/:conversationId
 */
export const getConversationWithMessages = async (
  projectId,
  conversationId,
  userId,
  includeSystem = false,
  messageLimit = 100
) => {
  // Validate project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  // Get conversation and verify it belongs to project and user
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  if (conversation.projectId !== projectId || conversation.userId !== userId) {
    throw new ForbiddenError('User does not have access to this conversation');
  }

  if (conversation.deletedAt) {
    throw new NotFoundError('Conversation', conversationId);
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(includeSystem ? {} : { role: { not: 'system' } }),
    },
    take: messageLimit,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      tokensUsed: true,
      model: true,
      createdAt: true,
    },
  });

  return {
    id: conversation.id,
    projectId: conversation.projectId,
    title: conversation.title,
    messages,
    messageCount: messages.length,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

/**
 * Save message to database
 */
export const saveMessage = async (
  conversationId,
  role,
  content,
  tokensUsed = null,
  model = null
) => {
  if (!content || content.length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }

  if (content.length > 10000) {
    throw new BadRequestError('Message content must be less than 10000 characters');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      tokensUsed,
      model,
    },
    select: {
      id: true,
      conversationId: true,
      role: true,
      content: true,
      tokensUsed: true,
      model: true,
      createdAt: true,
    },
  });

  // Update conversation updated_at timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
};

/**
 * Send chat message and get response
 * POST /api/v1/projects/:projectId/conversations/:conversationId/messages
 */
export const sendChatMessage = async (projectId, conversationId, userMessage, userId) => {
  // Validate project and conversation exist and belong to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  if (conversation.projectId !== projectId || conversation.userId !== userId) {
    throw new ForbiddenError('User does not have access to this conversation');
  }

  if (conversation.deletedAt) {
    throw new NotFoundError('Conversation', conversationId);
  }

  // Validate message content
  if (!userMessage || userMessage.trim().length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }

  if (userMessage.length > 10000) {
    throw new BadRequestError('Message content must be less than 10000 characters');
  }

  // Save user message
  const savedUserMessage = await saveMessage(conversationId, 'user', userMessage);

  try {
    // Get system prompt
    const systemPrompt = await getActiveSystemPrompt(projectId);

    // Get conversation history
    const history = await getConversationHistory(conversationId, 10);

    console.log('\n\n🚀🚀🚀 [sendChatMessage] ABOUT TO CALL AI API 🚀🚀🚀');
    console.log('   Project model:', project.model);
    console.log('   Project temperature:', project.temperature);
    console.log('   Project maxTokens:', project.maxTokens);
    console.log('   System prompt:', systemPrompt.substring(0, 100) + '...');
    console.log('   User message:', userMessage.substring(0, 100) + '...');
    console.log('   History messages:', history.length);

    let assistantContent;
    let aiError = null;
    
    // Try OpenRouter first (production-ready)
    try {
      const { callOpenRouterWithContext } = await import('./openrouter.service.js');
      console.log('   🔵 Attempting to call OpenRouter...');
      assistantContent = await callOpenRouterWithContext(
        project,
        userMessage,
        history,
        systemPrompt
      );
      console.log('   🟢 OpenRouter call succeeded');
      console.log('✅ [sendChatMessage] OpenRouter succeeded');
    } catch (openrouterError) {
      console.log('⚠️  [sendChatMessage] OpenRouter failed, trying Local LLM for development...');
      console.log('   Error:', openrouterError.message);
      aiError = openrouterError;
      
      // Fall back to Local LLM for development
      try {
        const { callLocalLLM } = await import('./local-llm.service.js');
        console.log('   🔵 Attempting to call Local LLM...');
        assistantContent = await callLocalLLM(userMessage, history, systemPrompt);
        console.log('   🟢 Local LLM call succeeded');
        console.log('✅ [sendChatMessage] Local LLM succeeded (after OpenRouter failure)');
        aiError = null; // Clear error since Local LLM succeeded
      } catch (localError) {
        console.log('❌ [sendChatMessage] Both OpenRouter and Local LLM failed');
        aiError = localError;
        assistantContent = "I encountered an issue processing your message. Your message has been saved. Please try again shortly.";
      }
    }

    console.log('📝 [sendChatMessage] Assistant response type:', typeof assistantContent);
    console.log('📝 [sendChatMessage] Assistant response length:', assistantContent?.length);
    console.log('📝 [sendChatMessage] Assistant response:', assistantContent?.substring(0, 100) + '...');
    
    if (!assistantContent || assistantContent.trim().length === 0) {
      console.error('❌ [sendChatMessage] AI returned empty response!');
      aiError = aiError || new Error('AI API returned empty response');
      assistantContent = "I encountered an issue processing your message. Your message has been saved. Please try again shortly.";
    }
  

    // Save assistant message
    console.log('💾 [sendChatMessage] About to save assistant message with content:', {
      length: assistantContent?.length,
      preview: assistantContent?.substring(0, 100),
      isEmpty: !assistantContent || assistantContent.trim().length === 0,
    });
    
    const savedAssistantMessage = await saveMessage(
      conversationId,
      'assistant',
      assistantContent,
      null,
      project.model
    );

    console.log('💾 [sendChatMessage] Assistant message saved successfully:', {
      id: savedAssistantMessage.id,
      role: savedAssistantMessage.role,
      contentLength: savedAssistantMessage.content?.length,
      contentPreview: savedAssistantMessage.content?.substring(0, 100),
    });

    console.log('✅ [sendChatMessage] Message processed successfully');

    // Auto-generate title if first exchange
    if (savedUserMessage.id && !conversation.title.startsWith('Conversation')) {
      // Title already set, skip auto-generation
    } else if (savedUserMessage.id) {
      // Only attempt auto-title on first message
      const messageCount = await prisma.message.count({
        where: { conversationId },
      });

      if (messageCount === 2) {
        // First user message + assistant response
        try {
          const generatedTitle = await generateConversationTitle(
            userMessage,
            assistantContent
          );
          if (generatedTitle) {
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { title: generatedTitle },
            });
          }
        } catch (error) {
          console.warn('⚠️ [sendChatMessage] Failed to auto-generate title:', error.message);
        }
      }
    }

    // Invalidate conversation cache
    invalidateUserConversationsCache(userId);

    return {
      success: !aiError,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messageCount: 2,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error('❌ [sendChatMessage] Error:', error.message);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

/**
 * Generate conversation title using AI
 */
async function generateConversationTitle(userMessage, assistantMessage) {
  try {
    const { callOpenRouter } = await import('./openrouter.service.js');

    const titlePrompt = `Generate a concise 3-5 word title for this conversation. Respond with only the title, no quotes or punctuation.

User: ${userMessage.substring(0, 200)}
Assistant: ${assistantMessage.substring(0, 200)}`;

    const title = await callOpenRouter('openai/gpt-3.5-turbo', [
      { role: 'system', content: 'You are a title generator. Generate short, concise titles.' },
      { role: 'user', content: titlePrompt }
    ], 0.5, 20);
    return title.trim().substring(0, 200);
  } catch (error) {
    console.warn('⚠️  [generateConversationTitle] Failed to generate title:', error.message);
    return null;
  }
}

/**
 * Delete conversation (soft delete)
 * DELETE /api/v1/projects/:projectId/conversations/:conversationId
 */
export const deleteConversation = async (projectId, conversationId, userId) => {
  // Validate ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  if (conversation.projectId !== projectId || conversation.userId !== userId) {
    throw new ForbiddenError('User does not have access to this conversation');
  }

  // Soft delete
  const deleted = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  // Invalidate cache
  invalidateUserConversationsCache(userId);

  return deleted;
};

/**
 * Update conversation title
 * PATCH /api/v1/projects/:projectId/conversations/:conversationId
 */
export const updateConversationTitle = async (projectId, conversationId, userId, title) => {
  // Validate ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  if (conversation.projectId !== projectId || conversation.userId !== userId) {
    throw new ForbiddenError('User does not have access to this conversation');
  }

  if (conversation.deletedAt) {
    throw new NotFoundError('Conversation', conversationId);
  }

  // Validate title
  if (!title || title.trim().length === 0) {
    throw new BadRequestError('Title cannot be empty');
  }

  if (title.length > 200) {
    throw new BadRequestError('Title must be less than 200 characters');
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title: title.trim(),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  // Invalidate cache
  invalidateUserConversationsCache(userId);

  return updated;
};

/**
 * Stop streaming and save partial response
 */
export const savePartialResponse = async (
  projectId,
  conversationId,
  userId,
  partialContent,
  tokensUsed = null
) => {
  // Validate ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project', projectId);
  }

  if (project.userId !== userId) {
    throw new ForbiddenError('User does not own this project');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation', conversationId);
  }

  if (conversation.projectId !== projectId || conversation.userId !== userId) {
    throw new ForbiddenError('User does not have access to this conversation');
  }

  if (conversation.deletedAt) {
    throw new NotFoundError('Conversation', conversationId);
  }

  const message = await saveMessage(
    conversationId,
    'assistant',
    partialContent,
    tokensUsed,
    project.model
  );

  return {
    ...message,
    stopped: true,
  };
}
