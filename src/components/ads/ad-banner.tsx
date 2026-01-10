'use client';

import { cn } from '@/lib/utils';

interface AdBannerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function AdBanner({ className, size = 'medium' }: AdBannerProps) {
  const heights = {
    small: 'h-[100px]',
    medium: 'h-[250px]',
    large: 'h-[400px]',
  };

  return (
    <div
      className={cn(
        'bg-muted/50 rounded-xl border flex items-center justify-center overflow-hidden',
        heights[size],
        className
      )}
    >
      {/* Placeholder - replace with actual ad content */}
      <div className="text-center text-muted-foreground">
        <p className="text-xs uppercase tracking-wide">რეკლამა</p>
      </div>
    </div>
  );
}
