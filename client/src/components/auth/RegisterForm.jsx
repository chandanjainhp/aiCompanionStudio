import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, User, Mail, Lock, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordRules = [
  { id: 'length',    label: 'AT LEAST 8 CHARACTERS', regex: /.{8,}/ },
  { id: 'uppercase', label: 'ONE UPPERCASE LETTER',   regex: /[A-Z]/ },
  { id: 'number',    label: 'ONE NUMBER',              regex: /[0-9]/ },
  { id: 'special',   label: 'ONE SPECIAL CHARACTER',  regex: /[@$!%*?&]/ },
];

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const { sendRegistrationOTP, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password') || '';
  const watchedTerms = watch('acceptTerms');

  const onSubmit = async data => {
    try {
      await sendRegistrationOTP(data.name, data.email, data.password);
      toast({ title: 'OTP SENT', description: 'Check your email for the verification code' });
      navigate('/verify-otp', { state: { email: data.email, name: data.name, mode: 'register' } });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'REGISTRATION FAILED', description: errorMsg, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left sidebar */}
      <div className="flex-1 bg-muted/20 border-r-2 border-primary hidden sm:flex flex-col justify-center px-12 py-16 min-w-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 mb-8 border-b-2 border-primary inline-block pb-1">
            NEW ACCOUNT
          </div>
          <h2 className="font-display text-[48px] font-black leading-[1.1] mb-6 tracking-tight uppercase">
            BUILD YOUR <br/><span className="text-muted-foreground">WORKSPACE</span>
          </h2>
          <p className="font-body text-[16px] leading-[1.6] mb-12 max-w-sm border-l-2 border-primary pl-4">
            Create an account to configure, deploy, and manage AI companions. Your workspace, your rules.
          </p>

          <div className="flex flex-col gap-6 pt-8 border-t-2 border-primary">
            {[
              { label: 'UNLIMITED PROJECTS', desc: 'No cap on what you build' },
              { label: 'CUSTOM MODELS',       desc: 'GPT-4, Claude, Llama, and more' },
              { label: 'OTP VERIFIED',        desc: 'Secure email verification' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-1.5 rounded-none bg-primary flex-shrink-0" />
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold mb-1">{item.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-w-0 overflow-y-auto">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] py-8"
        >
          <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase mb-8 pb-4 border-b-2 border-primary flex justify-between items-center">
            <span>REGISTER</span>
            <span className="text-[10px] bg-foreground text-background px-2 py-0.5">V_1.0</span>
          </div>

          {/* Name */}
          <div className="mb-6 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <User size={12} /> FULL NAME
            </Label>
            <Input
              type="text"
              placeholder="Jane Smith"
              {...register('name')}
              className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0", errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <Mail size={12} /> EMAIL ADDRESS
            </Label>
            <Input
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

          {/* Password */}
          <div className="mb-6 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <Lock size={12} /> PASSWORD
            </Label>
            <div className="relative">
              <Input
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

            {/* Password strength */}
            <div className="mt-4 p-4 bg-muted/20 border-2 border-primary flex flex-col gap-2">
              {passwordRules.map(rule => {
                const ok = rule.regex.test(watchedPassword);
                return (
                  <div key={rule.id} className="flex items-center gap-3">
                    {ok
                      ? <Check size={12} className="text-primary flex-shrink-0" />
                      : <X size={12} className="text-muted-foreground flex-shrink-0" />
                    }
                    <span className={cn(
                      "font-mono text-[10px] tracking-[0.05em]",
                      ok ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <Lock size={12} /> CONFIRM PASSWORD
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                {...register('confirmPassword')}
                className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0 pr-10", errors.confirmPassword && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="mb-8 pb-6 border-b-2 border-primary">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={!!field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <div className="w-4 h-4 border-2 border-primary bg-background peer-checked:bg-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-colors flex items-center justify-center">
                      {field.value && <Check size={12} className="text-background" />}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-[0.05em] leading-relaxed mt-0.5">
                    I AGREE TO THE{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground font-bold underline hover:no-underline"
                    >
                      TERMS &amp; PRIVACY POLICY
                    </Link>
                  </span>
                </label>
              )}
            />
            {errors.acceptTerms && (
              <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em] mt-2">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !watchedTerms}
            className="w-full h-14 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[12px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3 mb-8"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <>
                <span>CREATE ACCOUNT</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          {/* Sign in link */}
          <div className="pt-6 border-t-2 border-primary text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em]">
              ALREADY HAVE AN ACCOUNT?{' '}
              <Link to="/login" className="font-bold underline hover:no-underline ml-2">
                SIGN IN
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default RegisterForm;
