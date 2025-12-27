'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type AspectRatio = '1:1' | '4:3' | '16:9' | '3:4' | '9:16' | '21:9' | 'auto';

const aspectRatioClasses: Record<AspectRatio, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  '9:16': 'aspect-[9/16]',
  '21:9': 'aspect-[21/9]',
  auto: '',
};

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  aspectRatio?: AspectRatio;
  fallbackSrc?: string;
  showSkeleton?: boolean;
  containerClassName?: string;
  errorClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio = 'auto',
  fallbackSrc,
  showSkeleton = true,
  className,
  containerClassName,
  errorClassName,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If error and we have a fallback, try the fallback
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // Show error state if image failed and no fallback
  if (hasError && !fallbackSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          aspectRatioClasses[aspectRatio],
          containerClassName,
          errorClassName
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill={fill ?? aspectRatio !== 'auto'}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIDAAQRBRITITFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEEA/AKF7dXNxJiSaRgPALHA/KKKoH//Z"
        {...props}
      />
    </div>
  );
}

// Gallery image with lightbox support
interface GalleryImageProps extends OptimizedImageProps {
  onClick?: () => void;
}

export function GalleryImage({
  onClick,
  className,
  containerClassName,
  ...props
}: GalleryImageProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative block overflow-hidden rounded-lg transition-transform hover:scale-[1.02]',
        containerClassName
      )}
    >
      <OptimizedImage
        {...props}
        className={cn(
          'transition-transform duration-300 group-hover:scale-105',
          className
        )}
        containerClassName=""
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
    </button>
  );
}

// Background image component
interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
}

export function BackgroundImage({
  src,
  alt = '',
  className,
  overlayClassName,
  children,
}: BackgroundImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
      {overlayClassName && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
