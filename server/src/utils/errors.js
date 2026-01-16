// src/utils/errors.js
import { ERROR_CODES } from '../constants/errorCodes.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'SRV_001', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VAL_001', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = {}) {
    super(message, 401, 'AUTH_002', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = {}) {
    super(message, 403, 'AUTH_004', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = {}) {
    super(`${resource} not found`, 404, 'RES_001', details);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 422, 'VAL_001', { errors });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details = {}) {
    super(message, 409, 'RES_003', details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details = {}) {
    super(message, 500, 'SRV_001', details);
    this.isOperational = false;
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = {}) {
    super(message, 429, 'RATE_001', details);
  }
}
