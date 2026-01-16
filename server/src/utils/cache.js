/**
 * Cache Utility - Simple in-memory caching using node-cache
 * Used for Phase 2 performance optimization
 * 
 * Cache Strategy:
 * - Project lists: 2 minutes TTL
 * - Single project: 5 minutes TTL
 * - Statistics: 2 minutes TTL
 * 
 * Future: Can be replaced with Redis when scaling
 */

import NodeCache from 'node-cache';

// Create cache instance with 10 second check period
const cache = new NodeCache({ stdTTL: 300, checkperiod: 10 });

/**
 * Cache keys pattern
 */
export const CACHE_KEYS = {
  // User projects list: user:{userId}:projects:{page}
  USER_PROJECTS: (userId, page = 0) => `user:${userId}:projects:${page}`,
  
  // Single project: project:{projectId}
  PROJECT: (projectId) => `project:${projectId}`,
  
  // Project statistics: project:{projectId}:stats
  PROJECT_STATS: (projectId) => `project:${projectId}:stats`,
  
  // User conversations list: conversations:{projectId}:page:{page}:limit:{limit}
  USER_CONVERSATIONS: (projectId, page, limit) => `conversations:${projectId}:page:${page}:limit:${limit}`,
  
  // All keys for a user (for invalidation)
  USER_PROJECTS_PATTERN: (userId) => `user:${userId}:projects:*`,
};

/**
 * Get value from cache
 */
export const getCached = (key) => {
  try {
    const value = cache.get(key);
    if (value) {
      console.log(`✅ [Cache] HIT: ${key}`);
      return value;
    }
    console.log(`❌ [Cache] MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`⚠️ [Cache] Error reading from cache: ${error.message}`);
    return null;
  }
};

/**
 * Set value in cache
 */
export const setCached = (key, value, ttl = 300) => {
  try {
    cache.set(key, value, ttl);
    console.log(`💾 [Cache] SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`⚠️ [Cache] Error writing to cache: ${error.message}`);
    return false;
  }
};

/**
 * Delete value from cache
 */
export const deleteCached = (key) => {
  try {
    cache.del(key);
    console.log(`🗑️  [Cache] DELETED: ${key}`);
    return true;
  } catch (error) {
    console.error(`⚠️ [Cache] Error deleting from cache: ${error.message}`);
    return false;
  }
};

/**
 * Invalidate all user projects cache (when project is created/updated/deleted)
 */
export const invalidateUserProjectsCache = (userId) => {
  try {
    // Get all keys matching pattern
    const keys = cache.keys();
    const userProjectKeys = keys.filter(key => 
      key.startsWith(`user:${userId}:projects:`) || 
      key.startsWith(`project:`)
    );
    
    if (userProjectKeys.length > 0) {
      cache.del(userProjectKeys);
      console.log(`🗑️  [Cache] INVALIDATED: ${userProjectKeys.length} cache entries for user ${userId}`);
    }
  } catch (error) {
    console.error(`⚠️ [Cache] Error invalidating cache: ${error.message}`);
  }
};

/**
 * Invalidate user conversations cache (when conversation is created/updated/deleted)
 */
export const invalidateUserConversationsCache = (userId) => {
  try {
    // Get all keys matching pattern
    const keys = cache.keys();
    const userConvKeys = keys.filter(key => 
      key.startsWith('conversations:')
    );
    
    if (userConvKeys.length > 0) {
      cache.del(userConvKeys);
      console.log(`🗑️  [Cache] INVALIDATED: ${userConvKeys.length} conversation cache entries for user ${userId}`);
    }
  } catch (error) {
    console.error(`⚠️ [Cache] Error invalidating conversations cache: ${error.message}`);
  }
};

/**
 * Clear all cache (use sparingly)
 */
export const clearAllCache = () => {
  try {
    cache.flushAll();
    console.log(`🗑️  [Cache] CLEARED: All cache entries removed`);
    return true;
  } catch (error) {
    console.error(`⚠️ [Cache] Error clearing cache: ${error.message}`);
    return false;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return cache.getStats();
};

export default cache;
