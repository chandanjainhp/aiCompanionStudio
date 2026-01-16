// src/routes/project.router.js
import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import { verifyJWT, verifyProjectOwnership } from '../middlewares/auth.middle.js';
import { apiRateLimiter } from '../middlewares/rate-limit.js';
import {
  validateCreateProject,
  validateUpdateProject,
  handleValidationErrors,
  validateObjectId,
} from '../utils/validation.js';
import chatRouter from './chat.router.js';
import promptRouter from './prompt.router.js';
import fileRouter from './file.router.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT, apiRateLimiter);

/**
 * Project CRUD routes
 */
router.get('/', projectController.getAllProjects);

router.post(
  '/',
  validateCreateProject,
  handleValidationErrors,
  projectController.createProject
);

router.get(
  '/:id',
  validateObjectId('id'),
  handleValidationErrors,
  projectController.getProjectById
);

router.get(
  '/:id/statistics',
  validateObjectId('id'),
  handleValidationErrors,
  projectController.getProjectStatistics
);

router.put(
  '/:id',
  validateObjectId('id'),
  validateUpdateProject,
  handleValidationErrors,
  projectController.updateProject
);

router.delete(
  '/:id',
  validateObjectId('id'),
  handleValidationErrors,
  projectController.deleteProject
);

/**
 * Nested routers for project resources
 */
router.use('/:projectId/prompts', verifyProjectOwnership, promptRouter);
router.use('/:projectId/conversations', verifyProjectOwnership, chatRouter);
router.use('/:projectId/files', verifyProjectOwnership, fileRouter);

export default router;
