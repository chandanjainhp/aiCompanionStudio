import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function UserAvatar({
  avatarUrl,
  name = 'User',
  size = 'md',
  className,
  fallbackIcon,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const fallbackSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={name}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {fallbackIcon ? (
          fallbackIcon
        ) : (
          <span className={cn('font-semibold', fallbackSize[size])}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
