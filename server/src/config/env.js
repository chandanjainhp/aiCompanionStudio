// src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  // Format: compatible with jsonwebtoken library
  // Recommended production defaults: '15m' (access), '7d' (refresh)
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Google Generative AI
  googleApiKey: process.env.GOOGLE_API_KEY,

  // OpenRouter.ai (PRIMARY AI PROVIDER)
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  // Local LLM (Fallback)
  localLLMEnabled: process.env.LOCAL_LLM_ENABLED === 'true',
  localLLMEndpoint: process.env.LOCAL_LLM_ENDPOINT,
  localLLMModel: process.env.LOCAL_LLM_MODEL || 'minimaxai_synlogic-7b',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:5173'],

  // File Upload
  fileUploadPath: process.env.FILE_UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  // Email
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '465', 10),
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  emailFromName: process.env.EMAIL_FROM_NAME || 'TMS',
  emailFromEmail: process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER,
  get emailFrom() {
    return `${this.emailFromName} <${this.emailFromEmail}>`;
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENROUTER_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (config.isProduction) {
      // In production, missing required env vars should cause immediate failure
      console.error(`❌ CRITICAL: Missing required environment variable: ${envVar}`);
      throw new Error(`Missing required environment variable: ${envVar}`);
    } else {
      // In development, just warn
      console.warn(`⚠️ Warning: Missing required environment variable: ${envVar}`);
    }
  }
}

export const validateProductionEnv = () => {
  if (config.isProduction) {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'OPENROUTER_API_KEY',
      'APP_URL',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required env vars for production: ${missing.join(', ')}`);
    }
    
    console.log('✅ [Config] Production environment validation passed');
  }
};

