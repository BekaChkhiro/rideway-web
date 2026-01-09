'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HashtagBadgeProps {
  tag: string;
  className?: string;
}

export function HashtagBadge({ tag, className }: HashtagBadgeProps) {
  return (
    <Link
      href={`/hashtag/${encodeURIComponent(tag)}`}
      className={cn(
        'inline-block text-primary hover:underline font-medium',
        className
      )}
    >
      #{tag}
    </Link>
  );
}
