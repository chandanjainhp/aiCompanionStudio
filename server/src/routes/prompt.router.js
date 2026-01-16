// src/routes/prompt.router.js
import express from 'express';
import * as promptController from '../controllers/prompt.controller.js';
import {
  validateCreatePrompt,
  validateUpdatePrompt,
  handleValidationErrors,
  validateObjectId,
} from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

/**
 * Prompt routes
 */
router.get('/', promptController.getPrompts);

router.get('/active', promptController.getActivePrompt);

router.post(
  '/',
  validateCreatePrompt,
  handleValidationErrors,
  promptController.createPrompt
);

router.put(
  '/:promptId',
  validateUpdatePrompt,
  handleValidationErrors,
  promptController.updatePrompt
);

router.put(
  '/:promptId/activate',
  validateObjectId('promptId'),
  handleValidationErrors,
  promptController.activatePrompt
);

router.delete(
  '/:promptId',
  validateObjectId('promptId'),
  handleValidationErrors,
  promptController.deletePrompt
);

export default router;
