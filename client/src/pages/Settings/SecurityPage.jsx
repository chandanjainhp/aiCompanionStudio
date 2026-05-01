import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { SettingsLayout } from './SettingsLayout';

const DB = {
  surface: '#161210',
  border: '#252018',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  red: '#FF5C5C',
};

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SecurityPage() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async data => {
    setIsUpdating(true);
    try {
      const response = await apiClient.updatePassword(data.currentPassword, data.newPassword);
      if (response?.success) {
        toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
        reset();
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      toast({ title: 'Update failed', description: error.message || 'Failed to update password', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SettingsLayout activeTab="security">
      <style>{`
        .sec-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .sec-input { background: #0E0C0A; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .sec-input::placeholder { color: ${DB.muted}; }
        .sec-input:focus { border-color: ${DB.accent}; }
        .sec-input.error { border-color: ${DB.red}; }
        .sec-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .sec-btn:hover:not(:disabled) { background: ${DB.accentDark}; }
        .sec-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28 }}>
        <div className="sec-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 24 }}>
          CHANGE PASSWORD
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Current password */}
            <div>
              <label className="sec-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
                CURRENT PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  className={`sec-input${errors.currentPassword ? ' error' : ''}`}
                  {...register('currentPassword')}
                  style={{ paddingRight: 36 }}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted }}>
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="sec-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6 }}>{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="sec-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={`sec-input${errors.newPassword ? ' error' : ''}`}
                  {...register('newPassword')}
                  style={{ paddingRight: 36 }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DB.muted }}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="sec-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6 }}>{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="sec-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>
                CONFIRM NEW PASSWORD
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                className={`sec-input${errors.confirmPassword ? ' error' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="sec-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6 }}>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="sec-btn" disabled={isUpdating}>
              {isUpdating
                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />UPDATING...</>
                : <><Save size={12} />UPDATE PASSWORD</>
              }
            </button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
