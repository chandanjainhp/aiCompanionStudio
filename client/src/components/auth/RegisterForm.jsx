import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bot, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* -------------------- VALIDATION -------------------- */

const passwordRules = [{
  id: 'length',
  label: 'At least 8 characters',
  regex: /.{8,}/
}, {
  id: 'uppercase',
  label: 'One uppercase letter',
  regex: /[A-Z]/
}, {
  id: 'number',
  label: 'One number',
  regex: /[0-9]/
}, {
  id: 'special',
  label: 'One special character',
  regex: /[@$!%*?&]/
}];
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number').regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the terms'
    })
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
/* -------------------- COMPONENT -------------------- */

export function RegisterForm() {
  const navigate = useNavigate();
  const {
    sendRegistrationOTP,
    isLoading
  } = useAuthStore();
  const {
    toast
  } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });
  const watchedPassword = watch('password') || password;
  const onSubmit = async data => {
    try {
      // Send OTP - does NOT create user yet
      await sendRegistrationOTP(data.name, data.email, data.password);
      toast({
        title: 'OTP sent',
        description: 'Check your email for the verification code'
      });
      // Navigate to OTP verification page (unified for both registration and login)
      navigate('/verify-otp', {
        state: {
          email: data.email,
          name: data.name,
          mode: 'register'
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Registration failed',
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }}>
      <Card className="border-border/50 shadow-strong">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription className="mt-2">
              Get started with ChatForge for free
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 mt-4">
            {/* NAME */}
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} {...register('password')} onChange={e => {
                register('password').onChange(e);
                setPassword(e.target.value);
              }} className={cn(errors.password && 'border-destructive')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <div className="space-y-1 mt-2">
                {passwordRules.map(rule => {
                const ok = rule.regex.test(watchedPassword || '');
                return <div key={rule.id} className="flex items-center gap-2 text-sm">
                      {ok ? <Check className="text-green-500 w-4 h-4" /> : <X className="text-muted-foreground w-4 h-4" />}
                      <span className={ok ? 'text-green-600' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </div>;
              })}
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>}
            </div>

            {/* TERMS */}
            <div className="flex items-center space-x-2">
              <Controller name="acceptTerms" control={control} render={({
              field
            }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
              <Label>I agree to <Link to="/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Terms & Privacy Policy</Link></Label>
            </div>

            {errors.acceptTerms && <p className="text-sm text-destructive">
                {errors.acceptTerms.message}
              </p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create account
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>;
}
export default RegisterForm;