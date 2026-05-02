import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { SettingsLayout } from './SettingsLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const inputClassName = (hasError) => cn(
    "font-mono text-[14px] border-2 rounded-none p-3 w-full bg-background text-foreground outline-none box-border transition-colors focus-visible:ring-0 h-[48px]",
    hasError ? "border-destructive focus-visible:border-destructive" : "border-primary focus-visible:border-foreground"
  );

  return (
    <SettingsLayout activeTab="security">
      <div className="bg-muted/20 border-2 border-primary p-6 sm:p-8">
        <div className="font-mono text-[11px] text-muted-foreground tracking-[0.25em] uppercase mb-8 font-bold">
          CHANGE PASSWORD
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">

            {/* Current password */}
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase block mb-3 font-bold" htmlFor="currentPassword">
                CURRENT PASSWORD
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  className={cn(inputClassName(!!errors.currentPassword), "pr-12")}
                  {...register('currentPassword')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2 font-bold">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase block mb-3 font-bold" htmlFor="newPassword">
                NEW PASSWORD
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={cn(inputClassName(!!errors.newPassword), "pr-12")}
                  {...register('newPassword')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNew(!showNew)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2 font-bold">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase block mb-3 font-bold" htmlFor="confirmPassword">
                CONFIRM NEW PASSWORD
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                className={inputClassName(!!errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2 h-10 px-6"
            >
              {isUpdating
                ? <><Loader2 size={14} className="animate-spin" />UPDATING...</>
                : <><Save size={14} />UPDATE PASSWORD</>
              }
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
