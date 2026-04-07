// src/controllers/chat.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as chatService from '../services/chat.service.js';
import * as quotaService from '../services/quota.service.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Get all conversations for project
 * GET /api/v1/projects/:projectId/conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;
  
  const page = Math.max(1, parseInt(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 50)));
  const sortBy = req.query.sort_by || 'updated_at';
  const sortOrder = (req.query.sort_order || 'desc').toLowerCase();
  const includeMessages = req.query.include_messages === 'true';

  if (!['asc', 'desc'].includes(sortOrder)) {
    throw new BadRequestError('Invalid sort_order parameter');
  }

  const result = await chatService.getProjectConversations(
    projectId,
    userId,
    page,
    limit,
    sortBy,
    sortOrder,
    includeMessages
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Create new conversation
 * POST /api/v1/projects/:projectId/conversations
 */
export const createConversation = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;
  const { title } = req.body;

  const conversation = await chatService.createConversation(projectId, userId, title);

  res.status(201).json({
    success: true,
    data: conversation,
  });
});

/**
 * Get conversation with messages
 * GET /api/v1/projects/:projectId/conversations/:conversationId
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const userId = req.user.userId;
  const includeSystem = req.query.include_system === 'true';
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit || 100)));

  const conversation = await chatService.getConversationWithMessages(
    projectId,
    conversationId,
    userId,
    includeSystem,
    limit
  );

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * Send message and get AI response
 * POST /api/v1/projects/:projectId/conversations/:conversationId/messages
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { content, stream } = req.body;
  const userId = req.user.userId;

  console.log(`\n📨 [sendMessage] NEW MESSAGE REQUEST`);
  console.log(`   Project: ${projectId}`);
  console.log(`   Conversation: ${conversationId}`);
  console.log(`   User: ${userId}`);
  console.log(`   Content: ${content?.substring(0, 50)}...`);

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }

  // Check quota
  console.log(`🔍 [sendMessage] Checking quota for user ${userId}...`);
  const quotaCheck = await quotaService.checkChatQuota(userId);
  console.log(`✅ [sendMessage] Quota check passed:`, quotaCheck);

  // Send message and get response
  console.log(`📤 [sendMessage] Calling chatService.sendChatMessage...`);
  const result = await chatService.sendChatMessage(
    projectId,
    conversationId,
    content,
    userId
  );

  console.log(`✅ [sendMessage] Got result from chatService:`, {
    userMessageId: result.userMessage?.id,
    userMessageContent: result.userMessage?.content?.substring(0, 50),
    userMessageRole: result.userMessage?.role,
    assistantMessageId: result.assistantMessage?.id,
    assistantMessageContent: result.assistantMessage?.content?.substring(0, 50),
    assistantMessageRole: result.assistantMessage?.role,
    assistantMessageNull: result.assistantMessage === null,
    assistantMessageUndefined: result.assistantMessage === undefined,
  });

  // Increment usage
  console.log(`📊 [sendMessage] Incrementing chat usage for user ${userId}...`);
  const updatedQuota = await quotaService.incrementChatUsage(userId);
  console.log(`✅ [sendMessage] Usage incremented:`, updatedQuota);

  const response = {
    success: result.success ?? true,
    data: {
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
      conversation: result.conversation,
    },
    quota: {
      used: updatedQuota.chatUsageCount,
      limit: updatedQuota.chatLimit,
      remaining: updatedQuota.remaining,
    },
  };

  console.log(`📤 [sendMessage] Sending response to client:`, {
    success: response.success,
    userMessageId: response.data?.userMessage?.id,
    assistantMessageId: response.data?.assistantMessage?.id,
  });

  res.status(200).json(response);
});

/**
 * Stop streaming and save partial response
 * POST /api/v1/projects/:projectId/conversations/:conversationId/stop
 */
export const stopStreaming = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { partialContent } = req.body;
  const userId = req.user.userId;

  if (!partialContent || partialContent.trim().length === 0) {
    throw new BadRequestError('Partial content cannot be empty');
  }

  const message = await chatService.savePartialResponse(
    projectId,
    conversationId,
    userId,
    partialContent
  );

  res.status(200).json({
    success: true,
    data: message,
  });
});

/**
 * Update conversation title
 * PATCH /api/v1/projects/:projectId/conversations/:conversationId
 */
export const updateConversation = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { title } = req.body;
  const userId = req.user.userId;

  if (!title) {
    throw new BadRequestError('Title is required');
  }

  const conversation = await chatService.updateConversationTitle(
    projectId,
    conversationId,
    userId,
    title
  );

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * Delete conversation (soft delete)
 * DELETE /api/v1/projects/:projectId/conversations/:conversationId
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const userId = req.user.userId;

  const deleted = await chatService.deleteConversation(projectId, conversationId, userId);

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
    data: deleted,
  });
});

/**
 * Stream chat response using SSE
 * GET /api/v1/projects/:projectId/chat/stream
 */
export const streamChat = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { message } = req.query;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  try {
    // Get project and conversation
    const project = await chatService.getConversationWithMessages(conversationId);
    const systemPrompt = await chatService.getActiveSystemPrompt(projectId);
    const history = await chatService.getConversationHistory(conversationId, 10);

    // Save user message
    await chatService.saveMessage(conversationId, 'user', message);

    // Stream response (implementation depends on Gemini API)
    res.write('data: {"status": "streaming"}\n\n');

    // For now, send a complete response
    // TODO: Implement actual streaming with Gemini API
    const result = await chatService.sendChatMessage(projectId, conversationId, message);

    res.write(`data: ${JSON.stringify(result.assistantMessage)}\n\n`);
    res.write('data: {"status": "complete"}\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
