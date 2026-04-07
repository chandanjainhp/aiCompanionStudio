// src/services/prompt.service.js
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Get all prompts for a project
 */
export const getProjectPrompts = async (projectId) => {
  const prompts = await prisma.prompt.findMany({
    where: { projectId },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  });

  return prompts;
};

/**
 * Get active prompt for project
 */
export const getActivePrompt = async (projectId) => {
  const prompt = await prisma.prompt.findFirst({
    where: { projectId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return prompt;
};

/**
 * Create new prompt
 */
export const createPrompt = async (projectId, content) => {
  // Get next version number
  const lastPrompt = await prisma.prompt.findFirst({
    where: { projectId },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (lastPrompt?.version || 0) + 1;

  // Create new prompt
  const prompt = await prisma.prompt.create({
    data: {
      projectId,
      content,
      version: nextVersion,
      isActive: true,
    },
  });

  return prompt;
};

/**
 * Update prompt (deactivate old, create new version)
 */
export const updatePrompt = async (projectId, promptId, newContent) => {
  // Find the prompt to update
  const oldPrompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!oldPrompt) {
    throw new NotFoundError('Prompt');
  }

  if (oldPrompt.projectId !== projectId) {
    throw new Error('Prompt does not belong to this project');
  }

  // Deactivate old prompt
  await prisma.prompt.update({
    where: { id: promptId },
    data: { isActive: false },
  });

  // Create new version
  const newPrompt = await prisma.prompt.create({
    data: {
      projectId,
      content: newContent,
      version: oldPrompt.version + 1,
      isActive: true,
    },
  });

  return newPrompt;
};

/**
 * Delete prompt
 */
export const deletePrompt = async (projectId, promptId) => {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    throw new NotFoundError('Prompt');
  }

  if (prompt.projectId !== projectId) {
    throw new Error('Prompt does not belong to this project');
  }

  await prisma.prompt.delete({
    where: { id: promptId },
  });

  return { success: true };
};

/**
 * Set active prompt
 */
export const setActivePrompt = async (projectId, promptId) => {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    throw new NotFoundError('Prompt');
  }

  if (prompt.projectId !== projectId) {
    throw new Error('Prompt does not belong to this project');
  }

  // Deactivate all other prompts
  await prisma.prompt.updateMany({
    where: { projectId, NOT: { id: promptId } },
    data: { isActive: false },
  });

  // Activate this prompt
  const updated = await prisma.prompt.update({
    where: { id: promptId },
    data: { isActive: true },
  });

  return updated;
};
