import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async data => {
    try {
      await resetPassword(data.password);
      toast({ title: 'PASSWORD RESET', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'RESET FAILED',
        description: error instanceof Error ? error.message : 'Could not reset password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 mb-6 border-b-2 border-primary inline-block pb-1">
            SET NEW PASSWORD
          </div>
          <div className="w-12 h-12 bg-background border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <Lock size={20} className="text-primary" />
          </div>
          <h1 className="font-display text-[32px] font-black leading-[1.1] mb-4 tracking-tight uppercase">
            CHOOSE A <br/><span className="text-muted-foreground">NEW PASSWORD</span>
          </h1>
          <p className="font-body text-[14px] leading-[1.6] opacity-80 max-w-[320px] mx-auto border-l-2 border-primary pl-4 text-left">
            Create a strong password for your account. Minimum 8 characters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-muted/20 border-2 border-primary p-6 sm:p-8">

            {/* New password */}
            <div className="mb-6 space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
                <Lock size={12} /> NEW PASSWORD
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
              {errors.password && (
                <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em] mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="mb-8 space-y-2">
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
                <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em] mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[12px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>UPDATING...</span>
                </>
              ) : (
                <>
                  <span>RESET PASSWORD</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
