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
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <AppTopbar />
      <main className="pt-[64px]">
        <Outlet />
      </main>
    </div>
  );
}