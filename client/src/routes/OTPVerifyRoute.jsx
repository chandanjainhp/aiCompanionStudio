import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';
export function OTPVerifyRoute() {
  const location = useLocation();
  const isLoading = useAuthStore(state => state.isLoading);
  const otpSent = useAuthStore(state => state.otpSent);
  const otpEmail = useAuthStore(state => state.otpEmail);
  const otpMode = useAuthStore(state => state.otpMode);
  const _isHydrated = useAuthStore(state => state._isHydrated);

  // Wait for store to rehydrate from localStorage before checking state
  if (!_isHydrated) {
    console.log('⏳ [OTPVerifyRoute] Waiting for store rehydration...');
    return null; // Don't render anything until store is rehydrated
  }
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-3 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>;
  }

  // STRICT: Require OTP was sent AND we have valid state
  if (!otpSent || !otpEmail) {
    console.warn('⛔ [OTPVerifyRoute] Invalid OTP state. otpSent=%s, otpEmail=%s. Redirecting to login.', otpSent, otpEmail);
    return <Navigate to="/login" replace />;
  }

  // STRICT: Only allow if otpMode is present (register or login)
  if (!otpMode) {
    console.warn('⛔ [OTPVerifyRoute] otpMode not set. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }
  console.log('✅ [OTPVerifyRoute] OTP state valid. Mode=%s, Email=%s. Allowing access.', otpMode, otpEmail);
  return <Outlet />;
}
export default OTPVerifyRoute;