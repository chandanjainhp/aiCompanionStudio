// server/src/utils/database-integrity.js
/**
 * Database Integrity Validation Utility
 * Performs comprehensive checks on database structure and data consistency
 */

import { prisma } from '../config/database.js';

/**
 * Validate database schema structure
 */
export const validateDatabaseSchema = async () => {
  const issues = [];
  const warnings = [];
  const verified = [];

  try {
    // 1. Check User model
    const userCount = await prisma.user.count();
    verified.push(`✅ User table exists (${userCount} records)`);

    // Check unique constraint on email
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count FROM "User" 
      GROUP BY email HAVING COUNT(*) > 1
    `;
    if (duplicateEmails.length > 0) {
      issues.push(`❌ Found duplicate user emails: ${JSON.stringify(duplicateEmails)}`);
    } else {
      verified.push('✅ User email uniqueness constraint verified');
    }

    // 2. Check Project model
    const projectCount = await prisma.project.count();
    verified.push(`✅ Project table exists (${projectCount} records)`);

    // Verify all projects have userId
    const projectsWithoutUser = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Project" WHERE "userId" IS NULL
    `;
    if (projectsWithoutUser[0]?.count > 0) {
      issues.push(`❌ Found ${projectsWithoutUser[0].count} projects without userId`);
    } else {
      verified.push('✅ All projects have userId');
    }

    // 3. Check Conversation model
    const conversationCount = await prisma.conversation.count();
    verified.push(`✅ Conversation table exists (${conversationCount} records)`);

    // Verify all conversations have projectId AND userId
    const conversationsWithoutData = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Conversation" 
      WHERE "projectId" IS NULL OR "userId" IS NULL
    `;
    if (conversationsWithoutData[0]?.count > 0) {
      issues.push(`❌ Found ${conversationsWithoutData[0].count} conversations missing projectId or userId`);
    } else {
      verified.push('✅ All conversations have projectId and userId');
    }

    // 4. Check Message model
    const messageCount = await prisma.message.count();
    verified.push(`✅ Message table exists (${messageCount} records)`);

    // Verify all messages have conversationId
    const messagesWithoutConversation = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Message" WHERE "conversationId" IS NULL
    `;
    if (messagesWithoutConversation[0]?.count > 0) {
      issues.push(`❌ Found ${messagesWithoutConversation[0].count} messages without conversationId`);
    } else {
      verified.push('✅ All messages have conversationId');
    }

    // 5. Check RefreshToken model
    const tokenCount = await prisma.refreshToken.count();
    verified.push(`✅ RefreshToken table exists (${tokenCount} records)`);

    // Check for expired tokens
    const expiredTokens = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "RefreshToken" WHERE "expiresAt" < NOW()
    `;
    if (expiredTokens[0]?.count > 0) {
      warnings.push(`⚠️  Found ${expiredTokens[0].count} expired refresh tokens (should clean up)`);
    }

    // 6. Check OTP model
    const otpCount = await prisma.oTP.count();
    verified.push(`✅ OTP table exists (${otpCount} records)`);

    // Check for expired OTPs
    const expiredOTPs = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "OTP" WHERE "expiresAt" < NOW() AND "isUsed" = false
    `;
    if (expiredOTPs[0]?.count > 0) {
      warnings.push(`⚠️  Found ${expiredOTPs[0].count} expired unused OTPs (should clean up)`);
    }

    // 7. Check File model
    const fileCount = await prisma.file.count();
    verified.push(`✅ File table exists (${fileCount} records)`);

    // 8. Check foreign key consistency
    const orphanedProjects = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Project" p
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = p."userId")
    `;
    if (orphanedProjects[0]?.count > 0) {
      issues.push(`❌ Found ${orphanedProjects[0].count} projects with non-existent user`);
    } else {
      verified.push('✅ All projects reference existing users');
    }

    const orphanedConversations = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Conversation" c
      WHERE NOT EXISTS (SELECT 1 FROM "Project" p WHERE p.id = c."projectId")
    `;
    if (orphanedConversations[0]?.count > 0) {
      issues.push(`❌ Found ${orphanedConversations[0].count} conversations with non-existent project`);
    } else {
      verified.push('✅ All conversations reference existing projects');
    }

    const orphanedMessages = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Message" m
      WHERE NOT EXISTS (SELECT 1 FROM "Conversation" c WHERE c.id = m."conversationId")
    `;
    if (orphanedMessages[0]?.count > 0) {
      issues.push(`❌ Found ${orphanedMessages[0].count} messages with non-existent conversation`);
    } else {
      verified.push('✅ All messages reference existing conversations');
    }

    return { verified, warnings, issues };
  } catch (error) {
    return {
      verified,
      warnings,
      issues: [...issues, `❌ Validation error: ${error.message}`],
    };
  }
};

/**
 * Fix database integrity issues
 */
export const fixDatabaseIntegrity = async () => {
  const fixes = [];

  try {
    // Clean up expired OTPs
    const deletedOTPs = await prisma.oTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        isUsed: false,
      },
    });
    if (deletedOTPs.count > 0) {
      fixes.push(`🧹 Cleaned up ${deletedOTPs.count} expired OTPs`);
    }

    // Clean up expired refresh tokens (optional - can keep for audit trail)
    // Uncomment if desired:
    // const deletedTokens = await prisma.refreshToken.deleteMany({
    //   where: {
    //     expiresAt: { lt: new Date() },
    //   },
    // });
    // if (deletedTokens.count > 0) {
    //   fixes.push(`🧹 Cleaned up ${deletedTokens.count} expired refresh tokens`);
    // }

    return { success: true, fixes };
  } catch (error) {
    return {
      success: false,
      fixes,
      error: error.message,
    };
  }
};

/**
 * Generate database integrity report
 */
export const generateIntegrityReport = async () => {
  const validation = await validateDatabaseSchema();
  const fixes = await fixDatabaseIntegrity();

  return {
    timestamp: new Date().toISOString(),
    database: {
      validation,
      maintenance: fixes,
    },
    summary: {
      verified: validation.verified.length,
      warnings: validation.warnings.length,
      issues: validation.issues.length,
      success: validation.issues.length === 0,
    },
  };
};

export default {
  validateDatabaseSchema,
  fixDatabaseIntegrity,
  generateIntegrityReport,
};
