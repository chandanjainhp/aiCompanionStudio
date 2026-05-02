import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().optional(),
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
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
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

  const handleLoginMethodChange = method => {
    setLoginMethod(method);
    setAuthLoginMethod(method);
    clearOTPState();
    reset({
      email,
      password: '',
      rememberMe: false
    });
  };

  const handlePasswordLogin = async data => {
    try {
      await login(data.email, data.password);
      toast({
        title: 'WELCOME BACK',
        description: 'You have successfully logged in.'
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Please check your credentials and try again.';
      toast({
        title: 'LOGIN FAILED',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  const handleOTPLogin = async data => {
    try {
      await sendOTP(data.email, 'login');
      toast({
        title: 'OTP SENT',
        description: 'Check your email for the verification code'
      });
      navigate('/verify-otp', {
        state: { email: data.email }
      });
    } catch (error) {
      toast({
        title: 'OTP REQUEST FAILED',
        description: error instanceof Error ? error.message : 'Could not send OTP. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async data => {
    if (loginMethod === 'password' && !data.password) {
      toast({
        title: 'PASSWORD REQUIRED',
        description: 'Please enter your password',
        variant: 'destructive'
      });
      return;
    }
    if (loginMethod === 'password') {
      await handlePasswordLogin(data);
    } else if (loginMethod === 'otp') {
      await handleOTPLogin(data);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left sidebar - messaging */}
      <div className="flex-1 bg-muted/20 border-r-2 border-primary hidden sm:flex flex-col justify-center px-12 py-16 min-w-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 mb-8 border-b-2 border-primary inline-block pb-1">
            AUTHENTICATION REQUIRED
          </div>
          <h2 className="font-display text-[48px] font-black leading-[1.1] mb-6 tracking-tight uppercase">
            ACCESS <br/><span className="text-muted-foreground">WORKSPACE</span>
          </h2>
          <p className="font-body text-[16px] leading-[1.6] mb-12 max-w-sm border-l-2 border-primary pl-4">
            Sign in with your email and password, or use a one-time code sent to your inbox.
          </p>
          <div className="flex gap-8 pt-8 border-t-2 border-primary">
            {[
              { label: 'SECURE ENCLAVE', icon: '01' },
              { label: 'VERIFIED ACCESS', icon: '02' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="font-mono text-[24px] font-bold opacity-30">{item.icon}</div>
                <div className="flex flex-col justify-center">
                  <div className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-w-0">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase mb-8 pb-4 border-b-2 border-primary flex justify-between items-center">
            <span>SIGN IN</span>
            <span className="text-[10px] bg-foreground text-background px-2 py-0.5">V_1.0</span>
          </div>

          {/* Login method selector */}
          <div className="flex mb-8 border-2 border-primary">
            {[
              { method: 'password', label: 'PASSWORD' },
              { method: 'otp', label: 'EMAIL OTP' },
            ].map((item) => (
              <button
                key={item.method}
                type="button"
                onClick={() => handleLoginMethodChange(item.method)}
                className={cn(
                  "flex-1 py-3 font-mono text-[11px] font-bold tracking-[0.1em] transition-colors border-r-2 border-primary last:border-r-0",
                  loginMethod === item.method 
                    ? "bg-foreground text-background" 
                    : "bg-background text-foreground hover:bg-muted/20"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Email */}
          <div className="mb-6 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <Mail size={12} /> EMAIL ADDRESS
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0", errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em]">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password - conditional */}
          {loginMethod === 'password' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mb-6 space-y-2">
              <div className="flex justify-between items-end">
                <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
                  <Lock size={12} /> PASSWORD
                </Label>
                <Link
                  to="/forgot-password"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] underline hover:no-underline"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  {...register('password')}
                  className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0 pr-10", errors.password && "border-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em]">
                  {errors.password.message}
                </p>
              )}
            </motion.div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading || !email || (loginMethod === 'password' && !password)}
            className="w-full h-14 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[12px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3 mt-8"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{loginMethod === 'password' ? 'SIGNING IN...' : 'SENDING...'}</span>
              </>
            ) : (
              <>
                <span>{loginMethod === 'password' ? 'SIGN IN' : 'SEND OTP'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          {/* Sign up link */}
          <div className="mt-8 pt-6 border-t-2 border-primary text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em]">
              NO ACCOUNT?{' '}
              <Link to="/register" className="font-bold underline hover:no-underline ml-2">
                CREATE ONE
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
