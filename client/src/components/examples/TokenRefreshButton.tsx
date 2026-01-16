/**
 * TokenRefreshButton Component
 * Example 6: Manual token refresh trigger with status feedback
 */

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type RefreshStatus = 'idle' | 'loading' | 'success' | 'error';

export function TokenRefreshButton() {
  const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
  const [status, setStatus] = useState<RefreshStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleManualRefresh = async () => {
    setStatus('loading');
    setMessage('');

    try {
      await refreshAccessToken();
      setStatus('success');
      setMessage('Token refreshed successfully!');

      // Reset after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 2000);
    } catch (error) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Token refresh failed';
      setMessage(errorMsg);
      console.error('❌ Token refresh failed:', error);

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return '🔄 Refreshing...';
      case 'success':
        return '✅ Refreshed!';
      case 'error':
        return '❌ Failed';
      default:
        return '🔄 Refresh Token';
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleManualRefresh}
        disabled={status === 'loading'}
        className={`px-4 py-2 ${getButtonColor()} disabled:opacity-50 text-white rounded-lg font-medium transition`}
      >
        {getButtonContent()}
      </button>

      {message && (
        <p
          className={`text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default TokenRefreshButton;
