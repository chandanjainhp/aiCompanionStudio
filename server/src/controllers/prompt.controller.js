// src/controllers/prompt.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as promptService from '../services/prompt.service.js';

/**
 * Get all prompts for project
 * GET /api/v1/projects/:projectId/prompts
 */
export const getPrompts = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const prompts = await promptService.getProjectPrompts(projectId);

  res.status(200).json({
    success: true,
    data: prompts,
  });
});

/**
 * Get active prompt
 * GET /api/v1/projects/:projectId/prompts/active
 */
export const getActivePrompt = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const prompt = await promptService.getActivePrompt(projectId);

  res.status(200).json({
    success: true,
    data: prompt,
  });
});

/**
 * Create new prompt
 * POST /api/v1/projects/:projectId/prompts
 */
export const createPrompt = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const prompt = await promptService.createPrompt(projectId, content);

  res.status(201).json({
    success: true,
    message: 'Prompt created successfully',
    data: prompt,
  });
});

/**
 * Update prompt
 * PUT /api/v1/projects/:projectId/prompts/:promptId
 */
export const updatePrompt = asyncHandler(async (req, res) => {
  const { projectId, promptId } = req.params;
  const { content } = req.body;

  const prompt = await promptService.updatePrompt(projectId, promptId, content);

  res.status(200).json({
    success: true,
    message: 'Prompt updated successfully',
    data: prompt,
  });
});

/**
 * Delete prompt
 * DELETE /api/v1/projects/:projectId/prompts/:promptId
 */
export const deletePrompt = asyncHandler(async (req, res) => {
  const { projectId, promptId } = req.params;

  await promptService.deletePrompt(projectId, promptId);

  res.status(200).json({
    success: true,
    message: 'Prompt deleted successfully',
  });
});

/**
 * Set active prompt
 * PUT /api/v1/projects/:projectId/prompts/:promptId/activate
 */
export const activatePrompt = asyncHandler(async (req, res) => {
  const { projectId, promptId } = req.params;

  const prompt = await promptService.setActivePrompt(projectId, promptId);

  res.status(200).json({
    success: true,
    message: 'Prompt activated successfully',
    data: prompt,
  });
});
