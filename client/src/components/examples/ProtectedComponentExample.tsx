/**
 * ProtectedComponentExample Component
 * Example 5: Manual route protection in components using useAuthGuard hook
 * Shows 3 different patterns for component-level protection
 */

import { useAuthGuard } from '@/hooks/useAuthGuard';

/**
 * Pattern 1: Basic protection - just check if authenticated
 */
export function ProtectedComponent() {
  const { shouldRender, isLoading } = useAuthGuard();

  if (isLoading) return <div className="text-center py-4">🔄 Loading...</div>;
  if (!shouldRender) return null;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-semibold text-green-900">✅ Protected Content</h3>
      <p className="text-sm text-green-700 mt-1">This only shows if authenticated</p>
    </div>
  );
}

/**
 * Pattern 2: Custom redirect destination
 */
export function CustomRedirectComponent() {
  const { shouldRender } = useAuthGuard({
    redirectTo: '/custom-login-page',
  });

  if (!shouldRender) return null;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-900">🔐 Custom Redirect Protected</h3>
      <p className="text-sm text-blue-700 mt-1">Redirects to custom page if not authenticated</p>
    </div>
  );
}

/**
 * Pattern 3: Custom callback on redirect (for analytics, etc.)
 */
export function CustomCallbackComponent() {
  const { shouldRender } = useAuthGuard({
    onRedirect: () => {
      console.log('📊 Analytics: User was redirected from protected component');
    },
  });

  if (!shouldRender) return null;

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h3 className="font-semibold text-purple-900">📊 Tracked Protection</h3>
      <p className="text-sm text-purple-700 mt-1">Redirect events are logged for analytics</p>
    </div>
  );
}

/**
 * Combined example showing all patterns
 */
export function ProtectedComponentExamples() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">Protected Component Examples</h2>
      
      <ProtectedComponent />
      <CustomRedirectComponent />
      <CustomCallbackComponent />
    </div>
  );
}

export default ProtectedComponentExamples;
