import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AuthLayout } from '@/components/layout';
import { OTPLoginForm } from '@/components/auth/OTPLoginForm';
export function OTPLogin() {
  const {
    isAuthenticated
  } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [isAuthenticated, navigate]);
  return <AuthLayout>
      <div className="flex items-center justify-center min-h-[600px]">
        <OTPLoginForm />
      </div>
    </AuthLayout>;
}