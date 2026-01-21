import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const {
    verifyOTP,
    resendOTP,
    isLoading,
    otpMode,
    otpEmail,
    otpName,
    otpSent,
    clearOTPState,
    _isHydrated,
    loginMethod,
  } = useAuthStore();

  const stateEmail = (location.state as Record<string, unknown>)?.email as string | undefined;
  const stateName = (location.state as Record<string, unknown>)?.name as string | undefined;
  const email = otpEmail || stateEmail;
  const name = otpName || stateName;
  const mode = otpMode || ((location.state as Record<string, unknown>)?.mode as 'register' | 'login' | 'reset_password' | undefined);

  // CRITICAL: All hooks must be called unconditionally, before any early returns
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(900);
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(30);

  // Check state after rehydration
  useEffect(() => {
    // Don't check state until store is rehydrated
    if (!_isHydrated) {
      console.log('⏳ [VerifyOtp] Waiting for store rehydration...');
      return;
    }

    if (!email || !mode || !otpSent) {
      console.error('⛔ [VerifyOtp] Invalid state detected. Redirecting to login.', {
        hasEmail: !!email,
        mode,
        otpSent,
      });
      navigate('/login');
      return;
    }

    // STRICT: For login mode, ensure loginMethod was 'otp'
    if (mode === 'login' && loginMethod !== 'otp') {
      console.error('⛔ [VerifyOtp] LOGIN OTP without matching loginMethod. Redirecting.', {
        mode,
        loginMethod,
      });
      clearOTPState();
      navigate('/login');
      return;
    }

    console.log('✅ [VerifyOtp] State validated. Mode=%s, Email=%s', mode, email);
  }, [_isHydrated, email, mode, otpSent, loginMethod, navigate, clearOTPState]);


  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    if (attempts >= 3) {
      toast({
        title: 'Too many attempts',
        description: 'Please request a new OTP',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🔐 [VerifyOtp] Verifying OTP. Mode=%s', mode);
      await verifyOTP(email!, otp, mode as 'register' | 'login' | 'reset_password', name);

      console.log('✅ [VerifyOtp] OTP verified successfully. Mode=%s', mode);

      if (mode === 'register') {
        toast({
          title: 'Success',
          description: 'Account created. Please log in.',
        });
        navigate('/login');
      } else if (mode === 'login') {
        // STRICT: Clear OTP state before redirecting
        clearOTPState();
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        navigate('/dashboard');
      } else if (mode === 'reset_password') {
        toast({
          title: 'Verified',
          description: 'Please set your new password',
        });
        navigate('/reset-password');
      }
    } catch (err: Error | unknown) {
      const count = attempts + 1;
      setAttempts(count);
      setOtp('');

      toast({
        title: 'Incorrect OTP',
        description: `Attempts ${count}/3`,
        variant: 'destructive',
      });

      if (count >= 3) {
        setTimer(0);
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      console.log('🔄 [VerifyOtp] Resending OTP...');
      await resendOTP(email!);
      setOtp('');
      setTimer(900);
      setAttempts(0);
      setResendCooldown(30);

      toast({
        title: 'OTP Sent',
        description: 'Check your email for the new code',
      });
    } catch (err: Error | unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not resend OTP';
      toast({
        title: 'Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const backLink = mode === 'register' ? '/register' : '/login';

  // Show loading state while rehydrating
  if (!_isHydrated) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Mail className="text-primary-foreground w-6 h-6" />
          </div>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            Code sent to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Enter 6-digit code</Label>
              <Input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                inputMode="numeric"
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
                disabled={timer === 0}
              />
            </div>

            <div
              className={cn(
                'text-center py-2 rounded font-mono text-sm font-semibold',
                timer > 60
                  ? 'bg-blue-100 text-blue-700'
                  : timer > 0
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
              )}
            >
              {timer > 0
                ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(
                  2,
                  '0'
                )}`
                : 'OTP expired'}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Attempts: {attempts}/3
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={resendCooldown > 0 || isLoading}
              onClick={handleResend}
              className="w-full"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend OTP'}
            </Button>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6 || timer === 0}
              className="w-full"
              size="lg"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm
            </Button>
          </CardContent>

          <CardFooter>
            <Link
              to={backLink}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
