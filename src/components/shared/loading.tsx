'use client';

import { Loader2, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  className,
  size = 'md',
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Bike className="h-16 w-16 text-primary animate-pulse" />
            <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-spin" />
          </div>
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Simple spinner variant
export function Spinner({ className, size = 'md' }: Omit<LoadingProps, 'text' | 'fullScreen'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
}
