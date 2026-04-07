// src/services/file.service.js
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Get all files for a project
 */
export const getProjectFiles = async (projectId, skip = 0, take = 10) => {
  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where: { projectId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.file.count({ where: { projectId } }),
  ]);

  return {
    files,
    pagination: { total, skip, take, pages: Math.ceil(total / take) },
  };
};

/**
 * Get file by ID with user verification
 */
export const getFile = async (fileId, projectId, userId) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      project: true,
    },
  });

  if (!file) {
    throw new NotFoundError('File');
  }

  if (file.projectId !== projectId || file.project.userId !== userId) {
    throw new Error('Unauthorized: File does not belong to this project');
  }

  return file;
};

/**
 * Create file record with Cloudinary support
 */
export const createFile = async (projectId, userId, fileData) => {
  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== userId) {
    throw new Error('Unauthorized: Project does not belong to this user');
  }

  const file = await prisma.file.create({
    data: {
      projectId,
      filename: fileData.filename,
      originalName: fileData.originalName,
      mimeType: fileData.mimeType,
      size: fileData.size,
      path: fileData.path || null,
      cloudinaryUrl: fileData.cloudinaryUrl,
      cloudinaryPublicId: fileData.cloudinaryPublicId,
    },
  });

  return file;
};

/**
 * Delete file from database (Cloudinary deletion handled in controller)
 */
export const deleteFile = async (fileId, projectId, userId) => {
  const file = await getFile(fileId, projectId, userId);

  // Delete from database
  await prisma.file.delete({
    where: { id: fileId },
  });

  return { success: true };
};
