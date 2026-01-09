'use client';

import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const userAvatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-24 w-24 text-2xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const onlineIndicatorVariants = cva(
  'absolute bottom-0 right-0 rounded-full border-2 border-background bg-green-500',
  {
    variants: {
      size: {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
        xl: 'h-4 w-4',
        '2xl': 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface UserAvatarUser {
  id?: string;
  username?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string | null;
  image?: string | null;
  bio?: string | null;
}

export interface UserAvatarProps
  extends VariantProps<typeof userAvatarVariants> {
  user?: UserAvatarUser | null;
  src?: string;
  name?: string;
  username?: string;
  showOnline?: boolean;
  isOnline?: boolean;
  linkToProfile?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  user,
  src,
  name,
  username,
  size,
  showOnline = false,
  isOnline = false,
  linkToProfile = false,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  // Resolve values from user object or individual props
  const avatarSrc = src || user?.avatarUrl || user?.image || undefined;
  const displayName = name || user?.fullName || user?.name || user?.username || 'User';
  const profileUsername = username || user?.username;

  // Generate initials from name
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarContent = (
    <div className="relative inline-block">
      <Avatar className={cn(userAvatarVariants({ size }), className)}>
        <AvatarImage src={avatarSrc} alt={displayName} />
        <AvatarFallback
          className={cn(
            'bg-primary text-primary-foreground font-medium',
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Online indicator */}
      {showOnline && isOnline && (
        <span
          className={cn(onlineIndicatorVariants({ size }))}
          aria-label="Online"
        />
      )}
    </div>
  );

  // Wrap with link if linkToProfile is true and we have a username
  if (linkToProfile && profileUsername) {
    return (
      <Link
        href={`/profile/${profileUsername}`}
        className="inline-block transition-opacity hover:opacity-80"
      >
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
}

// Avatar group for showing multiple avatars
interface UserAvatarGroupProps {
  users: UserAvatarUser[];
  max?: number;
  size?: UserAvatarProps['size'];
  className?: string;
}

export function UserAvatarGroup({
  users,
  max = 4,
  size = 'sm',
  className,
}: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayUsers.map((user, index) => (
        <UserAvatar
          key={user.id || index}
          user={user}
          size={size}
          className="ring-2 ring-background"
        />
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            userAvatarVariants({ size }),
            'flex items-center justify-center bg-muted text-muted-foreground ring-2 ring-background'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
