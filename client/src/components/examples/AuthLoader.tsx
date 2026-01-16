/**
 * AuthLoader Component
 * Example 2: Custom loading component shown during authentication checks
 * Used when ProtectedRoute is verifying user credentials
 */

export function AuthLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        
        {/* Loading text */}
        <p className="mt-4 text-gray-600 font-medium">Verifying your session...</p>
        <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}

export default AuthLoader;
