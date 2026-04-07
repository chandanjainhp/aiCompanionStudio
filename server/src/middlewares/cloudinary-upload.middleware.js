// src/middlewares/cloudinary-upload.middleware.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Allowed file types for upload
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/csv': '.csv',
  'application/json': '.json',
};

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aicompanion-studio',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'pdf', 'txt', 'docx', 'csv', 'json', 'webp', 'gif'],
    max_bytes: 10485760, // 10MB
  },
});

// File filter to validate file types and size
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(
      new Error(`File type not allowed. Allowed types: ${Object.values(ALLOWED_MIME_TYPES).join(', ')}`)
    );
  }
  cb(null, true);
};

// Create multer instance with Cloudinary storage
export const uploadCloudinary = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10485760, // 10MB
  },
});

/**
 * Middleware to handle multer errors
 */
export const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }

  next();
};
