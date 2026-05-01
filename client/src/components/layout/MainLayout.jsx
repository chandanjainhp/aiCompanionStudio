import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AppTopbar } from './AppTopbar';
export function MainLayout() {
  const {
    isAuthenticated
  } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <div className="dark min-h-screen w-full" style={{ backgroundColor: '#0E0C0A' }}>
      <AppTopbar />
      <main style={{ paddingTop: 56 }}>
        <Outlet />
      </main>
    </div>;
}