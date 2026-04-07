import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
export function AuthLayout() {
  const {
    isAuthenticated
  } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Outlet />
      </div>
    </div>;
}