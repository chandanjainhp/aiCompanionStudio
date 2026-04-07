// src/config/database.js
import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

const prisma = new PrismaClient({
  log: config.isDevelopment
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
