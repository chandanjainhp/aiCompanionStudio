// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { config } from './config/env.js';
import { initializeEmailTransporter } from './config/email.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';

// Import routers
import authRouter from './routes/auth.router.js';
import projectRouter from './routes/project.router.js';
import testRouter from './routes/test.router.js';
import userRouter from './routes/user.router.js';
import aiRouter from './routes/ai.router.js';

const app = express();
const apiV1 = '/api/v1';

// ============ Middleware Setup ============

// Security middleware
app.use(helmet());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'OPTIONS') {
    console.log('🔄 [PREFLIGHT] OPTIONS request received');
    console.log('🔄 [PREFLIGHT] Origin:', req.headers.origin);
    console.log('🔄 [PREFLIGHT] Access-Control-Request-Method:', req.headers['access-control-request-method']);
  }
  next();
});

// Logging middleware
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Initialize email transporter
try {
  initializeEmailTransporter();
} catch (error) {
  console.warn('Email configuration failed:', error.message);
}

// ============ Health Check ============

app.get('/health', (req, res) => {
  console.log('✅ [HEALTH] Health check endpoint called');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Test route to verify server is responding
app.get('/test', (req, res) => {
  console.log('✅ [TEST] Test endpoint called');
  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
  });
});

// ============ API Routes ============

// Auth routes
app.use(`${apiV1}/auth`, authRouter);

// Test routes (for debugging and checking logs)
app.use(`${apiV1}/test`, testRouter);

// AI routes (Gemini API integration)
app.use(`${apiV1}/ai`, aiRouter);

// Project routes (includes nested chat, prompts, files routes)
app.use(`${apiV1}/projects`, projectRouter);

// User routes
app.use(`${apiV1}/users`, userRouter);

// ============ Error Handling ============

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;