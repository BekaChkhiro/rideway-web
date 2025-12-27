'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
  imageAspect?: 'square' | 'video' | 'portrait';
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  showAvatar = false,
  imageAspect = 'video',
  lines = 2,
}: SkeletonCardProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Image skeleton */}
      {showImage && (
        <Skeleton className={cn('w-full', aspectClasses[imageAspect])} />
      )}

      <div className="p-4 space-y-3">
        {/* Avatar and title */}
        {showAvatar && (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        )}

        {/* Title if no avatar */}
        {!showAvatar && <Skeleton className="h-5 w-3/4" />}

        {/* Content lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
    </div>
  );
}

// Post card skeleton
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Image */}
      <Skeleton className="h-64 w-full rounded-lg" />

      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

// Marketplace listing skeleton
export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// User card skeleton
export function UserCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-4',
        className
      )}
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-20" />
    </div>
  );
}

// Comment skeleton
export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 p-4', className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
