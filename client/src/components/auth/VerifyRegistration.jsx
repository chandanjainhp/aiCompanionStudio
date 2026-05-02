import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, UserCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function VerifyRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    verifyRegistrationOTP, resendOTP, isLoading,
    registerEmail, registerName, registerOtpSent,
    clearRegistrationState, _isHydrated,
  } = useAuthStore();

  const stateEmail = location.state?.email;
  const stateName  = location.state?.name;
  const email      = registerEmail || stateEmail;
  const name       = registerName  || stateName;

  const [otp, setOtp]                       = useState('');
  const [timer, setTimer]                   = useState(900);
  const [attempts, setAttempts]             = useState(0);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (!_isHydrated) return;
    if (!email || !name || !registerOtpSent) {
      navigate('/register');
    }
  }, [_isHydrated, email, name, registerOtpSent, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleVerify = async e => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: 'INVALID OTP', description: 'Enter a 6-digit code', variant: 'destructive' });
      return;
    }
    if (attempts >= 3) {
      toast({ title: 'TOO MANY ATTEMPTS', description: 'Please request a new OTP', variant: 'destructive' });
      return;
    }
    try {
      await verifyRegistrationOTP(email, otp);
      toast({ title: 'ACCOUNT CREATED', description: 'Welcome!' });
      clearRegistrationState();
      navigate('/dashboard');
    } catch {
      const count = attempts + 1;
      setAttempts(count);
      setOtp('');
      toast({ title: 'INCORRECT OTP', description: `Attempt ${count} of 3`, variant: 'destructive' });
      if (count >= 3) setTimer(0);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOTP(email);
      setOtp('');
      setTimer(900);
      setAttempts(0);
      setResendCooldown(30);
      toast({ title: 'OTP SENT', description: 'Check your email for the new code' });
    } catch (err) {
      toast({ title: 'FAILED', description: err instanceof Error ? err.message : 'Could not resend OTP', variant: 'destructive' });
    }
  };

  const mins       = Math.floor(timer / 60);
  const secs       = String(timer % 60).padStart(2, '0');
  const timerColor = timer > 180 ? 'text-primary' : timer > 60 ? 'text-orange-500' : 'text-destructive';

  if (!_isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <div className="w-4 h-4 bg-primary" />
        </motion.div>
      </div>
    );
  }

  if (!email || !name || !registerOtpSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase">
          REDIRECTING...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-10 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 mb-6 border-b-2 border-primary inline-block pb-1">
            ACCOUNT VERIFICATION
          </div>
          <div className="w-12 h-12 bg-background border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <UserCheck size={20} className="text-primary" />
          </div>
          <h1 className="font-display text-[32px] font-black leading-[1.1] mb-4 tracking-tight uppercase">
            VERIFY YOUR <br/><span className="text-muted-foreground">EMAIL</span>
          </h1>
          <p className="font-body text-[14px] leading-[1.6] opacity-80 max-w-[320px] mx-auto border-l-2 border-primary pl-4 text-left">
            A 6-digit code was sent to <span className="font-bold text-foreground">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="bg-muted/20 border-2 border-primary p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold text-center block mb-2">
                6-DIGIT CODE
              </label>
              <input
                className={cn(
                  "w-full h-16 bg-background border-2 border-primary outline-none text-center font-mono text-[28px] tracking-[0.35em] transition-colors focus:border-foreground disabled:opacity-50 disabled:cursor-not-allowed",
                  (timer === 0 || attempts >= 3) && "border-destructive text-destructive"
                )}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoFocus
                disabled={timer === 0 || attempts >= 3}
                placeholder="——————"
                maxLength={6}
              />
            </div>

            <div className="flex justify-between items-center py-4 border-y-2 border-primary mb-8">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] font-bold opacity-60 mb-1">EXPIRES IN</div>
                <div className={cn("font-mono text-[18px] font-bold tracking-[0.05em]", timerColor)}>
                  {timer > 0 ? `${mins}:${secs}` : 'EXPIRED'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] font-bold opacity-60 mb-2">ATTEMPTS</div>
                <div className="flex gap-1.5 justify-end">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "w-2.5 h-2.5 border-2",
                        i < attempts ? "bg-destructive border-destructive" : "border-primary bg-background"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6 || timer === 0 || attempts >= 3}
              className="w-full h-14 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[12px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <span>CREATE ACCOUNT</span>
              )}
            </Button>
          </div>

          <div className="mt-4 border-2 border-primary">
            <button
              type="button"
              className="w-full py-4 font-mono text-[11px] font-bold tracking-[0.1em] uppercase bg-background hover:bg-muted/20 disabled:opacity-50 disabled:hover:bg-background transition-colors flex items-center justify-center gap-2"
              disabled={resendCooldown > 0 || isLoading}
              onClick={handleResend}
            >
              <RefreshCw size={12} className={cn(isLoading && "animate-spin")} />
              {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : 'RESEND CODE'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-primary text-center">
          <Link
            to="/register"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] underline hover:no-underline inline-flex items-center gap-2"
          >
            <ArrowLeft size={12} />
            BACK TO REGISTER
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyRegistration;
