// src/controllers/project.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import * as projectService from '../services/project.service.js';
import { transformProjectForAPI, transformProjectsForAPI, validateTransformedProject } from '../utils/transformers.js';

/**
 * Get all user projects
 * GET /api/v1/projects
 * 
 * Returns: { projects: Project[], pagination: {...} }
 * Every project includes conversationCount (REQUIRED)
 */
export const getAllProjects = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const skip = parseInt(req.query.skip || 0);
  const take = parseInt(req.query.take || 10);

  const result = await projectService.getUserProjects(userId, skip, take);

  // TRANSFORM: Ensure all projects have canonical format
  const transformedProjects = result.projects.map((project) => {
    const transformed = transformProjectForAPI(project, project.conversationCount || project._count?.conversations || 0);
    validateTransformedProject(transformed);
    return transformed;
  });

  res.status(200).json({
    success: true,
    data: {
      projects: transformedProjects,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total: result.pagination.total,
        totalPages: Math.ceil(result.pagination.total / take),
      },
    },
  });
});

/**
 * Get single project
 * GET /api/v1/projects/:id
 * 
 * Returns: Project (with all fields including conversationCount)
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const project = await projectService.getProjectById(id, userId);

  // TRANSFORM: Ensure canonical format
  const transformed = transformProjectForAPI(project, project.conversationCount || project._count?.conversations || 0);
  validateTransformedProject(transformed);

  res.status(200).json({
    success: true,
    data: transformed,
  });
});

/**
 * Create new project
 * POST /api/v1/projects
 * 
 * Returns: Project (with conversationCount: 0 for new projects)
 */
export const createProject = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, description, model, temperature, maxTokens, systemPrompt } = req.body;

  const project = await projectService.createProject(userId, {
    name,
    description,
    model,
    temperature,
    maxTokens,
    systemPrompt,
  });

  // TRANSFORM: Ensure canonical format (new projects have 0 conversations)
  const transformed = transformProjectForAPI(project, 0);
  validateTransformedProject(transformed);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: transformed,
  });
});

/**
 * Update project
 * PUT /api/v1/projects/:id
 * 
 * Returns: Project (fully updated with all fields)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { name, description, model, temperature, maxTokens, systemPrompt } = req.body;

  const updatedProject = await projectService.updateProject(id, userId, {
    name,
    description,
    model,
    temperature,
    maxTokens,
    systemPrompt,
  });

  // TRANSFORM: Ensure canonical format
  const transformed = transformProjectForAPI(updatedProject, updatedProject.conversationCount || updatedProject._count?.conversations || 0);
  validateTransformedProject(transformed);

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: transformed,
  });
});

/**
 * Delete project (soft delete)
 * DELETE /api/v1/projects/:id
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const result = await projectService.deleteProject(id, userId);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
    data: result,
  });
});

/**
 * Get project statistics
 * GET /api/v1/projects/:id/statistics
 */
export const getProjectStatistics = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const stats = await projectService.getProjectStatistics(id, userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
});
