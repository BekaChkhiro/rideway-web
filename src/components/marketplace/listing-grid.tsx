'use client';

import { LayoutGrid, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ListingCard, ListingCardSkeleton } from './listing-card';
import { useListingsStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
  showViewToggle?: boolean;
  emptyMessage?: string;
}

export function ListingGrid({
  listings,
  isLoading = false,
  onFavoriteToggle,
  showViewToggle = true,
  emptyMessage = 'განცხადებები არ მოიძებნა',
}: ListingGridProps) {
  const { viewMode, setViewMode } = useListingsStore();

  if (isLoading) {
    return (
      <div>
        {showViewToggle && (
          <div className="mb-4 flex justify-end">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        )}
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} variant={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {showViewToggle && (
        <div className="mb-4 flex justify-end">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      )}
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col gap-4'
        )}
      >
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            variant={viewMode}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 rounded-md border p-1">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onViewModeChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onViewModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
