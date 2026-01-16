/**
 * OpenRouter.ai Integration Service
 * 
 * Uses the official OpenAI SDK with OpenRouter's base URL
 * - Server-side only (never expose to frontend)
 * - Secure API key handling
 * - Proper error handling
 * - Production-ready
 */

import OpenAI from 'openai';

// Initialize OpenAI client configured for OpenRouter
const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
    'X-Title': process.env.APP_NAME || 'AI Companion Studio',
  },
});

/**
 * Validate OpenRouter configuration
 * Throws error if API key is not configured
 */
const validateConfig = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ [OpenRouter] OPENROUTER_API_KEY not configured');
    throw new Error('AI service is not configured on the server');
  }
};

/**
 * Call OpenRouter.ai chat completions API using OpenAI SDK
 * 
 * @param {string} model - Model name (e.g., 'openai/gpt-4-turbo', 'anthropic/claude-3-opus')
 * @param {Array} messages - Message history with role and content
 * @param {number} temperature - Temperature for response randomness (0-2)
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} Assistant message content
 */
export const callOpenRouter = async (
  model = 'openai/gpt-4-turbo',
  messages = [],
  temperature = 0.7,
  maxTokens = 2000
) => {
  try {
    // Validate configuration
    validateConfig();

    // Validate inputs
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    console.log(`✅ [OpenRouter] Calling API with model: ${model}`);
    console.log(`📨 [OpenRouter] Messages: ${messages.length} message(s)`);

    // Call OpenRouter via OpenAI SDK
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const assistantMessage = response.choices[0].message.content;

    console.log(`📊 [OpenRouter] Response received:`, JSON.stringify({
      model: response.model,
      finishReason: response.choices[0].finish_reason,
      messageContent: assistantMessage?.substring(0, 100),
      tokensUsed: response.usage.total_tokens,
    }));
    console.log(`📊 [OpenRouter] Tokens used: { prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens} }`);
    console.log('✅ [OpenRouter] API call successful');

    return assistantMessage;
  } catch (error) {
    // Handle specific error types
    if (error.status === 429) {
      console.error('⚠️  [OpenRouter] Rate limited (429)');
      throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
    }

    if (error.status === 401 || error.status === 403) {
      console.error('❌ [OpenRouter] Authentication failed (401/403)');
      console.error('   API Key valid?', process.env.OPENROUTER_API_KEY ? 'YES' : 'NO');
      throw new Error('OpenRouter API key is invalid or unauthorized');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('❌ [OpenRouter] Connection error:', error.message);
      throw new Error('Failed to connect to OpenRouter API. Check your internet connection.');
    }

    console.error('❌ [OpenRouter] API Error Details:', {
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      response: error.response?.data || 'No response data',
    });
    throw error;
  }
};

/**
 * Call OpenRouter with project context
 * Includes system prompt and conversation history
 * 
 * @param {object} project - Project object with model, temperature, maxTokens
 * @param {string} userMessage - User's message
 * @param {array} conversationHistory - Previous messages
 * @param {string} systemPrompt - System prompt for the assistant
 * @returns {Promise<string>} Assistant message
 */
export const callOpenRouterWithContext = async (
  project,
  userMessage,
  conversationHistory = [],
  systemPrompt = 'You are a helpful AI assistant.'
) => {
  try {
    // Build message array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenRouter
    const response = await callOpenRouter(
      project.model || 'openai/gpt-4-turbo',
      messages,
      project.temperature || 0.7,
      project.maxTokens || 2000
    );

    return response;
  } catch (error) {
    console.error('❌ [OpenRouter] Context call failed:', error.message);
    throw error;
  }
};

/**
 * Get available models (reference)
 * This is just a reference list - OpenRouter supports many more
 */
export const getAvailableModels = () => {
  return [
    // OpenAI models
    'openai/gpt-4-turbo',
    'openai/gpt-4',
    'openai/gpt-3.5-turbo',

    // Anthropic models
    'anthropic/claude-3-opus-20250219',
    'anthropic/claude-3-sonnet-20250229',

    // Meta models
    'meta-llama/llama-3.1-405b',

    // Mistral models
    'mistralai/mistral-large',
  ];
};

/**
 * Export the OpenAI client instance for direct access if needed
 */
export default openai;
