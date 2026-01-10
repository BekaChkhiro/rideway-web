'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ListingCarousel,
  ListingCarouselSkeleton,
  BannerRow,
  placeholderBanners,
} from '@/components/marketplace';
import { getListings } from '@/lib/api/listings';
import type { ListingType } from '@/types';

// Fetch listings by type
function useListingsByType(type: ListingType, limit = 10) {
  return useQuery({
    queryKey: ['listings', 'byType', type],
    queryFn: () => getListings({ type }, 1, limit),
  });
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('q') || '';

  // Fetch listings for each type
  const { data: motorcyclesData, isLoading: motorcyclesLoading } = useListingsByType('MOTORCYCLE');
  const { data: partsData, isLoading: partsLoading } = useListingsByType('PARTS');
  const { data: equipmentData, isLoading: equipmentLoading } = useListingsByType('EQUIPMENT');
  const { data: accessoriesData, isLoading: accessoriesLoading } = useListingsByType('ACCESSORIES');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/marketplace?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="მარკეტი"
        description="მოტოციკლები, ნაწილები და ეკიპირება"
        actions={
          <Link href="/marketplace/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              განცხადების დამატება
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="მოძებნე მოტოციკლები, ნაწილები, ეკიპირება..."
            defaultValue={searchFromUrl}
            className="pl-10"
          />
        </div>
        <Button type="submit">ძებნა</Button>
      </form>

      {/* Top Banners */}
      <BannerRow banners={placeholderBanners[0]!} />

      {/* Motorcycles Carousel */}
      <ListingCarousel
        title="მოტოციკლები"
        listings={motorcyclesData?.listings ?? []}
        isLoading={motorcyclesLoading}
        type="MOTORCYCLE"
      />

      {/* Parts Carousel */}
      <ListingCarousel
        title="ნაწილები"
        listings={partsData?.listings ?? []}
        isLoading={partsLoading}
        type="PARTS"
      />

      {/* Equipment Carousel */}
      <ListingCarousel
        title="ეკიპირება"
        listings={equipmentData?.listings ?? []}
        isLoading={equipmentLoading}
        type="EQUIPMENT"
      />

      {/* Accessories Carousel */}
      <ListingCarousel
        title="აქსესუარები"
        listings={accessoriesData?.listings ?? []}
        isLoading={accessoriesLoading}
        type="ACCESSORIES"
      />

      {/* Bottom Banners */}
      <BannerRow banners={placeholderBanners[1]!} />
    </div>
  );
}

function MarketplaceLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>

      {/* Search skeleton */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
      </div>

      {/* Banner skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[2/1] bg-muted animate-pulse rounded-lg" />
        <div className="aspect-[2/1] bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Carousel skeleton */}
      <ListingCarouselSkeleton title="მოტოციკლები" />

      {/* Banner skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[2/1] bg-muted animate-pulse rounded-lg" />
        <div className="aspect-[2/1] bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Carousel skeleton */}
      <ListingCarouselSkeleton title="ნაწილები" />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceContent />
    </Suspense>
  );
}
