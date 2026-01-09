'use client';

import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ListingGrid, ListingCardSkeleton } from '@/components/marketplace';
import { getFavoriteListings } from '@/lib/api/listings';

export default function FavoritesPage() {
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['listings', 'favorites'],
    queryFn: ({ pageParam = 1 }) => getFavoriteListings(pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listings = listingsData?.pages.flatMap((page) => page.listings) ?? [];

  const handleFavoriteToggle = (_listingId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // Refetch favorites when item is removed
      queryClient.invalidateQueries({ queryKey: ['listings', 'favorites'] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="ფავორიტები"
          description="შენახული განცხადებები"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="ფავორიტები"
          description="შენახული განცხადებები"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა ფავორიტები</p>
          <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ფავორიტები"
        description={`${listings.length} შენახული განცხადება`}
      />

      {listings.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-full w-full" />}
          title="ფავორიტები ცარიელია"
          description="შეინახეთ განცხადებები რომ მოგვიანებით იხილოთ"
          action={
            <Link href="/marketplace">
              <Button>მარკეტის ნახვა</Button>
            </Link>
          }
        />
      ) : (
        <>
          <ListingGrid
            listings={listings}
            onFavoriteToggle={handleFavoriteToggle}
          />

          {/* Load more trigger */}
          <div ref={ref} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
