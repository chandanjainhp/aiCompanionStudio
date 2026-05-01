import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
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
  red: '#FF5C5C',
};

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
      toast({ title: 'Password reset', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: error instanceof Error ? error.message : 'Could not reset password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .rp-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .rp-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .rp-input::placeholder { color: ${DB.muted}; }
        .rp-input:focus { border-color: ${DB.accent}; }
        .rp-input.error { border-color: ${DB.red}; }
        .rp-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .rp-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
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
          <div className="rp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 20 }}>
            SET NEW PASSWORD
          </div>
          <div style={{ width: 40, height: 40, background: DB.surface, border: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Lock size={18} style={{ color: DB.accent }} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: DB.text, marginBottom: 10 }}>
            Choose a <span style={{ color: DB.accent }}>new password</span>
          </h1>
          <p className="rp-mono" style={{ fontSize: 11, color: DB.muted, lineHeight: 1.7 }}>
            Create a strong password for your account. Minimum 8 characters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28 }}>

            {/* New password */}
            <div style={{ marginBottom: 20 }}>
              <label className="rp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Lock size={11} />
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className={`rp-input${errors.password ? ' error' : ''}`}
                  {...register('password')}
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="rp-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 28 }}>
              <label className="rp-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Lock size={11} />
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className={`rp-input${errors.confirmPassword ? ' error' : ''}`}
                  {...register('confirmPassword')}
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted, display: 'flex', alignItems: 'center' }}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="rp-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button type="submit" className="rp-btn" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />UPDATING PASSWORD...</>
              ) : (
                <>RESET PASSWORD<ArrowRight size={11} /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
