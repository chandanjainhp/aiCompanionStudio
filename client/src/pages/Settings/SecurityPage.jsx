import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { SettingsLayout } from './SettingsLayout';
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});
export default function SecurityPage() {
  const {
    toast
  } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  const onSubmit = async data => {
    setIsUpdating(true);
    try {
      console.log('📤 [Security] Changing password...');
      const response = await apiClient.updatePassword(data.currentPassword, data.newPassword);
      if (response?.success) {
        console.log('✅ [Security] Password changed successfully');
        toast({
          title: 'Password updated',
          description: 'Your password has been changed successfully.'
        });
        reset();
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('❌ [Security] Password update failed:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update password',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  return <SettingsLayout activeTab="security">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} {...register('currentPassword')} className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'} placeholder="Enter your current password" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} {...register('newPassword')} className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'} placeholder="Enter a new password (min 8 characters)" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className={errors.confirmPassword ? 'border-destructive' : ''} placeholder="Confirm your new password" />
              {errors.confirmPassword && <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </> : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </SettingsLayout>;
}