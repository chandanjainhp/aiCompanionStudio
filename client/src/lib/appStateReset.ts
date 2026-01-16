/**
 * Global App State Reset Utility
 * 
 * Safely clears ALL persisted state when:
 * - User logs out
 * - Backend returns 401/403 (unauthorized)
 * - Database is wiped during development
 * - User session becomes invalid
 */

import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useUIStore } from '@/store/uiStore';

/**
 * Clear all persisted storage keys used by the app
 * WARNING: This is irreversible - all user data is lost
 */
export const clearAllStorage = () => {
  console.log('🧹 [clearAllStorage] Clearing ALL localStorage keys...');

  // Zustand persist middleware creates keys with these patterns:
  // - auth-storage (authStore)
  // - projects-storage (projectsStore)
  // - ui-storage (uiStore)
  const persistedKeys = [
    'auth-storage',
    'projects-storage',
    'ui-storage',
    'accessToken',
    'refreshToken',
  ];

  persistedKeys.forEach((key) => {
    try {
      const existed = localStorage.getItem(key) !== null;
      localStorage.removeItem(key);
      if (existed) {
        console.log(`  ✓ Removed: ${key}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to remove ${key}:`, error);
    }
  });

  // Also clear sessionStorage as backup
  try {
    sessionStorage.clear();
    console.log('  ✓ Cleared sessionStorage');
  } catch (error) {
    console.error('  ✗ Failed to clear sessionStorage:', error);
  }

  console.log('✅ [clearAllStorage] All storage cleared');
};

/**
 * Reset all Zustand stores to their initial state
 * This clears in-memory state immediately
 */
export const resetAllStores = () => {
  console.log('🔄 [resetAllStores] Resetting all Zustand stores to defaults...');

  // Reset Auth Store
  try {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      loginMethod: null,
      otpMode: null,
      otpEmail: null,
      otpName: null,
      otpSent: false,
      registerName: null,
      registerEmail: null,
      registerPassword: null,
      registerOtpSent: false,
      _isHydrated: false,
    });
    console.log('  ✓ Auth store reset');
  } catch (error) {
    console.error('  ✗ Failed to reset auth store:', error);
  }

  // Reset Projects Store
  try {
    useProjectsStore.setState({
      projects: [],
      currentProject: null,
      conversations: [],
      currentConversation: null,
      isLoading: false,
    });
    console.log('  ✓ Projects store reset');
  } catch (error) {
    console.error('  ✗ Failed to reset projects store:', error);
  }

  // Note: UI Store is kept (theme preferences, sidebar state)
  // Only reset it if specifically requested

  console.log('✅ [resetAllStores] All stores reset');
};

/**
 * MAIN: Complete app state reset
 * 
 * Call this function to:
 * 1. Clear all persisted storage (localStorage, sessionStorage)
 * 2. Reset all Zustand stores to defaults
 * 3. Ready app for fresh login or database reload
 * 
 * Safe to call multiple times - idempotent operation
 */
export const resetAppState = (reason: string = 'manual') => {
  console.log('═══════════════════════════════════════════════════');
  console.log(`🔴 [resetAppState] RESETTING APP STATE`);
  console.log(`   Reason: ${reason}`);
  console.log('═══════════════════════════════════════════════════');

  try {
    // Step 1: Clear all storage
    clearAllStorage();

    // Step 2: Reset all stores
    resetAllStores();

    // Step 3: Verify clean state
    const authState = useAuthStore.getState();
    const projectsState = useProjectsStore.getState();

    const isClean =
      !authState.user &&
      !authState.isAuthenticated &&
      !authState.accessToken &&
      projectsState.projects.length === 0 &&
      projectsState.conversations.length === 0;

    if (isClean) {
      console.log('✅ [resetAppState] RESET COMPLETE - App is now in clean state');
      console.log('═══════════════════════════════════════════════════');
      return true;
    } else {
      console.warn('⚠️  [resetAppState] Warning: App state not fully clean after reset');
      console.log('   Auth state:', {
        user: !!authState.user,
        isAuthenticated: authState.isAuthenticated,
        hasToken: !!authState.accessToken,
      });
      console.log('   Projects state:', {
        projectCount: projectsState.projects.length,
        conversationCount: projectsState.conversations.length,
      });
      return false;
    }
  } catch (error) {
    console.error('❌ [resetAppState] RESET FAILED:', error);
    console.log('═══════════════════════════════════════════════════');
    throw error;
  }
};

/**
 * Soft reset: Clear only project/conversation data
 * Keep auth state (user remains logged in)
 * 
 * Use when: Backend returns empty projects list
 */
export const resetProjectsData = (reason: string = 'manual') => {
  console.log('🧹 [resetProjectsData] Clearing projects and conversations...');
  console.log(`   Reason: ${reason}`);

  try {
    useProjectsStore.setState({
      projects: [],
      currentProject: null,
      conversations: [],
      currentConversation: null,
      isLoading: false,
    });
    console.log('✅ [resetProjectsData] Projects data cleared');
    return true;
  } catch (error) {
    console.error('❌ [resetProjectsData] Failed:', error);
    return false;
  }
};

/**
 * CRITICAL: Check if stored data matches backend reality
 * If backend returns empty but client has data, data is stale
 */
export const validateStoredState = () => {
  console.log('🔍 [validateStoredState] Checking for stale data...');

  const authState = useAuthStore.getState();
  const projectsState = useProjectsStore.getState();

  const issues = [];

  // Check 1: User authenticated but no token
  if (authState.isAuthenticated && !authState.accessToken) {
    issues.push('Authentication state mismatch: authenticated but no token');
  }

  // Check 2: User authenticated but no user data
  if (authState.isAuthenticated && !authState.user) {
    issues.push('Authentication state mismatch: authenticated but no user');
  }

  // Check 3: Projects exist but backend will return empty
  if (projectsState.projects.length > 0 && !authState.isAuthenticated) {
    issues.push('Stale data: projects cached but user not authenticated');
  }

  // Check 4: Conversations exist but no current project
  if (
    projectsState.conversations.length > 0 &&
    !projectsState.currentProject
  ) {
    issues.push('Stale data: conversations cached but no current project');
  }

  if (issues.length === 0) {
    console.log('✅ [validateStoredState] No state issues detected');
    return { valid: true, issues: [] };
  } else {
    console.warn('⚠️  [validateStoredState] Issues found:', issues);
    return { valid: false, issues };
  }
};

export default {
  resetAppState,
  resetProjectsData,
  clearAllStorage,
  resetAllStores,
  validateStoredState,
};
