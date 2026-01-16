/**
 * ConditionalComponent
 * Example 10: Show/hide content based on authentication status
 * Demonstrates conditional rendering with auth state
 */

import { useAuthStore } from '@/store/authStore';

export function ConditionalComponent() {
  // Access auth state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="p-4 rounded-lg border">
      {isAuthenticated ? (
        <div className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">👤</div>
            <div className="flex-1">
              <h2 className="font-bold text-green-900">
                Welcome, {user?.name || user?.email}!
              </h2>
              <p className="text-sm text-green-700 mt-1">
                Email: {user?.email}
              </p>
              <div className="mt-3 flex gap-2">
                <a
                  href="/dashboard"
                  className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/profile"
                  className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  View Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔓</div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">Please Login</h2>
              <p className="text-sm text-gray-600 mt-1">
                You need to be authenticated to access protected features
              </p>
              <div className="mt-3 flex gap-2">
                <a
                  href="/login"
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Login Now
                </a>
                <a
                  href="/register"
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConditionalComponent;
