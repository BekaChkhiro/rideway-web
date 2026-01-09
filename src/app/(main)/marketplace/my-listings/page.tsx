'use client';

import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListingGrid, ListingCardSkeleton } from '@/components/marketplace';
import { getUserListings } from '@/lib/api/listings';
import type { Listing } from '@/types';

export default function MyListingsPage() {
  const { data: session } = useSession();
  const { ref, inView } = useInView();

  const userId = session?.user?.id;

  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['listings', 'user', userId],
    queryFn: ({ pageParam = 1 }) => getUserListings(userId!, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allListings = listingsData?.pages.flatMap((page) => page.listings) ?? [];

  // Filter by status
  const activeListings = allListings.filter((l) => l.status === 'ACTIVE');
  const soldListings = allListings.filter((l) => l.status === 'SOLD');

  const renderContent = (listings: Listing[], emptyText: string) => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა განცხადებები</p>
          <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <EmptyState
          title={emptyText}
          action={
            <Link href="/marketplace/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                დაამატე განცხადება
              </Button>
            </Link>
          }
        />
      );
    }

    return (
      <>
        <ListingGrid listings={listings} showViewToggle={false} />

        {/* Load more trigger */}
        <div ref={ref} className="py-4 flex justify-center">
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ჩემი განცხადებები"
        description="მართეთ თქვენი განცხადებები"
        actions={
          <Link href="/marketplace/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ახალი განცხადება
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            აქტიური ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="sold">
            გაყიდული ({soldListings.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            ყველა ({allListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {renderContent(activeListings, 'აქტიური განცხადებები არ გაქვთ')}
        </TabsContent>

        <TabsContent value="sold" className="mt-4">
          {renderContent(soldListings, 'გაყიდული განცხადებები არ გაქვთ')}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {renderContent(allListings, 'განცხადებები არ გაქვთ')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
