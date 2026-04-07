// src/routes/file.router.js
import express from 'express';
import * as fileController from '../controllers/file.controller.js';
import { uploadCloudinary, handleUploadErrors } from '../middlewares/cloudinary-upload.middleware.js';
import {
  validateFileUpload,
  handleValidationErrors,
  validateObjectId,
} from '../utils/validation.js';

const router = express.Router({ mergeParams: true });

/**
 * File routes
 */
router.get('/', fileController.getFiles);

router.post(
  '/',
  validateFileUpload,
  handleValidationErrors,
  uploadCloudinary.single('file'),
  handleUploadErrors,
  fileController.uploadFile
);

router.get(
  '/:fileId/download',
  validateObjectId('fileId'),
  handleValidationErrors,
  fileController.downloadFile
);

router.delete(
  '/:fileId',
  validateObjectId('fileId'),
  handleValidationErrors,
  fileController.deleteFile
);

export default router;
