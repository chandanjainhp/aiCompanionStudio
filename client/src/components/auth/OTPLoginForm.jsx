import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
};

export function OTPLoginForm() {
  const [email, setEmail] = useState('');
  const { sendOTP, isLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async e => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    try {
      await sendOTP(email, 'login');
      toast({ title: 'OTP sent', description: `Verification code sent to ${email}` });
      navigate('/verify-otp', { state: { email, mode: 'login' } });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send OTP', variant: 'destructive' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text, display: 'flex' }}>
      <style>{`
        .otp-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .otp-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .otp-input::placeholder { color: ${DB.muted}; }
        .otp-input:focus { border-color: ${DB.accent}; }
        .otp-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; }
        .otp-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Left sidebar */}
      <div
        style={{ flex: 1, backgroundColor: DB.surface, borderRight: `1px solid ${DB.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px', minWidth: 0 }}
        className="hidden sm:flex"
      >
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="otp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 24 }}>
            PASSWORDLESS ACCESS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 20, fontStyle: 'italic', fontFamily: 'Fraunces, Georgia, serif' }}>
            Sign in with just <span style={{ color: DB.accent }}>your email</span>
          </h2>
          <p style={{ fontSize: 13, color: DB.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 320 }}>
            No password needed. Enter your email and we'll send a one-time code straight to your inbox.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 28, borderTop: `1px solid ${DB.border}` }}>
            {[
              { label: 'NO PASSWORD', desc: 'One-time code, nothing to remember' },
              { label: 'INSTANT',     desc: 'Code arrives in seconds' },
              { label: 'SECURE',      desc: 'Expires after 15 minutes' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: DB.accent, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div className="otp-mono" style={{ fontSize: 9, color: DB.accent, letterSpacing: '0.15em', marginBottom: 2 }}>{item.label}</div>
                  <div className="otp-mono" style={{ fontSize: 9, color: DB.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minWidth: 0 }}>
        <motion.form
          onSubmit={handleSendOTP}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <div className="otp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 32 }}>
            OTP SIGN IN
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${DB.border}` }}>
            <label className="otp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Mail size={11} />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="otp-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="otp-btn"
            disabled={isLoading || !email}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}
          >
            {isLoading ? (
              <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />SENDING CODE...</>
            ) : (
              <>SEND OTP CODE<ArrowRight size={11} /></>
            )}
          </button>

          {/* Switch to password login */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: DB.border }} />
            <span className="otp-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: DB.border }} />
          </div>

          <Link
            to="/login"
            style={{ display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none' }}
          >
            <button
              type="button"
              className="otp-mono"
              style={{
                width: '100%', background: 'transparent', border: `1px solid ${DB.border}`,
                color: DB.muted, padding: '9px 20px', fontSize: 10, letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'JetBrains Mono', monospace",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = DB.muted; e.currentTarget.style.color = DB.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = DB.border; e.currentTarget.style.color = DB.muted; }}
            >
              <ArrowLeft size={10} />
              USE PASSWORD INSTEAD
            </button>
          </Link>

          <p className="otp-mono" style={{ fontSize: 10, color: DB.muted, textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.6, marginTop: 20 }}>
            No account?{' '}
            <Link
              to="/register"
              style={{ color: DB.accent, textDecoration: 'none' }}
              onMouseEnter={e => (e.target.style.opacity = '0.7')}
              onMouseLeave={e => (e.target.style.opacity = '1')}
            >
              CREATE ONE
            </Link>
          </p>

          {/* Status */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="otp-mono" style={{ fontSize: 8, color: DB.green, letterSpacing: '0.1em' }}>● READY</span>
            <span className="otp-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.1em' }}>v1.0</span>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
