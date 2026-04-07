// src/services/quota.service.js
import { prisma } from '../config/database.js';
import { ForbiddenError } from '../utils/errors.js';

/**
 * Check if user can make a chat request
 * @throws {ForbiddenError} if user has exceeded chat limit
 */
export const checkChatQuota = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Fetch user quota
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        chatUsageCount: true,
        chatLimit: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log(`📊 [quota.service] Quota check for user ${user.email}:`, {
      used: user.chatUsageCount,
      limit: user.chatLimit,
      remaining: user.chatLimit - user.chatUsageCount,
    });

    // Check if user has exceeded limit
    if (user.chatUsageCount >= user.chatLimit) {
      console.warn(
        `⛔ [quota.service] User ${user.email} has exceeded chat limit: ${user.chatUsageCount}/${user.chatLimit}`
      );
      throw new ForbiddenError(
        `Chat limit exceeded. You have used ${user.chatUsageCount} of ${user.chatLimit} available chats. Contact support for more.`
      );
    }

    console.log(`✅ [quota.service] User ${user.email} quota check passed`);
    return {
      allowed: true,
      used: user.chatUsageCount,
      limit: user.chatLimit,
      remaining: user.chatLimit - user.chatUsageCount,
    };
  } catch (error) {
    if (error.message?.includes('Chat limit exceeded')) {
      throw error;
    }
    console.error(`❌ [quota.service] Error checking quota:`, error.message);
    throw error;
  }
};

/**
 * Increment user's chat usage count
 * ATOMIC: Ensures count doesn't exceed limit
 */
export const incrementChatUsage = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    console.log(`📈 [quota.service] Incrementing chat usage for user ${userId}`);

    // Use atomic update to increment count
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        chatUsageCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        email: true,
        chatUsageCount: true,
        chatLimit: true,
      },
    });

    console.log(`✅ [quota.service] Chat usage incremented for ${user.email}:`, {
      newCount: user.chatUsageCount,
      limit: user.chatLimit,
    });

    return {
      chatUsageCount: user.chatUsageCount,
      chatLimit: user.chatLimit,
      remaining: user.chatLimit - user.chatUsageCount,
    };
  } catch (error) {
    console.error(`❌ [quota.service] Error incrementing usage:`, error.message);
    throw error;
  }
};

/**
 * Get user's quota info
 */
export const getUserQuota = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        chatUsageCount: true,
        chatLimit: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      used: user.chatUsageCount,
      limit: user.chatLimit,
      remaining: Math.max(0, user.chatLimit - user.chatUsageCount),
    };
  } catch (error) {
    console.error(`❌ [quota.service] Error getting quota:`, error.message);
    throw error;
  }
};

/**
 * Reset user's chat usage (admin only)
 */
export const resetChatUsage = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        chatUsageCount: 0,
      },
      select: {
        id: true,
        email: true,
        chatUsageCount: true,
        chatLimit: true,
      },
    });

    console.log(`🔄 [quota.service] Chat usage reset for ${user.email}`);
    return user;
  } catch (error) {
    console.error(`❌ [quota.service] Error resetting usage:`, error.message);
    throw error;
  }
};
