'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ListingCard, ListingCardSkeleton } from './listing-card';
import { cn } from '@/lib/utils';
import type { Listing, ListingType } from '@/types';
import { LISTING_TYPES } from '@/types';

interface ListingCarouselProps {
  title: string;
  listings: Listing[];
  isLoading?: boolean;
  type?: ListingType;
  viewAllLink?: string;
  className?: string;
}

export function ListingCarousel({
  title,
  listings,
  isLoading = false,
  type,
  viewAllLink,
  className,
}: ListingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320; // Card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const typeConfig = type ? LISTING_TYPES.find((t) => t.value === type) : null;
  const link = viewAllLink || (typeConfig ? `/marketplace/${typeConfig.slug}` : '/marketplace');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href={link}>
            <Button variant="ghost" size="sm" className="gap-1">
              ყველა
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[280px] flex-shrink-0 snap-start">
              <ListingCardSkeleton />
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center text-muted-foreground">
            განცხადებები არ მოიძებნა
          </div>
        ) : (
          listings.map((listing) => (
            <div key={listing.id} className="w-[280px] flex-shrink-0 snap-start">
              <ListingCard listing={listing} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Skeleton for loading state
export function ListingCarouselSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[280px] flex-shrink-0">
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
