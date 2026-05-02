/**
 * AuthInitializer Component
 * Initializes authentication on app mount BEFORE routes render
 * 
 * CRITICAL: This component BLOCKS all route rendering until auth verification is complete.
 * This ensures that protected routes can NEVER be accessed without a valid authenticated session.
 * 
 * Features:
 * - Runs authStore.initializeAuth() exactly once on mount
 * - Prevents rendering Router until auth is fully resolved
 * - Shows full-screen loader while initializing
 * - Validates persisted token against backend
 * - Ensures hard refresh goes through auth check
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ErrorPage } from '@/components/ErrorPage';
import { motion } from 'framer-motion';

let authInitCallCount = 0;

export function AuthInitializer({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { initializeAuth, isLoading: storeIsLoading } = useAuthStore();
  
  console.log(`🔐 [AuthInitializer] Component render, isInitialized=${isInitialized}`);
  
  useEffect(() => {
    authInitCallCount++;
    console.log(`🔐 [AuthInitializer] useEffect INIT CALL #${authInitCallCount}`);
    let mounted = true;
    let timeoutId;
    
    const init = async () => {
      try {
        console.log(`🔐 [AuthInitializer] Call #${authInitCallCount}: Starting authentication initialization...`);

        // Add a timeout to prevent infinite hanging
        timeoutId = setTimeout(() => {
          if (!mounted) return;
          console.error('⚠️ [AuthInitializer] Auth initialization timeout');
          setInitError('Authentication check timed out. Please refresh the page.');
          setIsInitialized(true);
        }, 10000); // 10 second timeout

        // Call initializeAuth which will:
        // 1. Check for persisted token in localStorage
        // 2. Validate token with backend via getProfile()
        // 3. Set isAuthenticated based on validation
        console.log(`🔐 [AuthInitializer] Call #${authInitCallCount}: Calling initializeAuth()...`);
        await initializeAuth();
        clearTimeout(timeoutId);
        console.log(`🔐 [AuthInitializer] Call #${authInitCallCount}: Authentication initialization complete`);
      } catch (error) {
        console.error(`⚠️ [AuthInitializer] Call #${authInitCallCount}: Error during initialization:`, error);
        // Errors are expected when no token exists or token is invalid
        // The initializeAuth method handles cleanup
      } finally {
        if (mounted) {
          console.log(`🔐 [AuthInitializer] Call #${authInitCallCount}: Setting isInitialized=true`);
          setIsInitialized(true);
          clearTimeout(timeoutId);
        }
      }
    };

    // Start initialization immediately
    init();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [initializeAuth]);

  // Show error if initialization failed
  if (initError) {
    return <ErrorPage code="500" title="Authentication Error" message={initError} showHome={false} />;
  }

  // Block ALL rendering until initialization completes
  // This is CRITICAL - no routes can evaluate until auth is verified
  if (!isInitialized) {
    console.log(`🔐 [AuthInitializer] BLOCKING RENDER - storeIsLoading=${storeIsLoading}, isInitialized=${isInitialized}`);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 bg-primary" />
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase">
            INITIALIZING AUTHENTICATION...
          </p>
        </motion.div>
      </div>
    );
  }
  
  console.log('✅ [AuthInitializer] Rendering children');
  // SAFE TO RENDER: Auth initialization is complete
  // Protected routes can now safely check isAuthenticated
  return <>{children}</>;
}

export default AuthInitializer;