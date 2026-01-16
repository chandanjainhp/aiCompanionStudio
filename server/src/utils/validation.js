// src/utils/validation.js
import { body, validationResult, param, query } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Auth validation
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
    .matches(/[@$!%*?&]/)
    .withMessage('Password must contain special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Project validation
export const validateCreateProject = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Project name is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('model')
    .optional()
    .isIn(['gemini-pro', 'gemini-pro-vision', 'gemini-2.0-flash'])
    .withMessage('Invalid model selected'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage('Max tokens must be between 1 and 4000'),
];

export const validateUpdateProject = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Project name must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('model')
    .optional()
    .isIn(['gemini-2.0-flash'])
    .withMessage('Only gemini-2.0-flash model is available in this version'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage('Max tokens must be between 1 and 4000'),
];

// Prompt validation
export const validateCreatePrompt = [
  param('projectId')
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Prompt content is required'),
];

export const validateUpdatePrompt = [
  param('projectId')
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  param('promptId')
    .isLength({ min: 1 })
    .withMessage('Prompt ID is required'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Prompt content is required'),
];

// Conversation validation
export const validateCreateConversation = [
  param('projectId')
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
];

// Message validation
export const validateCreateMessage = [
  param('projectId')
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  param('conversationId')
    .isLength({ min: 1 })
    .withMessage('Conversation ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message content is required'),
];

export const validateFileUpload = [
  param('projectId')
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
];

// ID validation
export const validateObjectId = (idParamName = 'id') => {
  return param(idParamName)
    .isLength({ min: 1 })
    .withMessage(`${idParamName} is required and must be valid`);
};
