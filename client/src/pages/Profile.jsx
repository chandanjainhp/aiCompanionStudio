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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      toast({ title: 'PROFILE UPDATED', description: 'Your profile has been saved.' });
    } catch (error) {
      toast({ title: 'UPDATE FAILED', description: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'FILE TOO LARGE', description: 'Avatar must be less than 2MB', variant: 'destructive' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({ title: 'INVALID FILE TYPE', description: 'Only JPG, PNG, and GIF are allowed', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) {
      toast({ title: 'NO IMAGE SELECTED', description: 'Please select an image first', variant: 'destructive' });
      return;
    }
    setIsUpdating(true);
    try {
      const file = avatarInputRef.current?.files?.[0];
      if (!file) return;
      const response = await apiClient.uploadAvatar(file);
      if (response?.success && response?.data) {
        setUser(response.data);
        toast({ title: 'AVATAR UPDATED', description: 'Your avatar has been changed successfully' });
        setAvatarPreview(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      }
    } catch (error) {
      toast({ title: 'UPLOAD FAILED', description: error.message || 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-primary bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 border-2 border-primary flex items-center justify-center hover:bg-muted/20 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="font-display font-black uppercase text-[16px] tracking-tight leading-none">PROFILE</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">ACCOUNT SETTINGS</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-8"
        >

          {/* Avatar section */}
          <div className="bg-muted/20 border-2 border-primary p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-24 h-24 border-2 border-primary bg-background flex items-center justify-center relative overflow-hidden transition-colors group-hover:border-foreground">
                {(avatarPreview || user?.avatarUrl) ? (
                  <img
                    src={avatarPreview || user.avatarUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-[32px] font-black text-primary">{initials}</span>
                )}
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-primary" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload avatar image"
              />
            </div>

            <div className="flex-1">
              <div className="font-display text-[24px] font-black uppercase tracking-tight mb-1">
                {user?.name || 'UNKNOWN USER'}
              </div>
              <div className="font-mono text-[12px] text-muted-foreground mb-6">
                {user?.email}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none border-2 border-primary font-mono text-[11px] font-bold tracking-[0.1em] uppercase"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  CHANGE PHOTO
                </Button>
                {avatarPreview && (
                  <Button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={isUpdating}
                    className="rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        SAVE PHOTO
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-4 tracking-[0.05em] uppercase">
                JPG, PNG OR GIF · MAX 2MB
              </div>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="bg-muted/20 border-2 border-primary p-8">
              <div className="font-mono text-[11px] font-bold text-muted-foreground tracking-[0.25em] uppercase mb-8 pb-4 border-b-2 border-primary">
                PROFILE INFORMATION
              </div>

              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2">
                    <User size={12} /> DISPLAY NAME
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    {...registerProfile('name')}
                    className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0", profileErrors.name && "border-destructive")}
                  />
                  {profileErrors.name && (
                    <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2">
                    <Mail size={12} /> EMAIL ADDRESS
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile('email')}
                    disabled
                    className="border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-muted/50 cursor-not-allowed opacity-70"
                  />
                  <p className="font-mono text-[10px] text-muted-foreground tracking-[0.05em] uppercase mt-2">
                    CONTACT SUPPORT TO CHANGE EMAIL
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-primary flex justify-end">
                <Button
                  type="submit"
                  disabled={!isProfileDirty || isUpdating}
                  className="h-12 px-8 rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      SAVE CHANGES
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Account info */}
          <div className="bg-muted/20 border-2 border-primary p-8">
            <div className="font-mono text-[11px] font-bold text-muted-foreground tracking-[0.25em] uppercase mb-8 pb-4 border-b-2 border-primary">
              ACCOUNT STATUS
            </div>
            
            <div className="flex flex-wrap gap-12">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mb-2">STATUS</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-none" />
                  <span className="font-mono text-[12px] font-bold tracking-[0.05em] uppercase">ACTIVE</span>
                </div>
              </div>
              
              <div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mb-2">SECURITY</div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-primary" />
                  <span className="font-mono text-[12px] font-bold tracking-[0.05em] uppercase">VERIFIED</span>
                </div>
              </div>
              
              {user?.createdAt && (
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mb-2">MEMBER SINCE</div>
                  <div className="font-mono text-[12px] font-bold tracking-[0.05em] uppercase">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
