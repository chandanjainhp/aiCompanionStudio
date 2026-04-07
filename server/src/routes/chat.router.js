// src/routes/chat.router.js
import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { chatRateLimiter } from '../middlewares/rate-limit.js';
import {
  validateCreateConversation,
  validateCreateMessage,
  handleValidationErrors,
  validateObjectId,
} from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

/**
 * Conversation CRUD routes
 * GET /api/v1/projects/:projectId/conversations
 * POST /api/v1/projects/:projectId/conversations
 * GET /api/v1/projects/:projectId/conversations/:conversationId
 * PATCH /api/v1/projects/:projectId/conversations/:conversationId
 * DELETE /api/v1/projects/:projectId/conversations/:conversationId
 */

// List all conversations for project
router.get(
  '/',
  chatController.getConversations
);

// Create new conversation
router.post(
  '/',
  validateCreateConversation,
  handleValidationErrors,
  chatController.createConversation
);

// Get specific conversation with messages
router.get(
  '/:conversationId',
  validateObjectId('conversationId'),
  handleValidationErrors,
  chatController.getConversation
);

// Update conversation title
router.patch(
  '/:conversationId',
  validateObjectId('conversationId'),
  handleValidationErrors,
  chatController.updateConversation
);

// Delete conversation (soft delete)
router.delete(
  '/:conversationId',
  validateObjectId('conversationId'),
  handleValidationErrors,
  chatController.deleteConversation
);

/**
 * Message routes
 * POST /api/v1/projects/:projectId/conversations/:conversationId/messages
 * POST /api/v1/projects/:projectId/conversations/:conversationId/stop
 * GET /api/v1/projects/:projectId/conversations/:conversationId/stream
 */

// Send message and get AI response
router.post(
  '/:conversationId/messages',
  chatRateLimiter,
  validateObjectId('conversationId'),
  validateCreateMessage,
  handleValidationErrors,
  chatController.sendMessage
);

// Stop streaming response
router.post(
  '/:conversationId/stop',
  validateObjectId('conversationId'),
  handleValidationErrors,
  chatController.stopStreaming
);

// Stream chat response via SSE
router.get(
  '/:conversationId/stream',
  validateObjectId('conversationId'),
  handleValidationErrors,
  chatController.streamChat
);

export default router;
