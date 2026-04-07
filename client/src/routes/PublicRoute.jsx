/**
 * PublicRoute Component
 * Wraps public routes (/login, /register, etc)
 * 
 * CRITICAL: Prevents infinite redirect loops by:
 * - Checking current path before redirecting
 * - Waiting for auth initialization to complete
 * - Not redirecting if already on target route
 * 
 * Features:
 * - Allows access if NOT authenticated
 * - Redirects to /dashboard if user IS authenticated
 * - Shows loading state while checking auth
 * - Prevents logged-in users from seeing login page
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';
export function PublicRoute({
  loadingComponent
}) {
  const location = useLocation();

  // Use Zustand selectors for optimal performance
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('⏳ [PublicRoute] Auth check in progress. Blocking access to:', location.pathname);
    return loadingComponent || <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="space-y-3 w-full max-w-md px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>;
  }

  // CRITICAL: Only redirect if FULLY authenticated (token + user both exist)
  // This prevents redirecting on partial auth state (token without user)
  const isFullyAuthenticated = isAuthenticated && user && accessToken;
  if (isFullyAuthenticated) {
    const targetPath = location.state?.from?.pathname || '/dashboard';

    // PREVENT INFINITE LOOP: Don't redirect if already going there
    if (location.pathname === targetPath) {
      console.log(`📍 [PublicRoute] Already at target path: ${targetPath}`);
      return <Outlet />;
    }
    console.log(`📍 [PublicRoute] User authenticated. Redirecting from ${location.pathname} to ${targetPath}`);
    return <Navigate to={targetPath} replace />;
  }

  // Not authenticated → allow access to public route
  console.log(`🔓 [PublicRoute] Public route access allowed: ${location.pathname}`);

  // Render nested routes
  return <Outlet />;
}
export default PublicRoute;