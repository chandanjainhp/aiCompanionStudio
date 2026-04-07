/**
 * useApiErrorHandler Hook
 * Handles API errors centrally, triggering logout on 401/403
 *
 * When 401/403 errors occur:
 * - Clears auth state from store
 * - Redirects to login page
 * - Shows error toast notification
 *
 * Usage:
 * const { handleApiError } = useApiErrorHandler();
 *
 * try {
 *   const response = await apiClient.someMethod();
 * } catch (error) {
 *   handleApiError(error);
 * }
 */

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useApiErrorHandler = () => {
  const logout = useAuthStore(state => state.logout);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApiError = async (error) => {
    // Check if this is a 401/403 authentication error
    if (error?.status === 401 || error?.status === 403) {
      console.error(`🔴 [useApiErrorHandler] Auth error (${error.status}):`, error.message);

      // Clear auth state
      console.log('🔓 [useApiErrorHandler] Logging out user due to auth error...');
      await logout();

      // Show error message
      const message = error.status === 401
        ? 'Your session has expired. Please log in again.'
        : 'You do not have permission to access this resource.';

      toast({
        title: 'Authentication Error',
        description: message,
        variant: 'destructive',
      });

      // Redirect to login
      console.log('🔁 [useApiErrorHandler] Redirecting to login...');
      navigate('/login', { replace: true });

      return true; // Error was handled
    }

    return false; // Error was not handled
  };

  return { handleApiError };
};

export default useApiErrorHandler;
