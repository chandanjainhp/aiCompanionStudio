// src/services/project.service.js
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getCached, setCached, invalidateUserProjectsCache, CACHE_KEYS } from '../utils/cache.js';

/**
 * Get all projects for a user with basic stats (Phase 1 MVP)
 * Includes conversation count via JOIN query
 * Phase 2: Now with in-memory caching
 */
export const getUserProjects = async (userId, skip = 0, take = 10) => {
  // Create cache key for this user and page
  const cacheKey = CACHE_KEYS.USER_PROJECTS(userId, Math.floor(skip / take));
  
  // Check cache first (2 minute TTL)
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { 
        userId,
        deletedAt: null, // Exclude soft-deleted projects
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        model: true,
        temperature: true,
        maxTokens: true,
        systemPrompt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include conversation count via _count
        _count: {
          select: { 
            conversations: {
              where: { } // Count all conversations
            }
          },
        },
      },
    }),
    prisma.project.count({ 
      where: { 
        userId,
        deletedAt: null, // Only count non-deleted projects
      } 
    }),
  ]);

  // Transform response to include conversationCount
  const transformedProjects = projects.map(project => ({
    ...project,
    conversationCount: project._count.conversations,
    _count: undefined, // Remove _count from response
  }));

  const result = {
    projects: transformedProjects,
    pagination: {
      total,
      skip,
      take,
      pages: Math.ceil(total / take),
    },
  };

  // Cache the result (2 minute TTL for lists)
  setCached(cacheKey, result, 120);

  return result;
};

/**
 * Get single project with stats (Phase 1 MVP)
 * Phase 2: Now with 5 minute caching
 */
export const getProjectById = async (projectId, userId) => {
  // Check cache first
  const cacheKey = CACHE_KEYS.PROJECT(projectId);
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      model: true,
      temperature: true,
      maxTokens: true,
      systemPrompt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      _count: {
        select: { conversations: true }
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project', { projectId });
  }

  // Check ownership
  if (project.userId !== userId) {
    throw new ForbiddenError('You do not own this project', { projectId, userId });
  }

  // Check if soft deleted
  if (project.deletedAt) {
    throw new NotFoundError('Project has been deleted', { projectId });
  }

  // Transform response
  const result = {
    ...project,
    conversationCount: project._count.conversations,
    _count: undefined,
  };

  // Cache the result (5 minute TTL for single projects)
  setCached(cacheKey, result, 300);

  return result;
};

/**
 * Create new project
 * Invalidates user's projects cache
 */
export const createProject = async (userId, data) => {
  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      model: data.model || 'gemini-2.0-flash',
      temperature: data.temperature || 0.7,
      maxTokens: data.maxTokens || 2000,
      systemPrompt: data.systemPrompt || 'You are a helpful AI assistant.',
    },
    select: {
      id: true,
      name: true,
      description: true,
      model: true,
      temperature: true,
      maxTokens: true,
      systemPrompt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Invalidate cache
  invalidateUserProjectsCache(userId);

  return {
    ...project,
    conversationCount: 0,
  };
};

/**
 * Update project
 * Invalidates user's projects cache and project cache
 */
export const updateProject = async (projectId, userId, data) => {
  // Verify ownership and project exists
  const project = await getProjectById(projectId, userId);

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.model && { model: data.model }),
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.maxTokens !== undefined && { maxTokens: data.maxTokens }),
      ...(data.systemPrompt && { systemPrompt: data.systemPrompt }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      model: true,
      temperature: true,
      maxTokens: true,
      systemPrompt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { conversations: true }
      },
    },
  });

  // Invalidate cache
  invalidateUserProjectsCache(userId);

  return {
    ...updatedProject,
    conversationCount: updatedProject._count.conversations,
    _count: undefined,
  };
};

/**
 * Soft delete project (Phase 1 MVP)
 * Just sets deleted_at timestamp
 * Invalidates cache
 */
export const deleteProject = async (projectId, userId) => {
  // Verify ownership and project exists
  await getProjectById(projectId, userId);

  // Soft delete: set deleted_at timestamp
  const deletedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  // Invalidate cache
  invalidateUserProjectsCache(userId);

  return {
    id: deletedProject.id,
    deletedAt: deletedProject.deletedAt,
  };
};

/**
 * Get project statistics
 */
export const getProjectStatistics = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  return {
    projectId,
    conversationCount: project.conversationCount,
    lastActivityAt: project.updatedAt,
  };
};
