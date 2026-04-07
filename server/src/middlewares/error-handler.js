// src/middlewares/error-handler.js
import { config } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Global Error Handling Middleware
 * Standardizes all error responses to: { success: false, message, errorCode }
 * Must be registered as the LAST middleware in the app
 */
export const errorHandler = (error, req, res, next) => {
  // Determine status code (preserve HTTP status)
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorCode = error.errorCode || 'SRV_001';

  console.error('🔴 ════════════════════════════════════════════');
  console.error('🔴 [ERROR HANDLER] ERROR CAUGHT');
  console.error('🔴 ════════════════════════════════════════════');
  console.error('🔴 Request:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  console.error('🔴 Error Details:', {
    statusCode,
    message,
    errorCode,
    errorType: error.constructor.name,
  });

  // Log full error in development
  if (config.nodeEnv === 'development') {
    console.error('🔴 Full Error Object:', error);
    console.error('🔴 Stack Trace:', error.stack);
  }

  // Log structured error in production
  if (config.nodeEnv === 'production') {
    console.error(`[${new Date().toISOString()}] ${statusCode} ${errorCode} ${message}`);
  }

  // Map Prisma errors to standard error codes
  if (error.code === 'P2002') {
    statusCode = 409;
    errorCode = 'RES_003'; // Conflict
    const field = error.meta?.target?.[0] || 'field';
    message = `${field} already exists`;
    console.error('🔴 Prisma P2002 (Unique Constraint):', message);
  } else if (error.code === 'P2025') {
    statusCode = 404;
    errorCode = 'RES_001'; // Not Found
    message = 'Resource not found';
    console.error('🔴 Prisma P2025 (Record Not Found):', message);
  }

  // Handle validation errors with detailed messages
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    statusCode = error.statusCode || 422;
    errorCode = error.errorCode || 'VAL_001';
    console.error('🔴 Validation Errors:', error.errors);
  }

  console.error('🔴 Response:', {
    statusCode,
    success: false,
    message,
    errorCode,
  });
  console.error('🔴 ════════════════════════════════════════════\n');

  // ✅ STANDARDIZED RESPONSE FORMAT
  // All errors now follow: { success: false, message, errorCode }
  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};

/**
 * 404 Not Found Middleware
 * Handles routes that don't exist
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'RES_001',
  });
};
