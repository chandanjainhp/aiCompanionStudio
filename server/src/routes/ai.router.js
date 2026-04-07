import { Router } from 'express';
import { testAI, sendAIMessage, streamAIMessage } from '../controllers/ai.controller.js';
import { verifyJWT } from '../middlewares/auth.middle.js';

const router = Router();

/**
 * Test the AI API connection
 * GET /api/v1/ai/test
 * No auth required - can be used for diagnostics
 */
router.get('/test', testAI);

/**
 * Send a message to AI and get response
 * POST /api/v1/ai/chat
 * Auth: Required (JWT)
 * Body: { message: string, conversationHistory?: Array, systemPrompt?: string }
 */
router.post('/chat', verifyJWT, sendAIMessage);

/**
 * Stream AI response using Server-Sent Events
 * POST /api/v1/ai/stream
 * Auth: Required (JWT)
 * Body: { message: string, conversationHistory?: Array, systemPrompt?: string }
 */
router.post('/stream', verifyJWT, streamAIMessage);

export default router;
