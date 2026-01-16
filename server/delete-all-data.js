/**
 * Script to delete all data from the database
 * WARNING: This will permanently delete all records from all tables!
 * Use with caution in production environments
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllData() {
  try {
    console.log("🗑️  Starting database cleanup...");
    console.log("⚠️  WARNING: This will delete ALL data from the database!\n");

    // Delete in order of dependencies (reverse of creation)
    console.log("Deleting messages...");
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✓ Deleted ${deletedMessages.count} messages`);

    console.log("Deleting conversations...");
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`✓ Deleted ${deletedConversations.count} conversations`);

    console.log("Deleting prompts...");
    const deletedPrompts = await prisma.prompt.deleteMany({});
    console.log(`✓ Deleted ${deletedPrompts.count} prompts`);

    console.log("Deleting files...");
    const deletedFiles = await prisma.file.deleteMany({});
    console.log(`✓ Deleted ${deletedFiles.count} files`);

    console.log("Deleting projects...");
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`✓ Deleted ${deletedProjects.count} projects`);

    console.log("Deleting refresh tokens...");
    const deletedRefreshTokens = await prisma.refreshToken.deleteMany({});
    console.log(`✓ Deleted ${deletedRefreshTokens.count} refresh tokens`);

    console.log("Deleting OTPs...");
    const deletedOTPs = await prisma.oTP.deleteMany({});
    console.log(`✓ Deleted ${deletedOTPs.count} OTPs`);

    console.log("Deleting users...");
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${deletedUsers.count} users`);

    console.log("Deleting subscriptions...");
    const deletedSubscriptions = await prisma.subscription.deleteMany({});
    console.log(`✓ Deleted ${deletedSubscriptions.count} subscriptions`);

    console.log("\n✅ Database cleanup completed successfully!");
    console.log(
      "Summary:",
      JSON.stringify(
        {
          users: deletedUsers.count,
          refreshTokens: deletedRefreshTokens.count,
          otps: deletedOTPs.count,
          projects: deletedProjects.count,
          prompts: deletedPrompts.count,
          conversations: deletedConversations.count,
          messages: deletedMessages.count,
          files: deletedFiles.count,
          subscriptions: deletedSubscriptions.count,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllData();
