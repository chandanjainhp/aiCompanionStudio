import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email')
});
export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    setUser
  } = useAuthStore();
  const {
    toast
  } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: {
      errors: profileErrors,
      isDirty: isProfileDirty
    },
    reset: resetProfile,
    setValue
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user, resetProfile]);
  const onProfileSubmit = async data => {
    setIsUpdating(true);
    try {
      console.log('📤 [Profile] Updating profile with:', {
        name: data.name
      });
      const response = await apiClient.updateUserProfile({
        name: data.name
      });

      // Improved response validation
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to update profile');
      }

      // Handle various response data structures
      const updatedUser = response.data || response.user;
      if (!updatedUser) {
        throw new Error('Server did not return user profile data');
      }

      // Validate required fields exist
      if (!updatedUser.email || !updatedUser.name) {
        throw new Error('Invalid user data received from server');
      }

      console.log('✅ [Profile] Profile updated successfully');
      setUser(updatedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.'
      });
    } catch (error) {
      console.error('❌ [Profile] Profile update failed:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Avatar must be less than 2MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and GIF are allowed',
        variant: 'destructive'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const handleAvatarUpload = async () => {
    if (!avatarPreview) {
      toast({
        title: 'No image selected',
        description: 'Please select an image first',
        variant: 'destructive'
      });
      return;
    }
    setIsUpdating(true);
    try {
      // Get the file from input
      const file = avatarInputRef.current?.files?.[0];
      if (!file) return;

      // Upload to backend
      const response = await apiClient.uploadAvatar(file);
      if (response?.success && response?.data) {
        // Update user store with full response data instead of just avatar
        setUser(response.data);
        toast({
          title: 'Avatar updated',
          description: 'Your avatar has been changed successfully'
        });

        // Clear preview and reset file input
        setAvatarPreview(null);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = '';
        }
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  return <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile information
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8 max-w-3xl">
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <UserAvatar avatarUrl={avatarPreview || user?.avatarUrl} name={user?.name} size="lg" />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                        Change avatar
                      </Button>
                      {avatarPreview && <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUpdating}>
                          {isUpdating ? <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </> : <>
                              <Save className="w-4 h-4" />
                              Save Avatar
                            </>}
                        </Button>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleAvatarChange} aria-label="Upload avatar image" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" {...registerProfile('name')} className={profileErrors.name ? 'border-destructive' : ''} />
                    {profileErrors.name && <p className="text-sm text-destructive">
                        {profileErrors.name.message}
                      </p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...registerProfile('email')} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!isProfileDirty || isUpdating}>
                    {isUpdating ? <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </> : <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}
