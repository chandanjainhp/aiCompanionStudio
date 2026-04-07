/**
 * Standardized Error Codes for API responses
 * Used across all endpoints for consistent error handling
 */

export const ERROR_CODES = {
  // Authentication errors (AUTH_001 - AUTH_005)
  AUTH_001: {
    code: 'AUTH_001',
    message: 'Authentication token is missing',
    statusCode: 401,
  },
  AUTH_002: {
    code: 'AUTH_002',
    message: 'Invalid or expired authentication token',
    statusCode: 401,
  },
  AUTH_003: {
    code: 'AUTH_003',
    message: 'User not found or account deleted',
    statusCode: 401,
  },
  AUTH_004: {
    code: 'AUTH_004',
    message: 'You do not have permission to access this resource',
    statusCode: 403,
  },
  AUTH_005: {
    code: 'AUTH_005',
    message: 'Invalid credentials',
    statusCode: 401,
  },

  // Validation errors (VAL_001 - VAL_004)
  VAL_001: {
    code: 'VAL_001',
    message: 'Invalid input parameters',
    statusCode: 400,
  },
  VAL_002: {
    code: 'VAL_002',
    message: 'Required field is missing',
    statusCode: 400,
  },
  VAL_003: {
    code: 'VAL_003',
    message: 'Invalid data format',
    statusCode: 400,
  },
  VAL_004: {
    code: 'VAL_004',
    message: 'Field validation failed',
    statusCode: 400,
  },

  // Resource errors (RES_001 - RES_004)
  RES_001: {
    code: 'RES_001',
    message: 'Resource not found',
    statusCode: 404,
  },
  RES_002: {
    code: 'RES_002',
    message: 'Resource already exists',
    statusCode: 409,
  },
  RES_003: {
    code: 'RES_003',
    message: 'Cannot delete resource with active dependencies',
    statusCode: 409,
  },
  RES_004: {
    code: 'RES_004',
    message: 'Resource operation failed',
    statusCode: 400,
  },

  // Rate limiting (RATE_001)
  RATE_001: {
    code: 'RATE_001',
    message: 'Too many requests. Please try again later',
    statusCode: 429,
  },

  // Server errors (SRV_001 - SRV_003)
  SRV_001: {
    code: 'SRV_001',
    message: 'Internal server error',
    statusCode: 500,
  },
  SRV_002: {
    code: 'SRV_002',
    message: 'Database operation failed',
    statusCode: 500,
  },
  SRV_003: {
    code: 'SRV_003',
    message: 'External service unavailable',
    statusCode: 503,
  },
};

/**
 * Get error response object with standard format
 */
export const getErrorResponse = (errorCode, details = {}) => {
  const errorInfo = ERROR_CODES[errorCode];

  if (!errorInfo) {
    return {
      success: false,
      error: {
        code: 'SRV_001',
        message: 'Unknown error occurred',
        details,
      },
    };
  }

  return {
    success: false,
    error: {
      code: errorInfo.code,
      message: errorInfo.message,
      details,
    },
  };
};
