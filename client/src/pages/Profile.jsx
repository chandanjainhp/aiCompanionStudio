import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Camera, User, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  surfaceHover: '#1C1814',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
  red: '#FF5C5C',
};

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  useEffect(() => {
    if (user) resetProfile({ name: user.name || '', email: user.email || '' });
  }, [user, resetProfile]);

  const onProfileSubmit = async data => {
    setIsUpdating(true);
    try {
      const response = await apiClient.updateUserProfile({ name: data.name });
      if (!response?.success) throw new Error(response?.error || 'Failed to update profile');
      const updatedUser = response.data || response.user;
      if (!updatedUser) throw new Error('Server did not return user profile data');
      if (!updatedUser.email || !updatedUser.name) throw new Error('Invalid user data received from server');
      setUser(updatedUser);
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    } catch (error) {
      toast({ title: 'Update failed', description: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Avatar must be less than 2MB', variant: 'destructive' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Only JPG, PNG, and GIF are allowed', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) {
      toast({ title: 'No image selected', description: 'Please select an image first', variant: 'destructive' });
      return;
    }
    setIsUpdating(true);
    try {
      const file = avatarInputRef.current?.files?.[0];
      if (!file) return;
      const response = await apiClient.uploadAvatar(file);
      if (response?.success && response?.data) {
        setUser(response.data);
        toast({ title: 'Avatar updated', description: 'Your avatar has been changed successfully' });
        setAvatarPreview(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      }
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message || 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text }}>
      <style>{`
        .prof-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .prof-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .prof-input::placeholder { color: ${DB.muted}; }
        .prof-input:focus { border-color: ${DB.accent}; }
        .prof-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-input.error { border-color: ${DB.red}; }
        .prof-btn-primary { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .prof-btn-primary:hover:not(:disabled) { background: ${DB.accentDark}; }
        .prof-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .prof-btn-ghost { background: transparent; color: ${DB.muted}; border: 1px solid ${DB.border}; padding: 8px 14px; font-size: 10px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .prof-btn-ghost:hover { color: ${DB.text}; border-color: ${DB.muted}; }
        .prof-section { background: ${DB.surface}; border: 1px solid ${DB.border}; padding: 28px 32px; }
        .prof-avatar-ring { border: 2px solid ${DB.borderBright}; border-radius: 50%; padding: 3px; display: inline-block; transition: border-color 0.2s; }
        .prof-avatar-ring:hover { border-color: ${DB.accent}; }
        .prof-avatar-overlay { position: absolute; inset: 3px; border-radius: 50%; background: rgba(14,12,10,0.75); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .prof-avatar-wrapper:hover .prof-avatar-overlay { opacity: 1; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 56, zIndex: 40, borderBottom: `1px solid ${DB.border}`, background: `${DB.bg}ee`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>
            <button
              onClick={() => navigate(-1)}
              className="prof-btn-ghost"
              style={{ padding: '6px 10px' }}
            >
              <ArrowLeft size={12} />
            </button>
            <div>
              <div className="prof-mono" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>PROFILE</div>
              <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em' }}>ACCOUNT SETTINGS</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >

          {/* Avatar section */}
          <div className="prof-section" style={{ borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="prof-avatar-wrapper" style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
                <div className="prof-avatar-ring">
                  {(avatarPreview || user?.avatarUrl) ? (
                    <img
                      src={avatarPreview || user.avatarUrl}
                      alt={user?.name}
                      style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: DB.borderBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="prof-mono" style={{ fontSize: 22, color: DB.accent, fontWeight: 700 }}>{initials}</span>
                    </div>
                  )}
                  <div className="prof-avatar-overlay">
                    <Camera size={18} color={DB.accent} />
                  </div>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                aria-label="Upload avatar image"
              />
            </div>

            <div style={{ flex: 1 }}>
              <div className="prof-mono" style={{ fontSize: 14, color: DB.text, fontWeight: 600, marginBottom: 4 }}>
                {user?.name || 'Unknown User'}
              </div>
              <div className="prof-mono" style={{ fontSize: 10, color: DB.muted, marginBottom: 14 }}>
                {user?.email}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="prof-btn-ghost" onClick={() => avatarInputRef.current?.click()}>
                  CHANGE PHOTO
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    className="prof-btn-primary"
                    onClick={handleAvatarUpload}
                    disabled={isUpdating}
                    style={{ fontSize: 10 }}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Save size={11} />
                        SAVE PHOTO
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="prof-mono" style={{ fontSize: 8, color: DB.muted, marginTop: 8, letterSpacing: '0.05em' }}>
                JPG, PNG OR GIF · MAX 2MB
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: DB.border }} />

          {/* Profile form */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="prof-section" style={{ borderTop: 'none', borderBottom: 'none' }}>
              <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 24 }}>
                PROFILE INFORMATION
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <User size={11} />
                    DISPLAY NAME
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`prof-input${profileErrors.name ? ' error' : ''}`}
                    {...registerProfile('name')}
                  />
                  {profileErrors.name && (
                    <p className="prof-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6, letterSpacing: '0.05em' }}>
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Mail size={11} />
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="prof-input"
                    {...registerProfile('email')}
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  />
                  <p className="prof-mono" style={{ fontSize: 9, color: DB.muted, marginTop: 6, letterSpacing: '0.05em' }}>
                    CONTACT SUPPORT TO CHANGE EMAIL
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="prof-btn-primary"
                  disabled={!isProfileDirty || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      SAVE CHANGES
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div style={{ height: 1, background: DB.border }} />

          {/* Account info */}
          <div className="prof-section" style={{ borderTop: 'none' }}>
            <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 20 }}>
              ACCOUNT STATUS
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em', marginBottom: 4 }}>STATUS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="prof-mono" style={{ fontSize: 8, color: DB.green }}>●</span>
                  <span className="prof-mono" style={{ fontSize: 10, color: DB.green, letterSpacing: '0.05em' }}>ACTIVE</span>
                </div>
              </div>
              <div>
                <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em', marginBottom: 4 }}>SECURITY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={10} style={{ color: DB.accent }} />
                  <span className="prof-mono" style={{ fontSize: 10, color: DB.accent, letterSpacing: '0.05em' }}>VERIFIED</span>
                </div>
              </div>
              {user?.createdAt && (
                <div>
                  <div className="prof-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em', marginBottom: 4 }}>MEMBER SINCE</div>
                  <div className="prof-mono" style={{ fontSize: 10, color: DB.text, letterSpacing: '0.05em' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
