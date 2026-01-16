import { config } from '../config/env.js';

/**
 * Call Local LLM API (OpenAI-compatible format)
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {string} systemPrompt - System instructions
 * @returns {Promise<string>} - AI response text
 */
export const callLocalLLM = async (userMessage, conversationHistory = [], systemPrompt = '') => {
  try {
    if (!config.localLLMEnabled) {
      throw new Error('Local LLM is disabled');
    }

    if (!config.localLLMEndpoint) {
      throw new Error('Local LLM endpoint not configured');
    }

    // Build messages array in OpenAI format
    const messages = [];

    // Add system prompt
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('📡 [LocalLLM] Calling API at:', config.localLLMEndpoint);
    console.log('🤖 [LocalLLM] Using model:', config.localLLMModel);

    // Make API call
    const response = await fetch(config.localLLMEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.localLLMModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    console.log('📥 [LocalLLM] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = tryParseJSON(errorText);

      console.error('❌ [LocalLLM] API Error:');
      console.error('  Status:', response.status);
      console.error('  Body:', errorData || errorText);

      throw new Error(`Local LLM API error: ${response.status} ${response.statusText}`);
    }

    // Parse response
    const data = await response.json();
    console.log('✅ [LocalLLM] Response received');

    // Extract AI response (OpenAI format)
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ [LocalLLM] No response text in API response');
      console.error('Response structure:', JSON.stringify(data, null, 2));
      throw new Error('No response generated from Local LLM');
    }

    console.log('📝 [LocalLLM] AI Response (first 100 chars):', aiResponse.substring(0, 100) + '...');
    return aiResponse;
  } catch (error) {
    console.error('❌ [LocalLLM] Error:', error.message);
    throw error;
  }
};

// Helper function
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
