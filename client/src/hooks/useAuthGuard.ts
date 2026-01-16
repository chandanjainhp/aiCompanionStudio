import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * useAuthGuard Hook
 * 
 * Custom hook for programmatic route protection
 * Useful for protecting pages that aren't wrapped in ProtectedRoute
 * 
 * @returns {Object} Auth guard utilities
 * 
 * Example:
 * ```
 * const { isAuthenticated, isLoading } = useAuthGuard('/dashboard');
 * ```
 */

interface UseAuthGuardOptions {
  /** Route to redirect to if not authenticated */
  redirectTo?: string;
  /** Optional callback after redirect */
  onRedirect?: () => void;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { redirectTo = '/login', onRedirect } = options;
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Still loading auth check
    if (isLoading) {
      setShouldRender(false);
      return;
    }

    // Token exists but user data is missing → logout
    if (accessToken && !user) {
      console.warn('🔐 Token without user - logging out');
      logout();
      navigate(redirectTo, { replace: true });
      onRedirect?.();
      return;
    }

    // Not authenticated → redirect
    if (!isAuthenticated || !user || !accessToken) {
      console.debug('🚫 useAuthGuard: Not authenticated');
      navigate(redirectTo, { replace: true });
      onRedirect?.();
      return;
    }

    // All checks passed
    setShouldRender(true);
  }, [isAuthenticated, user, accessToken, isLoading, logout, navigate, redirectTo, onRedirect]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender,
    user,
  };
};

export default useAuthGuard;
