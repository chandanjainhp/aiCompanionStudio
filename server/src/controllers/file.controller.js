// src/controllers/file.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/errors.js';
import * as fileService from '../services/file.service.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Get all files for project
 * GET /api/v1/projects/:projectId/files
 */
export const getFiles = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const skip = parseInt(req.query.skip || 0);
  const take = parseInt(req.query.take || 10);

  const result = await fileService.getProjectFiles(projectId, skip, take);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Upload file to Cloudinary
 * POST /api/v1/projects/:projectId/files
 */
export const uploadFile = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  if (!req.file) {
    throw new BadRequestError('No file provided');
  }

  // req.file from multer-storage-cloudinary contains cloudinary response
  const cloudinaryFile = req.file;

  // Create file record in database
  const file = await fileService.createFile(projectId, userId, {
    filename: cloudinaryFile.filename || cloudinaryFile.originalname,
    originalName: cloudinaryFile.originalname,
    mimeType: cloudinaryFile.mimetype,
    size: cloudinaryFile.size,
    cloudinaryUrl: cloudinaryFile.path, // URL from Cloudinary
    cloudinaryPublicId: cloudinaryFile.filename, // Public ID for deletion
  });

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: file,
  });
});

/**
 * Download file from Cloudinary
 * GET /api/v1/projects/:projectId/files/:fileId/download
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { projectId, fileId } = req.params;
  const userId = req.user.userId;

  const file = await fileService.getFile(fileId, projectId, userId);

  // Redirect to Cloudinary URL
  res.redirect(file.cloudinaryUrl);
});

/**
 * Delete file from Cloudinary
 * DELETE /api/v1/projects/:projectId/files/:fileId
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const { projectId, fileId } = req.params;
  const userId = req.user.userId;

  const file = await fileService.getFile(fileId, projectId, userId);

  // Delete from Cloudinary
  if (file.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(file.cloudinaryPublicId);
  }

  // Delete from database
  await fileService.deleteFile(fileId, projectId, userId);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
  });
});
