'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceTag } from './price-tag';
import { ConditionBadge } from './condition-badge';
import { FavoriteButton } from './favorite-button';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';
import { LOCATION_TYPES } from '@/types';

// Helper to format location display
function getLocationDisplay(listing: Listing): string | null {
  if (!listing.locationType) return null;
  const typeLabel = LOCATION_TYPES.find(t => t.value === listing.locationType)?.label;
  if (listing.locationType === 'ON_THE_WAY') {
    return typeLabel ?? null;
  }
  if (listing.locationCity) {
    return listing.locationCity;
  }
  return typeLabel ?? null;
}

interface ListingCardProps {
  listing: Listing;
  variant?: 'grid' | 'list';
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
}

export function ListingCard({
  listing,
  variant = 'grid',
  onFavoriteToggle,
}: ListingCardProps) {
  const mainImage = listing.images[0]?.url;
  const formattedDate = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  const isSold = listing.status === 'SOLD';

  if (variant === 'list') {
    return (
      <Link href={`/marketplace/listing/${listing.id}`}>
        <Card className={cn(
          'overflow-hidden transition-shadow hover:shadow-md',
          isSold && 'opacity-60'
        )}>
          <div className="flex">
            {/* Image */}
            <div className="relative h-40 w-48 flex-shrink-0">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Badge variant="destructive" className="text-lg">გაყიდულია</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                  <FavoriteButton
                    listingId={listing.id}
                    isFavorited={listing.isFavorited ?? false}
                    onToggle={(isFav) => onFavoriteToggle?.(listing.id, isFav)}
                    size="sm"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PriceTag price={listing.price} size="md" />
                  <ConditionBadge condition={listing.condition} />
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {getLocationDisplay(listing) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getLocationDisplay(listing)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.viewsCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/marketplace/listing/${listing.id}`}>
      <Card className={cn(
        'overflow-hidden transition-shadow hover:shadow-md',
        isSold && 'opacity-60'
      )}>
        {/* Image */}
        <div className="relative aspect-[4/3]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {/* Favorite button overlay */}
          <div className="absolute right-2 top-2">
            <FavoriteButton
              listingId={listing.id}
              isFavorited={listing.isFavorited ?? false}
              onToggle={(isFav) => onFavoriteToggle?.(listing.id, isFav)}
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            />
          </div>

          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive" className="text-lg">გაყიდულია</Badge>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
              {listing.category.name}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{listing.title}</h3>

          <div className="mt-2 flex items-center justify-between">
            <PriceTag price={listing.price} />
            <ConditionBadge condition={listing.condition} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {getLocationDisplay(listing) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getLocationDisplay(listing)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {listing.viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function ListingCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          <div className="h-40 w-48 flex-shrink-0 bg-muted animate-pulse" />
          <CardContent className="flex flex-1 flex-col justify-between p-4">
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="mt-3 flex justify-between">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex justify-between">
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
