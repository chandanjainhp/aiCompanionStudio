// Import Prisma Client
import { PrismaClient } from "@prisma/client";

// Create a single instance of PrismaClient to be reused throughout the application
export const prisma = new PrismaClient();

// Optional: Add event listeners for Prisma Client lifecycle
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully via Prisma");
  })
  .catch((error) => {
    console.error("❌ Prisma connection failed:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});