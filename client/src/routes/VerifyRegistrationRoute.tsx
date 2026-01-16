import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface VerifyRegistrationRouteProps {
  children: React.ReactNode;
}

export function VerifyRegistrationRoute({
  children,
}: VerifyRegistrationRouteProps) {
  const { registerOtpSent, registerEmail, _isHydrated } = useAuthStore();

  // Wait for store to rehydrate from localStorage before checking state
  if (!_isHydrated) {
    console.log('⏳ [VerifyRegistrationRoute] Waiting for store rehydration...');
    return null; // Don't render anything until store is rehydrated
  }

  // Only allow access if registration OTP was just sent
  // Both values must exist to access this route
  if (!registerOtpSent || !registerEmail) {
    console.log('🔴 [VerifyRegistrationRoute] Access denied:', {
      registerOtpSent,
      registerEmail,
    });
    return <Navigate to="/register" replace />;
  }

  console.log('✅ [VerifyRegistrationRoute] Access granted');
  return <>{children}</>;
}
