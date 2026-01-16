// src/index.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import app from './app.js';
import { config, validateProductionEnv } from './config/env.js';
import { prisma } from './config/database.js';

// Load environment variables
dotenv.config();

// Validate production environment
validateProductionEnv();

// Ensure uploads directory exists
const uploadDir = path.resolve(config.fileUploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 [Server] Created uploads directory: ${uploadDir}`);
}

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');

    // Start server - Listen on 0.0.0.0 to accept all connections
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`
🚀 Server is running
📍 Host: 0.0.0.0
📍 Port: ${config.port}
🌍 Environment: ${config.nodeEnv}
🔗 API: http://localhost:${config.port}/api/v1
💻 Health Check: http://localhost:${config.port}/health
      `);
    });

    // Add error handler to server
    server.on('error', (error) => {
      console.error('❌ [Server Error]', error.message);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n⏹️  Shutting down gracefully...');
      
      server.close(async () => {
        console.log('❌ Server stopped');
        await prisma.$disconnect();
        console.log('🗄️  Database disconnected');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Force shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ [Uncaught Exception]', error);
    });

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ [Unhandled Rejection] Promise:', promise);
      console.error('❌ [Unhandled Rejection] Reason:', reason);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();