import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OTPLoginForm() {
  const [email, setEmail] = useState('');
  const { sendOTP, isLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async e => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({ title: 'INVALID EMAIL', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    try {
      await sendOTP(email, 'login');
      toast({ title: 'OTP SENT', description: `Verification code sent to ${email}` });
      navigate('/verify-otp', { state: { email, mode: 'login' } });
    } catch (error) {
      toast({ title: 'ERROR', description: error instanceof Error ? error.message : 'Failed to send OTP', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left sidebar */}
      <div className="flex-1 bg-muted/20 border-r-2 border-primary hidden sm:flex flex-col justify-center px-12 py-16 min-w-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold opacity-60 mb-8 border-b-2 border-primary inline-block pb-1">
            PASSWORDLESS ACCESS
          </div>
          <h2 className="font-display text-[48px] font-black leading-[1.1] mb-6 tracking-tight uppercase">
            SIGN IN WITH JUST <br/><span className="text-muted-foreground">YOUR EMAIL</span>
          </h2>
          <p className="font-body text-[16px] leading-[1.6] mb-12 max-w-sm border-l-2 border-primary pl-4">
            No password needed. Enter your email and we'll send a one-time code straight to your inbox.
          </p>

          <div className="flex flex-col gap-6 pt-8 border-t-2 border-primary">
            {[
              { label: 'NO PASSWORD', desc: 'One-time code, nothing to remember' },
              { label: 'INSTANT',     desc: 'Code arrives in seconds' },
              { label: 'SECURE',      desc: 'Expires after 15 minutes' },
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-w-0">
        <motion.form
          onSubmit={handleSendOTP}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          <div className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase mb-8 pb-4 border-b-2 border-primary flex justify-between items-center">
            <span>OTP SIGN IN</span>
            <span className="text-[10px] bg-foreground text-background px-2 py-0.5">V_1.0</span>
          </div>

          {/* Email field */}
          <div className="mb-8 pb-8 border-b-2 border-primary space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-[0.1em] font-bold flex items-center gap-2">
              <Mail size={12} /> EMAIL ADDRESS
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
              className="border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-14 border-2 border-primary bg-primary text-background hover:bg-foreground hover:text-background rounded-none font-mono text-[12px] font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3 mb-8"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>SENDING CODE...</span>
              </>
            ) : (
              <>
                <span>SEND OTP CODE</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          {/* Switch to password login */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[2px] bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] font-bold">OR</span>
            <div className="flex-1 h-[2px] bg-primary" />
          </div>

          <Link to="/login" className="block w-full">
            <button
              type="button"
              className="w-full py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] border-2 border-primary bg-background hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={12} />
              USE PASSWORD INSTEAD
            </button>
          </Link>

          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-center mt-8 pt-6 border-t-2 border-primary">
            NO ACCOUNT?{' '}
            <Link to="/register" className="font-bold underline hover:no-underline ml-2">
              CREATE ONE
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
