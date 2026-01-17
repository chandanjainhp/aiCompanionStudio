import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().optional(), // Optional - only required for password mode
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const navigate = useNavigate();
  const { login, sendOTP, isLoading, isAuthenticated, clearOTPState, setLoginMethod: setAuthLoginMethod } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated. Navigating to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const email = watch('email');
  const password = watch('password');

  // STRICT: When switching login method, clear irrelevant state
  const handleLoginMethodChange = (method: 'password' | 'otp') => {
    console.log(`🔄 [LoginForm] Switching login method from ${loginMethod} to ${method}`);
    setLoginMethod(method);
    setAuthLoginMethod(method); // Also update auth store
    clearOTPState(); // Clear any OTP state
    reset({ email, password: '', rememberMe: false }); // Reset password field but keep email
  };

  // PASSWORD LOGIN: Call ONLY password login API
  const handlePasswordLogin = async (data: LoginForm) => {
    console.log('🔐 [LoginForm] PASSWORD LOGIN: Starting password login for:', data.email);
    try {
      console.log('📡 [LoginForm] PASSWORD LOGIN: Calling login API...');
      await login(data.email, data.password);
      
      console.log('✅ [LoginForm] PASSWORD LOGIN: Success');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      // Navigation handled by isAuthenticated watcher above
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Please check your credentials and try again.';
      console.error('❌ [LoginForm] PASSWORD LOGIN: Error:', error);
      
      toast({
        title: 'Login failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  // OTP LOGIN: Call ONLY OTP send API, navigate to verify page
  const handleOTPLogin = async (data: LoginForm) => {
    console.log('🔐 [LoginForm] OTP LOGIN: Starting OTP login for:', data.email);
    try {
      console.log('📡 [LoginForm] OTP LOGIN: Calling sendOTP API...');
      await sendOTP(data.email, 'login');
      
      console.log('✅ [LoginForm] OTP LOGIN: OTP sent successfully');
      toast({
        title: 'OTP sent',
        description: 'Check your email for the verification code',
      });
      
      console.log('🔀 [LoginForm] OTP LOGIN: Navigating to verify-otp page...');
      navigate('/verify-otp', {
        state: { email: data.email },
      });
    } catch (error) {
      console.error('❌ [LoginForm] OTP LOGIN: Error:', error);
      toast({
        title: 'OTP request failed',
        description: error instanceof Error ? error.message : 'Could not send OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // STRICT SUBMISSION: Route to correct handler based on method
  const onSubmit = async (data: LoginForm) => {
    console.log(`📋 [LoginForm] SUBMIT: loginMethod=${loginMethod}`);
    
    // STRICT: Validate password for password mode
    if (loginMethod === 'password' && !data.password) {
      toast({
        title: 'Password required',
        description: 'Please enter your password',
        variant: 'destructive',
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
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 shadow-strong">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="mt-2">
              Sign in to your ChatForge account
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* STRICT LOGIN METHOD SELECTOR */}
            <div className="space-y-2">
              <Label className="font-semibold">Login method</Label>
              <div className="flex gap-3 p-3 bg-muted rounded-lg">
                <label className="flex-1 flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-background transition-colors">
                  <input
                    type="radio"
                    value="password"
                    checked={loginMethod === 'password'}
                    onChange={() => handleLoginMethodChange('password')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">Password</span>
                </label>
                <label className="flex-1 flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-background transition-colors">
                  <input
                    type="radio"
                    value="otp"
                    checked={loginMethod === 'otp'}
                    onChange={() => handleLoginMethodChange('otp')}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">Via Email OTP</span>
                </label>
              </div>
            </div>

            {/* EMAIL FIELD - ALWAYS VISIBLE */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD FIELD - ONLY SHOW FOR PASSWORD METHOD */}
            {loginMethod === 'password' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* REMEMBER ME - ONLY SHOW FOR PASSWORD METHOD */}
            {loginMethod === 'password' && (
              <div className="flex items-center space-x-2 animate-in fade-in duration-200">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                isLoading || 
                !email || 
                (loginMethod === 'password' && !password)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {loginMethod === 'password' ? 'Signing in...' : 'Sending OTP...'}
                </>
              ) : (
                loginMethod === 'password' ? 'Sign in' : 'Send OTP'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
