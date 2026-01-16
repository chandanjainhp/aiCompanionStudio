/**
 * LogoutButton Component
 * Example 9: Clean logout handler that clears auth state and redirects
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function LogoutButton() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear auth state + call logout API
      await logout();

      // Redirect to home
      navigate('/', { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      console.error('❌ Logout error:', err);
      setError(errorMsg);

      // Still redirect even if API call fails
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition"
      >
        {isLoading ? '🔄 Logging out...' : '🚪 Logout'}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error} (redirecting in 1.5s...)
        </p>
      )}
    </div>
  );
}

export default LogoutButton;
