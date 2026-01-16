import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * LoginRedirect Component
 * 
 * Smart redirect handler for login page:
 * - If user is already authenticated → redirect to dashboard
 * - If user was redirected from protected route → show message
 * - Otherwise → show normal login form
 */

interface LoginRedirectProps {
  children: React.ReactNode;
}

export const LoginRedirect: React.FC<LoginRedirectProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from;
      const redirect = from || '/dashboard';
      
      console.debug(`✅ User already authenticated - redirecting to ${redirect}`);
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  return <>{children}</>;
};

export default LoginRedirect;
