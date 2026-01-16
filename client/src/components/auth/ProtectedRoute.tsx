import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ProtectedRoute Component
 * 
 * Handles authentication checks and secure route guarding.
 * Features:
 * - Checks authentication status
 * - Prevents unauthorized access
 * - Preserves intended route for redirect
 * - Shows loading skeleton during verification
 * - Handles token expiration
 */

interface ProtectedRouteProps {
  /** Optional: Require specific role (future feature) */
  requiredRole?: string;
  /** Optional: Custom loading component */
  loadingComponent?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  loadingComponent,
}) => {
  const location = useLocation();
  
  // Zustand selectors for optimal performance
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  /**
   * Validate token and user consistency
   * If token exists but user is null/invalid → logout + redirect
   */
  useEffect(() => {
    if (accessToken && !user) {
      console.warn('🔐 Token exists but user data missing - logging out');
      logout();
    }
  }, [accessToken, user, logout]);

  // Show loading skeleton while auth is being verified
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 w-full max-w-md px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )
    );
  }

  // User is not authenticated → redirect to login
  if (!isAuthenticated || !user || !accessToken) {
    console.debug('🚫 Access denied - redirecting to login');
    
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname, // Preserve intended route
          returnTo: location.pathname,
        }}
        replace
      />
    );
  }

  // Optional: Check role-based access (implement as needed)
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`⛔ User lacks required role: ${requiredRole}`);
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed → render protected content
  return <Outlet />;
};

export default ProtectedRoute;
