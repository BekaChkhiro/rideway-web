'use client';

import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { StoryGroup } from '@/types';

interface StoryItemProps {
  storyGroup: StoryGroup;
  onClick?: () => void;
  isOwn?: boolean;
  className?: string;
}

export function StoryItem({
  storyGroup,
  onClick,
  isOwn = false,
  className,
}: StoryItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 min-w-[72px]',
        className
      )}
    >
      <div
        className={cn(
          'relative p-0.5 rounded-full',
          storyGroup.hasUnviewed
            ? 'bg-gradient-to-tr from-primary via-yellow-500 to-orange-500'
            : 'bg-muted'
        )}
      >
        <div className="bg-background rounded-full p-0.5">
          <UserAvatar
            user={storyGroup.user}
            size="lg"
            className={cn(
              'ring-2 ring-background',
              isOwn && 'opacity-90'
            )}
          />
        </div>
      </div>
      <span className="text-xs truncate max-w-[72px] text-center">
        {isOwn ? 'შენი' : storyGroup.user.username}
      </span>
    </button>
  );
}

// Create story button
interface CreateStoryButtonProps {
  onClick?: () => void;
  avatarUrl?: string | null;
  className?: string;
}

export function CreateStoryButton({
  onClick,
  avatarUrl,
  className,
}: CreateStoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 min-w-[72px]',
        className
      )}
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="h-full w-full object-cover opacity-70"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold border-2 border-background">
          +
        </div>
      </div>
      <span className="text-xs">დამატება</span>
    </button>
  );
}

// Skeleton
export function StoryItemSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[72px]">
      <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
      <div className="h-3 w-12 bg-muted animate-pulse rounded" />
    </div>
  );
}
