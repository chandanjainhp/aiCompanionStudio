/**
 * SessionTimeoutWarning Component
 * Example 8: Shows warning banner 2 minutes before session expires
 * Automatically appears when token is about to expire
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
const SESSION_WARNING_TIME = 2 * 60 * 1000; // 2 minutes before expiry

export function SessionTimeoutWarning() {
  const accessToken = useAuthStore(state => state.accessToken);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  useEffect(() => {
    if (!accessToken) return;
    const decodeToken = token => {
      try {
        const parts = token.split('.');
        return parts.length === 3 ? JSON.parse(atob(parts[1])) : null;
      } catch {
        return null;
      }
    };
    const decoded = decodeToken(accessToken);
    if (!decoded?.exp) return;
    const expirationTime = decoded.exp * 1000;
    const warningTime = expirationTime - SESSION_WARNING_TIME;
    const now = Date.now();
    const timeUntilWarning = warningTime - now;

    // Show warning if already within 2 minutes
    if (timeUntilWarning <= 0) {
      setShowWarning(true);
      return;
    }

    // Schedule warning to appear in (expiration - 2 minutes)
    const timeoutId = setTimeout(() => setShowWarning(true), timeUntilWarning);

    // Update remaining time every second
    const intervalId = setInterval(() => {
      const remaining = expirationTime - Date.now();
      if (remaining <= 0) {
        clearInterval(intervalId);
        setTimeRemaining('Expired');
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor(remaining % 60000 / 1000);
        setTimeRemaining(`${minutes}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [accessToken]);
  if (!showWarning) return null;
  return <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div className="text-xl">⚠️</div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold">Session Timeout Warning</h3>
          <p className="text-sm mt-1">Your session expires in {timeRemaining}</p>
          <p className="text-xs mt-2 opacity-90">You will be automatically logged out for security.</p>
          
          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowWarning(false)} className="text-xs font-medium px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>;
}
export default SessionTimeoutWarning;