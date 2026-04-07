/* eslint-disable-next-line no-unused-vars */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
export function UserAvatar({
  avatarUrl,
  name = 'User',
  size = 'md',
  className,
  fallbackIcon
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  const fallbackSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {fallbackIcon ? fallbackIcon : (
          <span className={cn('font-semibold', fallbackSize[size])}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
