import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
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
  red: '#FF5C5C',
};

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
      toast({ title: 'OTP Sent', description: 'Check your email for the verification code' });
      navigate('/verify-otp', { state: { email: data.email, mode: 'reset_password' } });
    } catch (error) {
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'Could not process request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .fp-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .fp-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .fp-input::placeholder { color: ${DB.muted}; }
        .fp-input:focus { border-color: ${DB.accent}; }
        .fp-input.error { border-color: ${DB.red}; }
        .fp-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .fp-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="fp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 20 }}>
            PASSWORD RECOVERY
          </div>
          <div style={{ width: 40, height: 40, background: DB.surface, border: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Mail size={18} style={{ color: DB.accent }} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: DB.text, marginBottom: 10 }}>
            Reset your <span style={{ color: DB.accent }}>password</span>
          </h1>
          <p className="fp-mono" style={{ fontSize: 11, color: DB.muted, lineHeight: 1.7 }}>
            Enter your email and we'll send a one-time code to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28 }}>
            <div style={{ marginBottom: 24 }}>
              <label className="fp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Mail size={11} />
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`fp-input${errors.email ? ' error' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="fp-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <button type="submit" className="fp-btn" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />SENDING CODE...</>
              ) : (
                <>SEND RESET CODE<ArrowRight size={11} /></>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${DB.border}` }}>
          <Link
            to="/login"
            className="fp-mono"
            style={{ fontSize: 10, color: DB.muted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.1em', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = DB.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = DB.muted)}
          >
            <ArrowLeft size={11} />
            BACK TO SIGN IN
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
