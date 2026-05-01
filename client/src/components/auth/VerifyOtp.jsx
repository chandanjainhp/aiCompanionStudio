import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  accentFaint: 'rgba(232,150,30,0.07)',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
  red: '#FF5C5C',
  orange: '#F97316',
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    verifyOTP, resendOTP, isLoading,
    otpMode, otpEmail, otpName, otpSent, clearOTPState, _isHydrated, loginMethod,
  } = useAuthStore();

  const stateEmail = location.state?.email;
  const stateName  = location.state?.name;
  const email      = otpEmail || stateEmail;
  const name       = otpName  || stateName;
  const mode       = otpMode  || location.state?.mode;

  const [otp, setOtp]                   = useState('');
  const [timer, setTimer]               = useState(900);
  const [attempts, setAttempts]         = useState(0);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (!_isHydrated) return;
    if (!email || !mode || !otpSent) {
      navigate('/login');
      return;
    }
    if (mode === 'login' && loginMethod !== 'otp') {
      clearOTPState();
      navigate('/login');
    }
  }, [_isHydrated, email, mode, otpSent, loginMethod, navigate, clearOTPState]);

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
      toast({ title: 'Invalid OTP', description: 'Enter a 6-digit code', variant: 'destructive' });
      return;
    }
    if (attempts >= 3) {
      toast({ title: 'Too many attempts', description: 'Please request a new OTP', variant: 'destructive' });
      return;
    }
    try {
      await verifyOTP(email, otp, mode, name);
      if (mode === 'register') {
        toast({ title: 'Account created', description: 'Welcome!' });
        clearOTPState();
        navigate('/dashboard');
      } else if (mode === 'login') {
        clearOTPState();
        toast({ title: 'Signed in', description: 'Logged in successfully' });
        navigate('/dashboard');
      } else if (mode === 'reset_password') {
        toast({ title: 'Verified', description: 'Please set your new password' });
        navigate('/reset-password');
      }
    } catch {
      const count = attempts + 1;
      setAttempts(count);
      setOtp('');
      toast({ title: 'Incorrect OTP', description: `Attempt ${count} of 3`, variant: 'destructive' });
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
      toast({ title: 'OTP Sent', description: 'Check your email for the new code' });
    } catch (err) {
      toast({ title: 'Failed', description: err instanceof Error ? err.message : 'Could not resend OTP', variant: 'destructive' });
    }
  };

  const backLink   = mode === 'register' ? '/register' : '/login';
  const mins       = Math.floor(timer / 60);
  const secs       = String(timer % 60).padStart(2, '0');
  const timerColor = timer > 180 ? DB.green : timer > 60 ? DB.orange : DB.red;

  const modeLabel = {
    register: 'ACCOUNT VERIFICATION',
    login: 'LOGIN VERIFICATION',
    reset_password: 'PASSWORD RESET',
  }[mode] || 'VERIFICATION';

  if (!_isHydrated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`.vo-mono{font-family:'JetBrains Mono',monospace}`}</style>
        <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: DB.accent }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .vo-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .vo-otp-input { background: ${DB.surface}; border: 1px solid ${DB.borderBright}; color: ${DB.accent}; outline: none; padding: 16px 12px; font-size: 28px; font-family: 'JetBrains Mono', monospace; width: 100%; text-align: center; letter-spacing: 0.35em; transition: border-color 0.15s; }
        .vo-otp-input:focus { border-color: ${DB.accent}; box-shadow: 0 0 0 1px ${DB.accent}40; }
        .vo-otp-input:disabled { opacity: 0.4; cursor: not-allowed; }
        .vo-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 12px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vo-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .vo-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .vo-resend { background: transparent; border: 1px solid ${DB.border}; color: ${DB.muted}; padding: 9px 20px; font-size: 10px; letter-spacing: 0.12em; cursor: pointer; transition: all 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .vo-resend:not(:disabled):hover { border-color: ${DB.accent}; color: ${DB.accent}; }
        .vo-resend:disabled { opacity: 0.35; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="vo-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 20 }}>
            {modeLabel}
          </div>
          <div style={{ width: 40, height: 40, background: DB.surface, border: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <ShieldCheck size={18} style={{ color: DB.accent }} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: DB.text, marginBottom: 10 }}>
            Enter your <span style={{ color: DB.accent }}>code</span>
          </h1>
          <p className="vo-mono" style={{ fontSize: 11, color: DB.muted, lineHeight: 1.7 }}>
            A 6-digit code was sent to{' '}
            <span style={{ color: DB.text }}>{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify}>
          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28, marginBottom: 2 }}>

            {/* OTP input */}
            <div style={{ marginBottom: 20 }}>
              <label className="vo-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 10 }}>
                6-DIGIT CODE
              </label>
              <input
                className="vo-otp-input"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoFocus
                disabled={timer === 0 || attempts >= 3}
                placeholder="——————"
                maxLength={6}
              />
            </div>

            {/* Timer + attempts row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '8px 0', borderTop: `1px solid ${DB.border}`, borderBottom: `1px solid ${DB.border}` }}>
              <div>
                <div className="vo-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.15em', marginBottom: 3 }}>EXPIRES IN</div>
                <div className="vo-mono" style={{ fontSize: 18, fontWeight: 600, color: timerColor, letterSpacing: '0.05em' }}>
                  {timer > 0 ? `${mins}:${secs}` : 'EXPIRED'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="vo-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.15em', marginBottom: 3 }}>ATTEMPTS</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 10, height: 10,
                        background: i < attempts ? DB.red : DB.border,
                        border: `1px solid ${i < attempts ? DB.red : DB.borderBright}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="vo-btn"
              disabled={isLoading || otp.length !== 6 || timer === 0 || attempts >= 3}
            >
              {isLoading ? (
                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />VERIFYING...</>
              ) : (
                <>CONFIRM CODE</>
              )}
            </button>
          </div>

          {/* Resend */}
          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: '14px 28px' }}>
            <button
              type="button"
              className="vo-resend"
              disabled={resendCooldown > 0 || isLoading}
              onClick={handleResend}
            >
              <RefreshCw size={10} />
              {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : 'RESEND CODE'}
            </button>
          </div>
        </form>

        {/* Back link */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${DB.border}` }}>
          <Link
            to={backLink}
            className="vo-mono"
            style={{ fontSize: 10, color: DB.muted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.1em', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = DB.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = DB.muted)}
          >
            <ArrowLeft size={11} />
            BACK
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
