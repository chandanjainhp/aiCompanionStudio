import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, UserCheck, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
  red: '#FF5C5C',
  orange: '#F97316',
};

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
      toast({ title: 'Invalid OTP', description: 'Enter a 6-digit code', variant: 'destructive' });
      return;
    }
    if (attempts >= 3) {
      toast({ title: 'Too many attempts', description: 'Please request a new OTP', variant: 'destructive' });
      return;
    }
    try {
      await verifyRegistrationOTP(email, otp);
      toast({ title: 'Account created', description: 'Welcome!' });
      clearRegistrationState();
      navigate('/dashboard');
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

  const mins       = Math.floor(timer / 60);
  const secs       = String(timer % 60).padStart(2, '0');
  const timerColor = timer > 180 ? DB.green : timer > 60 ? DB.orange : DB.red;

  if (!_isHydrated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: DB.accent }} />
        </motion.div>
      </div>
    );
  }

  if (!email || !name || !registerOtpSent) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: DB.muted, letterSpacing: '0.15em' }}>
          REDIRECTING...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .vr-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .vr-otp-input { background: ${DB.surface}; border: 1px solid ${DB.borderBright}; color: ${DB.accent}; outline: none; padding: 16px 12px; font-size: 28px; font-family: 'JetBrains Mono', monospace; width: 100%; text-align: center; letter-spacing: 0.35em; transition: border-color 0.15s; }
        .vr-otp-input:focus { border-color: ${DB.accent}; box-shadow: 0 0 0 1px ${DB.accent}40; }
        .vr-otp-input:disabled { opacity: 0.4; cursor: not-allowed; }
        .vr-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 12px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vr-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .vr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .vr-resend { background: transparent; border: 1px solid ${DB.border}; color: ${DB.muted}; padding: 9px 20px; font-size: 10px; letter-spacing: 0.12em; cursor: pointer; transition: all 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .vr-resend:not(:disabled):hover { border-color: ${DB.accent}; color: ${DB.accent}; }
        .vr-resend:disabled { opacity: 0.35; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <div style={{ marginBottom: 36 }}>
          <div className="vr-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 20 }}>
            ACCOUNT VERIFICATION
          </div>
          <div style={{ width: 40, height: 40, background: DB.surface, border: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <UserCheck size={18} style={{ color: DB.accent }} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: DB.text, marginBottom: 10 }}>
            Verify your <span style={{ color: DB.accent }}>email</span>
          </h1>
          <p className="vr-mono" style={{ fontSize: 11, color: DB.muted, lineHeight: 1.7 }}>
            A 6-digit code was sent to{' '}
            <span style={{ color: DB.text }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28, marginBottom: 2 }}>
            <div style={{ marginBottom: 20 }}>
              <label className="vr-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 10 }}>
                6-DIGIT CODE
              </label>
              <input
                className="vr-otp-input"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoFocus
                disabled={timer === 0 || attempts >= 3}
                placeholder="——————"
                maxLength={6}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '8px 0', borderTop: `1px solid ${DB.border}`, borderBottom: `1px solid ${DB.border}` }}>
              <div>
                <div className="vr-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.15em', marginBottom: 3 }}>EXPIRES IN</div>
                <div className="vr-mono" style={{ fontSize: 18, fontWeight: 600, color: timerColor }}>
                  {timer > 0 ? `${mins}:${secs}` : 'EXPIRED'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="vr-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.15em', marginBottom: 3 }}>ATTEMPTS</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 10, height: 10, background: i < attempts ? DB.red : DB.border, border: `1px solid ${i < attempts ? DB.red : DB.borderBright}` }} />
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="vr-btn" disabled={isLoading || otp.length !== 6 || timer === 0 || attempts >= 3}>
              {isLoading
                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />VERIFYING...</>
                : <>CREATE ACCOUNT</>
              }
            </button>
          </div>

          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: '14px 28px' }}>
            <button type="button" className="vr-resend" disabled={resendCooldown > 0 || isLoading} onClick={handleResend}>
              <RefreshCw size={10} />
              {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : 'RESEND CODE'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${DB.border}` }}>
          <Link
            to="/register"
            className="vr-mono"
            style={{ fontSize: 10, color: DB.muted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.1em', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = DB.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = DB.muted)}
          >
            <ArrowLeft size={11} />
            BACK TO REGISTER
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyRegistration;
