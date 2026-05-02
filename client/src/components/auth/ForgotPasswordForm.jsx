import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { sendOTP, isLoading } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async data => {
    try {
      await sendOTP(data.email, 'reset_password');
      toast({ title: 'OTP SENT', description: 'Check your email for the verification code' });
      navigate('/verify-otp', { state: { email: data.email, mode: 'reset_password' } });
    } catch (error) {
      toast({
        title: 'REQUEST FAILED',
        description: error instanceof Error ? error.message : 'Could not process request',
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
            PASSWORD RECOVERY
          </div>
          <div className="w-12 h-12 bg-background border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <Mail size={20} className="text-primary" />
          </div>
          <h1 className="font-display text-[32px] font-black leading-[1.1] mb-4 tracking-tight uppercase">
            RESET YOUR <br/><span className="text-muted-foreground">PASSWORD</span>
          </h1>
          <p className="font-body text-[14px] leading-[1.6] opacity-80 max-w-[320px] mx-auto border-l-2 border-primary pl-4 text-left">
            Enter your email and we'll send a one-time code to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-muted/20 border-2 border-primary p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
                <Mail size={12} /> EMAIL ADDRESS
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0 text-center", errors.email && "border-destructive")}
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-destructive uppercase tracking-[0.05em] text-center mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[11px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SENDING CODE...</span>
                </>
              ) : (
                <>
                  <span>SEND RESET CODE</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-primary text-center">
          <Link
            to="/login"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] underline hover:no-underline inline-flex items-center gap-2"
          >
            <ArrowLeft size={12} />
            BACK TO SIGN IN
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
