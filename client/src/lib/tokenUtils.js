/**
 * Client-side JWT token utilities
 * Handles token expiry validation and cleanup
 */

/**
 * Decodes JWT token without verification
 * Safe to use on client-side for reading token claims
 * @param {string} token - JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ [tokenUtils] Invalid token format - expected 3 parts, got', parts.length);
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if necessary
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);

    // Decode from base64 using browser API (atob)
    // Buffer.from() is Node.js only and won't work in browsers
    const decoded = JSON.parse(
      atob(padded)
    );

    console.log('✅ [tokenUtils] Base64 decoded, parsing JSON...');

    console.log('✅ [tokenUtils] Token decoded successfully');
    return decoded;
  } catch (error) {
    console.error('❌ [tokenUtils] Failed to decode token:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
      console.warn('⚠️ [tokenUtils] Token has no expiry claim');
      return true;
    }

    // exp is in seconds, convert to milliseconds
    const expiryTime = decoded.exp * 1000;
    const now = Date.now();

    // Add 5 second buffer to avoid edge cases
    const isExpired = now >= (expiryTime - 5000);

    if (isExpired) {
      console.log('⏰ [tokenUtils] Token is expired:', {
        expiryTime: new Date(expiryTime).toISOString(),
        now: new Date(now).toISOString(),
        expired: true
      });
    } else {
      const secondsUntilExpiry = Math.floor((expiryTime - now) / 1000);
      console.log('⏰ [tokenUtils] Token is valid for', secondsUntilExpiry, 'seconds');
    }

    return isExpired;
  } catch (error) {
    console.error('❌ [tokenUtils] Error checking token expiry:', error instanceof Error ? error.message : error);
    return true; // Treat as expired if we can't check
  }
}

/**
 * Get time until token expires in seconds
 * @param {string} token - JWT token
 * @returns {number|null} Seconds until expiry, or null if invalid
 */
export function getTokenExpiryIn(token) {
  try {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
      return null;
    }

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const secondsUntilExpiry = Math.floor((expiryTime - now) / 1000);

    return Math.max(0, secondsUntilExpiry);
  } catch (error) {
    console.error('❌ [tokenUtils] Error getting token expiry:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Clean up expired tokens from localStorage
 * Called on app startup to remove stale tokens
 */
export function cleanupExpiredTokens() {
  console.log('🧹 [tokenUtils] Checking for expired tokens in localStorage...');

  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.log('🧹 [tokenUtils] No token found in localStorage');
    return;
  }

  if (isTokenExpired(token)) {
    console.log('🚀 [tokenUtils] Found expired token, removing from localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return true;
  }

  console.log('✅ [tokenUtils] Token in localStorage is still valid');
  return false;
}
