import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, User, Mail, Lock, Check, X } from 'lucide-react';
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
};

const passwordRules = [
  { id: 'length',    label: 'AT LEAST 8 CHARACTERS', regex: /.{8,}/ },
  { id: 'uppercase', label: 'ONE UPPERCASE LETTER',   regex: /[A-Z]/ },
  { id: 'number',    label: 'ONE NUMBER',              regex: /[0-9]/ },
  { id: 'special',   label: 'ONE SPECIAL CHARACTER',  regex: /[@$!%*?&]/ },
];

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const { sendRegistrationOTP, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password') || '';
  const watchedTerms = watch('acceptTerms');

  const onSubmit = async data => {
    try {
      await sendRegistrationOTP(data.name, data.email, data.password);
      toast({ title: 'OTP sent', description: 'Check your email for the verification code' });
      navigate('/verify-otp', { state: { email: data.email, name: data.name, mode: 'register' } });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Registration failed', description: errorMsg, variant: 'destructive' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text, display: 'flex' }}>
      <style>{`
        .reg-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .reg-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; }
        .reg-input::placeholder { color: ${DB.muted}; }
        .reg-input:focus { border-color: ${DB.accent}; }
        .reg-input.error { border-color: ${DB.red}; }
        .reg-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; }
        .reg-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .reg-checkbox { width: 14px; height: 14px; accent-color: ${DB.accent}; cursor: pointer; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Left sidebar */}
      <div
        style={{ flex: 1, backgroundColor: DB.surface, borderRight: `1px solid ${DB.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px', minWidth: 0 }}
        className="hidden sm:flex"
      >
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 24 }}>
            NEW ACCOUNT
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 20, fontStyle: 'italic', fontFamily: 'Fraunces, Georgia, serif' }}>
            Build your <span style={{ color: DB.accent }}>AI workspace</span>
          </h2>
          <p style={{ fontSize: 13, color: DB.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 320 }}>
            Create an account to configure, deploy, and manage AI companions. Your workspace, your rules.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 32, borderTop: `1px solid ${DB.border}` }}>
            {[
              { label: 'UNLIMITED PROJECTS', desc: 'No cap on what you build' },
              { label: 'CUSTOM MODELS',       desc: 'GPT-4, Claude, Llama, and more' },
              { label: 'OTP VERIFIED',        desc: 'Secure email verification' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: DB.accent, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div className="reg-mono" style={{ fontSize: 9, color: DB.accent, letterSpacing: '0.15em', marginBottom: 2 }}>{item.label}</div>
                  <div className="reg-mono" style={{ fontSize: 9, color: DB.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minWidth: 0, overflowY: 'auto' }}>
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 380, paddingBlock: 20 }}
        >
          <div className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 32 }}>
            REGISTER
          </div>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
              <User size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="Jane Smith"
              className="reg-input"
              {...register('name')}
              style={{ borderColor: errors.name ? DB.red : DB.border }}
            />
            {errors.name && (
              <p className="reg-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
              <Mail size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="reg-input"
              {...register('email')}
              style={{ borderColor: errors.email ? DB.red : DB.border }}
            />
            {errors.email && (
              <p className="reg-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
              <Lock size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                className="reg-input"
                {...register('password')}
                style={{ borderColor: errors.password ? DB.red : DB.border, paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Password strength */}
            <div style={{ marginTop: 10, padding: '10px 12px', background: DB.surface, border: `1px solid ${DB.border}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {passwordRules.map(rule => {
                const ok = rule.regex.test(watchedPassword);
                return (
                  <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ok
                      ? <Check size={10} style={{ color: DB.green, flexShrink: 0 }} />
                      : <X size={10} style={{ color: DB.muted, flexShrink: 0 }} />
                    }
                    <span className="reg-mono" style={{ fontSize: 9, color: ok ? DB.green : DB.muted, letterSpacing: '0.05em' }}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 20 }}>
            <label className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
              <Lock size={11} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }} />
              CONFIRM PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                className="reg-input"
                {...register('confirmPassword')}
                style={{ borderColor: errors.confirmPassword ? DB.red : DB.border, paddingRight: 36 }}
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
              <p className="reg-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${DB.border}` }}>
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="reg-checkbox"
                    checked={!!field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    style={{ marginTop: 1 }}
                  />
                  <span className="reg-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.05em', lineHeight: 1.6 }}>
                    I AGREE TO THE{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: DB.accent, textDecoration: 'none' }}
                      onMouseEnter={e => (e.target.style.opacity = '0.7')}
                      onMouseLeave={e => (e.target.style.opacity = '1')}
                    >
                      TERMS &amp; PRIVACY POLICY
                    </Link>
                  </span>
                </label>
              )}
            />
            {errors.acceptTerms && (
              <p className="reg-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="reg-btn"
            disabled={isLoading || !watchedTerms}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <>
                <span>CREATE ACCOUNT</span>
                <ArrowRight size={11} />
              </>
            )}
          </button>

          {/* Sign in link */}
          <p className="reg-mono" style={{ fontSize: 10, color: DB.muted, textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.6 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: DB.accent, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.target.style.opacity = '0.7')}
              onMouseLeave={e => (e.target.style.opacity = '1')}
            >
              SIGN IN
            </Link>
          </p>

          {/* Status */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${DB.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="reg-mono" style={{ fontSize: 8, color: DB.green, letterSpacing: '0.1em' }}>● READY</span>
            <span className="reg-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.1em' }}>v1.0</span>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default RegisterForm;
