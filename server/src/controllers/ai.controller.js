import { asyncHandler } from '../utils/asyncHandler.js';
import { callGeminiAPI, testGeminiAPI } from '../services/gemini-api.service.js';
import * as quotaService from '../services/quota.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Test Gemini API connection
 * GET /api/v1/ai/test
 */
export const testAI = asyncHandler(async (req, res) => {
  const result = await testGeminiAPI();

  if (result.success) {
    res.status(200).json(new ApiResponse(200, result, result.message));
  } else {
    res.status(400).json(new ApiResponse(400, result, result.message));
  }
});

/**
 * Send message to Gemini AI
 * POST /api/v1/ai/chat
 * Body: { message: string, conversationHistory?: Array, systemPrompt?: string }
 * ✅ WITH QUOTA ENFORCEMENT
 */
export const sendAIMessage = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [], systemPrompt = '' } = req.body;
  const userId = req.user.userId;

  // Validate input
  if (!message || typeof message !== 'string') {
    throw new ApiError(400, 'Message is required and must be a string');
  }

  try {
    // ✅ QUOTA CHECK: Verify user hasn't exceeded chat limit
    console.log(`🔍 [sendAIMessage] Checking quota for user ${userId}...`);
    const quotaCheck = await quotaService.checkChatQuota(userId);
    console.log(`✅ [sendAIMessage] Quota check passed:`, quotaCheck);

    console.log('📨 [Controller] Processing AI message request');
    const aiResponse = await callGeminiAPI(message, conversationHistory, systemPrompt);

    // ✅ INCREMENT USAGE: Atomic increment after successful AI response
    console.log(`📊 [sendAIMessage] Incrementing chat usage for user ${userId}...`);
    const updatedQuota = await quotaService.incrementChatUsage(userId);
    console.log(`✅ [sendAIMessage] Usage incremented:`, updatedQuota);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          response: aiResponse,
          quota: {
            used: updatedQuota.chatUsageCount,
            limit: updatedQuota.chatLimit,
            remaining: updatedQuota.remaining,
          },
        },
        'AI response generated successfully'
      )
    );
  } catch (error) {
    console.error('❌ [Controller] AI request failed:', error.message);
    throw new ApiError(500, `AI service error: ${error.message}`);
  }
});

/**
 * Stream AI response using Server-Sent Events
 * POST /api/v1/ai/stream
 * ✅ WITH QUOTA ENFORCEMENT
 */
export const streamAIMessage = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [], systemPrompt = '' } = req.body;
  const userId = req.user.userId;

  // Validate input
  if (!message || typeof message !== 'string') {
    throw new ApiError(400, 'Message is required and must be a string');
  }

  try {
    // ✅ QUOTA CHECK: Verify user hasn't exceeded chat limit BEFORE streaming
    console.log(`🔍 [streamAIMessage] Checking quota for user ${userId}...`);
    const quotaCheck = await quotaService.checkChatQuota(userId);
    console.log(`✅ [streamAIMessage] Quota check passed:`, quotaCheck);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection message
    res.write('data: {"status":"connected"}\n\n');

    console.log('🔴 [Controller] Starting stream for AI message');

    // Call Gemini API
    const aiResponse = await callGeminiAPI(message, conversationHistory, systemPrompt);

    // ✅ INCREMENT USAGE: Atomic increment after successful AI response
    console.log(`📊 [streamAIMessage] Incrementing chat usage for user ${userId}...`);
    const updatedQuota = await quotaService.incrementChatUsage(userId);
    console.log(`✅ [streamAIMessage] Usage incremented:`, updatedQuota);

    // Send response in chunks for streaming effect
    const chunkSize = 20;
    for (let i = 0; i < aiResponse.length; i += chunkSize) {
      const chunk = aiResponse.substring(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      // Add small delay between chunks for streaming effect
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Send completion with quota info
    res.write(
      `data: ${JSON.stringify({
        chunk: '',
        done: true,
        quota: {
          used: updatedQuota.chatUsageCount,
          limit: updatedQuota.chatLimit,
          remaining: updatedQuota.remaining,
        },
      })}\n\n`
    );
    res.end();

    console.log('✅ [Controller] Stream completed');
  } catch (error) {
    console.error('❌ [Controller] Stream failed:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
});
