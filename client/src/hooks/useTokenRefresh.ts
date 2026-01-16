import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

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
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshAccessToken = useAuthStore(
    (state) => state.refreshAccessToken
  );

  useEffect(() => {
    if (!accessToken) return;

    // Decode token to get expiration time
    const decodeToken = (token: string) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const decoded = JSON.parse(atob(parts[1]));
        return decoded;
      } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
      }
    };

    const decoded = decodeToken(accessToken);
    if (!decoded?.exp) return;

    // Calculate time until expiration
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    // If already expired, refresh immediately
    if (timeUntilExpiration <= 0) {
      console.warn('⏰ Token already expired - refreshing');
      refreshAccessToken();
      return;
    }

    // Schedule refresh before expiration
    const refreshTime = Math.max(0, timeUntilExpiration - TOKEN_REFRESH_BUFFER_MS);

    console.debug(
      `🔄 Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`
    );

    const timeoutId = setTimeout(async () => {
      console.debug('🔄 Refreshing token...');
      try {
        await refreshAccessToken();
        console.debug('✅ Token refreshed successfully');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // authStore handles logout on error
      }
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [accessToken, refreshAccessToken]);
};

export default useTokenRefresh;
