/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * 
 * Features:
 * - Redirects to /login if not authenticated
 * - Preserves original location for post-login redirect
 * - Shows loading state while checking auth
 * - Supports nested routes via <Outlet />
 * - Validates token + user consistency
 * - Blocks access completely until auth is verified
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  requiredRole?: string;
  loadingComponent?: React.ReactNode;
}

let redirectCount = 0;
const REDIRECT_LIMIT = 5;

export function ProtectedRoute({
  requiredRole,
  loadingComponent,
}: ProtectedRouteProps) {
  const location = useLocation();
  const redirectCounterRef = useRef(0);
  
  // Use Zustand selectors for optimal performance
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  console.log(`🛣️  [ProtectedRoute] Render for path: ${location.pathname}`, {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!accessToken,
    isLoading,
  });

  // DETECT AND FIX CORRUPTED STATE
  // This prevents infinite loops when token exists but user doesn't
  useEffect(() => {
    // Check if we have token but no user (corrupted state)
    if (accessToken && !user) {
      console.error(
        '🚨 [ProtectedRoute] CORRUPTED AUTH STATE DETECTED:',
        'Token exists but user is null. Clearing auth...'
      );
      
      // Clear all auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      
      // Reset Zustand store
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
      });

      console.log('✅ [ProtectedRoute] Corrupted auth state cleared');
    }
  }, [accessToken, user]);

  // CRITICAL: Show loading state while checking authentication
  // This prevents any protected content from rendering until auth is verified
  if (isLoading) {
    console.log('⏳ [ProtectedRoute] Auth check in progress. Blocking access to:', location.pathname);
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="space-y-3 w-full max-w-md px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )
    );
  }

  // CRITICAL: Check BOTH token AND user exist
  // Prevent access if either is missing
  const isFullyAuthenticated = isAuthenticated && user && accessToken;

  if (!isFullyAuthenticated) {
    redirectCounterRef.current++;
    redirectCount++;
    
    console.log(
      `🔐 [ProtectedRoute] REDIRECT #${redirectCount} Access denied. Auth state:`,
      {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!accessToken,
      },
      `From ${location.pathname} → /login`
    );

    if (redirectCount > REDIRECT_LIMIT) {
      console.error(`❌ [ProtectedRoute] INFINITE REDIRECT DETECTED! Redirected ${redirectCount} times`);
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required (for future RBAC implementation)
  // Note: User type currently doesn't have role property - skip for now
  // if (requiredRole && user.role !== requiredRole) {
  //   console.warn(
  //     `🚫 Access denied: User role "${user.role}" does not match required role "${requiredRole}"`
  //   );
  //   return (
  //     <Navigate to="/unauthorized" state={{ from: location }} replace />
  //   );
  // }

  console.log(`✅ [ProtectedRoute] Full authentication verified. Allowing access to: ${location.pathname}`, { username: user.email });

  // Render nested routes
  return <Outlet />;
}

export default ProtectedRoute;
