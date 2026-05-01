import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().optional(),
  // Optional - only required for password mode
  rememberMe: z.boolean().optional()
});
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password');
  const navigate = useNavigate();
  const {
    login,
    sendOTP,
    isLoading,
    isAuthenticated,
    clearOTPState,
    setLoginMethod: setAuthLoginMethod
  } = useAuthStore();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated. Navigating to dashboard...');
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [isAuthenticated, navigate]);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  const email = watch('email');
  const password = watch('password');

  // STRICT: When switching login method, clear irrelevant state
  const handleLoginMethodChange = method => {
    console.log(`🔄 [LoginForm] Switching login method from ${loginMethod} to ${method}`);
    setLoginMethod(method);
    setAuthLoginMethod(method); // Also update auth store
    clearOTPState(); // Clear any OTP state
    reset({
      email,
      password: '',
      rememberMe: false
    }); // Reset password field but keep email
  };

  // PASSWORD LOGIN: Call ONLY password login API
  const handlePasswordLogin = async data => {
    console.log('🔐 [LoginForm] PASSWORD LOGIN: Starting password login for:', data.email);
    try {
      console.log('📡 [LoginForm] PASSWORD LOGIN: Calling login API...');
      await login(data.email, data.password);
      console.log('✅ [LoginForm] PASSWORD LOGIN: Success');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });
      // Navigation handled by isAuthenticated watcher above
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Please check your credentials and try again.';
      console.error('❌ [LoginForm] PASSWORD LOGIN: Error:', error);
      toast({
        title: 'Login failed',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  // OTP LOGIN: Call ONLY OTP send API, navigate to verify page
  const handleOTPLogin = async data => {
    console.log('🔐 [LoginForm] OTP LOGIN: Starting OTP login for:', data.email);
    try {
      console.log('📡 [LoginForm] OTP LOGIN: Calling sendOTP API...');
      await sendOTP(data.email, 'login');
      console.log('✅ [LoginForm] OTP LOGIN: OTP sent successfully');
      toast({
        title: 'OTP sent',
        description: 'Check your email for the verification code'
      });
      console.log('🔀 [LoginForm] OTP LOGIN: Navigating to verify-otp page...');
      navigate('/verify-otp', {
        state: {
          email: data.email
        }
      });
    } catch (error) {
      console.error('❌ [LoginForm] OTP LOGIN: Error:', error);
      toast({
        title: 'OTP request failed',
        description: error instanceof Error ? error.message : 'Could not send OTP. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // STRICT SUBMISSION: Route to correct handler based on method
  const onSubmit = async data => {
    console.log(`📋 [LoginForm] SUBMIT: loginMethod=${loginMethod}`);

    // STRICT: Validate password for password mode
    if (loginMethod === 'password' && !data.password) {
      toast({
        title: 'Password required',
        description: 'Please enter your password',
        variant: 'destructive'
      });
      return;
    }
    if (loginMethod === 'password') {
      await handlePasswordLogin(data);
    } else if (loginMethod === 'otp') {
      await handleOTPLogin(data);
    } else {
      console.error('❌ [LoginForm] SUBMIT: Invalid login method:', loginMethod);
      toast({
        title: 'Configuration error',
        description: 'Please select a login method',
        variant: 'destructive'
      });
    }
  };
  const DB = {
    bg: '#0E0C0A',
    surface: '#161210',
    border: '#252018',
    borderBright: '#352C1C',
    accent: '#E8961E',
    accentDark: '#9A5E0A',
    text: '#F0E8D8',
    muted: '#7A6A54',
    green: '#4ADE80',
    red: '#FF5C5C',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text, display: 'flex' }}>
      <style>{`
        .login-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .login-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; }
        .login-input::placeholder { color: ${DB.muted}; }
        .login-input:focus { border-color: ${DB.accent}; }
        .login-input.error { border-color: ${DB.red}; }
        .login-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; }
        .login-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-method-btn { background: transparent; border: 1px solid ${DB.border}; color: ${DB.muted}; padding: 8px 14px; font-size: 10px; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.15s; letter-spacing: 0.1em; }
        .login-method-btn.active { background: ${DB.borderBright}; color: ${DB.accent}; border-color: ${DB.accent}; }
        .login-method-btn:hover { color: ${DB.text}; border-color: ${DB.muted}; }
      `}</style>

      {/* Left sidebar - messaging */}
      <div style={{ flex: 1, backgroundColor: DB.surface, borderRight: `1px solid ${DB.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px', minWidth: 0 }} className="hidden sm:flex">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="login-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 24 }}>
            AUTHENTICATION REQUIRED
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 20, fontStyle: 'italic', fontFamily: 'Fraunces, Georgia, serif' }}>
            Access your <span style={{ color: DB.accent }}>workspace</span>
          </h2>
          <p style={{ fontSize: 13, color: DB.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 320 }}>
            Sign in with your email and password, or use a one-time code sent to your inbox. Your workspace awaits.
          </p>
          <div style={{ display: 'flex', gap: 16, paddingTop: 32, borderTop: `1px solid ${DB.border}` }}>
            {[
              { label: 'SECURE', icon: '🔐' },
              { label: 'VERIFIED', icon: '✓' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
                <div className="login-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.15em' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minWidth: 0 }}>
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <div className="login-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 32 }}>
            SIGN IN
          </div>

          {/* Login method selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: `1px solid ${DB.border}`, paddingBottom: 16 }}>
            {[
              { method: 'password', label: 'PASSWORD' },
              { method: 'otp', label: 'EMAIL OTP' },
            ].map((item) => (
              <button
                key={item.method}
                type="button"
                onClick={() => handleLoginMethodChange(item.method)}
                className="login-method-btn"
                style={{
                  background: loginMethod === item.method ? DB.borderBright : 'transparent',
                  color: loginMethod === item.method ? DB.accent : DB.muted,
                  borderColor: loginMethod === item.method ? DB.accent : DB.border,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label className="login-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
              <Mail size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="login-input"
              {...register('email')}
              style={{ borderColor: errors.email ? DB.red : DB.border }}
            />
            {errors.email && (
              <p className="login-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password - conditional */}
          {loginMethod === 'password' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ marginBottom: 20 }}>
              <label className="login-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
                <Lock size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className="login-input"
                  {...register('password')}
                  style={{ borderColor: errors.password ? DB.red : DB.border, paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="login-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                  {errors.password.message}
                </p>
              )}
              <div style={{ marginTop: 12 }}>
                <Link
                  to="/forgot-password"
                  className="login-mono"
                  style={{ fontSize: 9, color: DB.accent, textDecoration: 'none', letterSpacing: '0.1em', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                >
                  FORGOT PASSWORD?
                </Link>
              </div>
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="login-btn"
            disabled={isLoading || !email || (loginMethod === 'password' && !password)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
              marginTop: 28,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{loginMethod === 'password' ? 'SIGNING IN...' : 'SENDING...'}</span>
              </>
            ) : (
              <>
                <span>{loginMethod === 'password' ? 'SIGN IN' : 'SEND OTP'}</span>
                <ArrowRight size={11} />
              </>
            )}
          </button>

          {/* Sign up link */}
          <p className="login-mono" style={{ fontSize: 10, color: DB.muted, textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.6 }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: DB.accent, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              CREATE ONE
            </Link>
          </p>

          {/* Status indicator */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="login-mono" style={{ fontSize: 8, color: DB.green, letterSpacing: '0.1em' }}>● READY</span>
            <span className="login-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.1em' }}>v1.0</span>
          </div>
        </motion.form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
