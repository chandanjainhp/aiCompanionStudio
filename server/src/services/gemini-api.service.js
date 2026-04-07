import { config } from '../config/env.js';

const GEMINI_API_URL = config.geminiEndpoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Call Google Gemini API directly
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {string} systemPrompt - System instructions for the model
 * @returns {Promise<string>} - AI response text
 */
export const callGeminiAPI = async (userMessage, conversationHistory = [], systemPrompt = '') => {
  try {
    // Validate API key
    if (!config.googleApiKey) {
      console.error('❌ [Gemini] Missing GOOGLE_API_KEY in environment');
      throw new Error('Gemini API key not configured');
    }

    // Build message content
    const parts = [];

    // Add system prompt if provided
    if (systemPrompt) {
      parts.push({ text: systemPrompt + '\n\n' });
    }

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        parts.push({ text: `${msg.role}: ${msg.content}\n` });
      }
    }

    // Add current user message
    parts.push({ text: `user: ${userMessage}` });

    // Construct request body
    const requestBody = {
      contents: [
        {
          parts: [{ text: parts.map(p => p.text).join('') }],
        },
      ],
    };

    console.log('📡 [Gemini] Calling API with URL:', GEMINI_API_URL);
    console.log('🔑 [Gemini] Using API key:', config.googleApiKey.substring(0, 10) + '...');

    // Make API call
    const response = await fetch(`${GEMINI_API_URL}?key=${config.googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 [Gemini] Response status:', response.status);

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      const errorData = tryParseJSON(errorText);

      console.error('❌ [Gemini] API Error:');
      console.error('  Status:', response.status);
      console.error('  StatusText:', response.statusText);
      console.error('  Body:', errorData || errorText);

      // Handle specific error codes
      if (response.status === 403) {
        throw new Error('Gemini API: Invalid API key or insufficient permissions (403 Forbidden)');
      } else if (response.status === 429) {
        throw new Error('Gemini API: Rate limit exceeded (429 Too Many Requests)');
      } else if (response.status === 400) {
        throw new Error(`Gemini API: Invalid request format (400 Bad Request) - ${errorData?.error?.message || 'Check your message format'}`);
      } else {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
    }

    // Parse response
    const data = await response.json();
    console.log('✅ [Gemini] Response received:', {
      candidates: data.candidates?.length || 0,
      hasContent: !!data.candidates?.[0]?.content,
    });

    // Extract AI response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('❌ [Gemini] No response text in API response');
      console.error('Response structure:', JSON.stringify(data, null, 2));
      throw new Error('No response generated from Gemini API');
    }

    console.log('📝 [Gemini] AI Response (first 100 chars):', aiResponse.substring(0, 100) + '...');

    return aiResponse;
  } catch (error) {
    console.error('❌ [Gemini] Fatal error:', error.message);
    throw error;
  }
};

/**
 * Test Gemini API connection
 * @returns {Promise<Object>} - Test result
 */
export const testGeminiAPI = async () => {
  const testMessage = 'Hello, how are you?';

  try {
    console.log('🧪 [Gemini] Starting API test...');
    const response = await callGeminiAPI(testMessage);

    return {
      success: true,
      message: 'Gemini API is working correctly',
      testMessage,
      response: response.substring(0, 200),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Gemini API test failed',
      error: error.message,
      details: {
        apiUrl: GEMINI_API_URL,
        hasApiKey: !!config.googleApiKey,
        apiKeyPrefix: config.googleApiKey?.substring(0, 10),
      },
    };
  }
};

/**
 * Helper: Try to parse JSON safely
 */
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
