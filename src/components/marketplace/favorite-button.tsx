'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/lib/api/listings';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  listingId: string;
  isFavorited: boolean;
  onToggle?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({
  listingId,
  isFavorited: initialFavorited,
  onToggle,
  size = 'md',
  variant = 'ghost',
  showText = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const newState = await toggleFavorite(listingId, isFavorited);
      setIsFavorited(newState);
      onToggle?.(newState);
      toast.success(newState ? 'ფავორიტებში დაემატა' : 'ფავორიტებიდან წაიშალა');
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  if (showText) {
    return (
      <Button
        variant={variant}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className={className}
      >
        <Heart
          className={cn(
            'mr-2 h-4 w-4',
            isFavorited && 'fill-red-500 text-red-500'
          )}
        />
        {isFavorited ? 'ფავორიტებში' : 'დამახსოვრება'}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(sizeClasses[size], className)}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(isFavorited && 'fill-red-500 text-red-500')}
      />
    </Button>
  );
}
