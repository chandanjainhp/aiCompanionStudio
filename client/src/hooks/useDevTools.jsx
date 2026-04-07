/**
 * Development Utility Hook for App State Management
 * 
 * Exposes global reset functions for development/debugging
 * Attach to window object for easy access in DevTools console
 * 
 * Usage in browser console:
 * - window.devTools.resetApp()          // Full reset
 * - window.devTools.resetProjects()      // Clear projects only  
 * - window.devTools.validateState()      // Check for stale data
 * - window.devTools.showState()          // Log current state
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { resetAppState, resetProjectsData, validateStoredState } from '@/lib/appStateReset';
export const useDevTools = () => {
  useEffect(() => {
    // Only expose in development and if not already exposed
    if (typeof window !== 'undefined' && !window.devTools) {
      window.devTools = {
        // Full reset - clear auth and projects
        resetApp: (reason = 'manual_devtools') => {
          console.log('🔴 [devTools] Triggering full app reset...');
          resetAppState(reason);
          console.log('✅ [devTools] App reset complete. Please reload the page.');
          return 'Reset complete. Reload page to see changes.';
        },
        // Soft reset - clear projects only
        resetProjects: (reason = 'manual_devtools') => {
          console.log('🧹 [devTools] Triggering projects reset...');
          resetProjectsData(reason);
          const state = useProjectsStore.getState();
          console.log('✅ [devTools] Projects cleared. Current state:', {
            projects: state.projects.length,
            conversations: state.conversations.length
          });
          return 'Projects reset complete.';
        },
        // Check for stale data
        validateState: () => {
          console.log('🔍 [devTools] Validating stored state...');
          const result = validateStoredState();
          console.log('Result:', result);
          return result;
        },
        // Display current state
        showState: () => {
          const authState = useAuthStore.getState();
          const projectsState = useProjectsStore.getState();
          const output = {
            auth: {
              isAuthenticated: authState.isAuthenticated,
              user: authState.user?.email || null,
              token: authState.accessToken?.substring(0, 20) + '...' || null
            },
            projects: {
              count: projectsState.projects.length,
              currentProject: projectsState.currentProject?.id || null,
              conversations: projectsState.conversations.length,
              currentConversation: projectsState.currentConversation?.id || null
            },
            storage: {
              authStorage: !!localStorage.getItem('auth-storage'),
              projectsStorage: !!localStorage.getItem('projects-storage'),
              accessToken: !!localStorage.getItem('accessToken')
            }
          };
          console.table(output);
          return output;
        },
        // Clear browser storage completely
        clearStorage: () => {
          console.log('🗑️  [devTools] Clearing all browser storage...');
          const keys = ['auth-storage', 'projects-storage', 'ui-storage', 'accessToken', 'refreshToken'];
          keys.forEach(key => localStorage.removeItem(key));
          sessionStorage.clear();
          console.log('✅ [devTools] Storage cleared');
          return 'Storage cleared';
        },
        // Get localStorage raw data
        getStorage: () => {
          const keys = ['auth-storage', 'projects-storage', 'ui-storage'];
          const output = {};
          keys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                output[key] = JSON.parse(item);
              } catch {
                output[key] = item;
              }
            }
          });
          console.table(output);
          return output;
        },
        // Check what's persisted
        checkPersisted: () => {
          console.log('📦 [devTools] Checking persisted data...');
          const authStorage = localStorage.getItem('auth-storage');
          const projectsStorage = localStorage.getItem('projects-storage');
          const info = {
            authStorageSize: authStorage ? authStorage.length : 0,
            projectsStorageSize: projectsStorage ? projectsStorage.length : 0,
            authHasUser: authStorage ? JSON.parse(authStorage).state?.user !== null : false,
            projectsCount: projectsStorage ? JSON.parse(projectsStorage).state?.projects?.length : 0
          };
          console.table(info);
          return info;
        },
        // Help text
        help: () => {
          const commands = {
            'resetApp()': 'Clear ALL persisted state (auth + projects). Reload required.',
            'resetProjects()': 'Clear only projects/conversations. Keep user logged in.',
            'validateState()': 'Check for stale/inconsistent state.',
            'showState()': 'Display current in-memory state.',
            'getStorage()': 'Display localStorage data.',
            'checkPersisted()': 'Show what is persisted in localStorage.',
            'clearStorage()': 'Clear all browser storage.',
            'help()': 'Show this help message.'
          };
          console.log('═══════════════════════════════════════════════');
          console.log('📚 Dev Tools Available Commands:');
          console.log('═══════════════════════════════════════════════');
          Object.entries(commands).forEach(([cmd, desc]) => {
            console.log(`  window.devTools.${cmd.padEnd(30)} → ${desc}`);
          });
          console.log('═══════════════════════════════════════════════');
          return commands;
        }
      };
      console.log('✅ Dev Tools loaded. Type: window.devTools.help()');
    }
  }, []);
};

// Extend window interface to include devTools