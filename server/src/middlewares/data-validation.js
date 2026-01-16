// server/src/middlewares/data-validation.js
/**
 * Data Validation Middleware
 * Ensures no invalid data reaches the database
 */

import { BadRequestError } from '../utils/errors.js';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };

  return {
    isValid: Object.values(requirements).every(r => r),
    requirements,
  };
};

/**
 * Validate user data before creation
 */
export const validateUserData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (data.password && data.password.length > 0) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(`Password must have: ${Object.keys(passwordValidation.requirements).filter(k => !passwordValidation.requirements[k]).join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate project data before creation
 */
export const validateProjectData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (data.name && data.name.length > 255) {
    errors.push('Project name must be less than 255 characters');
  }

  if (data.temperature !== undefined) {
    if (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 2) {
      errors.push('Temperature must be a number between 0 and 2');
    }
  }

  if (data.maxTokens !== undefined) {
    if (!Number.isInteger(data.maxTokens) || data.maxTokens < 1 || data.maxTokens > 4000) {
      errors.push('Max tokens must be an integer between 1 and 4000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate conversation data before creation
 */
export const validateConversationData = (data) => {
  const errors = [];

  if (!data.projectId) {
    errors.push('Project ID is required');
  }

  if (data.title && data.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate message data before creation
 */
export const validateMessageData = (data) => {
  const errors = [];

  if (!data.conversationId) {
    errors.push('Conversation ID is required');
  }

  if (!data.role || !['user', 'assistant', 'system'].includes(data.role)) {
    errors.push('Invalid message role. Must be: user, assistant, or system');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Message content is required');
  }

  if (data.content && data.content.length > 100000) {
    errors.push('Message content must be less than 100,000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Middleware wrapper for validation
 */
export const validateDataMiddleware = (validator) => {
  return (req, res, next) => {
    const validation = validator(req.body);

    if (!validation.isValid) {
      throw new BadRequestError(`Validation failed: ${validation.errors.join('; ')}`);
    }

    next();
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUserData,
  validateProjectData,
  validateConversationData,
  validateMessageData,
  validateDataMiddleware,
};
