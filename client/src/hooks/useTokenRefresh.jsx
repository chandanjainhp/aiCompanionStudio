import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getTokenExpiryIn } from '@/lib/tokenUtils';

/**
 * useTokenRefresh Hook
 *
 * Automatically handles JWT token refresh before expiration
 * Prevents 401 errors by proactively refreshing
 *
 * Features:
 * - Checks token expiration on mount
 * - Refreshes before expiration (5 min buffer)
 * - Handles refresh errors gracefully
 * - Cleanup on unmount
 *
 * Example:
 * ```
 * useTokenRefresh();
 * ```
 */

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export const useTokenRefresh = () => {
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshAccessToken = useAuthStore(state => state.refreshAccessToken);
  useEffect(() => {
    if (!accessToken) return;

    // Get time until expiration using centralized utility
    const secondsUntilExpiry = getTokenExpiryIn(accessToken);

    if (secondsUntilExpiry === null) {
      console.warn('⚠️ [useTokenRefresh] Could not determine token expiry');
      return;
    }

    const timeUntilExpiration = secondsUntilExpiry * 1000; // Convert to milliseconds

    // If already expired, refresh immediately
    if (timeUntilExpiration <= 0) {
      console.warn('⏰ [useTokenRefresh] Token already expired - refreshing');
      refreshAccessToken();
      return;
    }

    // Schedule refresh before expiration
    const refreshTime = Math.max(0, timeUntilExpiration - TOKEN_REFRESH_BUFFER_MS);
    console.debug(`🔄 [useTokenRefresh] Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
    const timeoutId = setTimeout(async () => {
      console.debug('🔄 [useTokenRefresh] Proactively refreshing token...');
      try {
        await refreshAccessToken();
        console.debug('✅ [useTokenRefresh] Token refreshed successfully');
      } catch (error) {
        console.error('❌ [useTokenRefresh] Token refresh failed:', error);
        // authStore handles logout on error
      }
    }, refreshTime);
    return () => clearTimeout(timeoutId);
  }, [accessToken, refreshAccessToken]);
};
export default useTokenRefresh;
