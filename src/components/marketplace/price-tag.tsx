'use client';

import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({
  price,
  currency = '₾',
  size = 'md',
  className,
}: PriceTagProps) {
  const formattedPrice = new Intl.NumberFormat('ka-GE').format(price);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
  };

  return (
    <span className={cn('text-primary', sizeClasses[size], className)}>
      {formattedPrice} {currency}
    </span>
  );
}
