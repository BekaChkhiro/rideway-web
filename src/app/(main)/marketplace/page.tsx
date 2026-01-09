'use client';

import { Suspense, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Plus, Loader2, Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ListingGrid,
  ListingFilters,
  ListingCardSkeleton,
} from '@/components/marketplace';
import {
  getListings,
  getListingCategories,
  searchListings,
  getPopularListings,
} from '@/lib/api/listings';
import { useListingsStore } from '@/stores';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();
  const { filters, searchQuery, setCategories } = useListingsStore();

  const searchFromUrl = searchParams.get('q') || '';

  // Categories query
  const { data: categories = [] } = useQuery({
    queryKey: ['listings', 'categories'],
    queryFn: getListingCategories,
  });

  // Set categories in store
  useEffect(() => {
    if (categories.length > 0) {
      setCategories(categories);
    }
  }, [categories, setCategories]);

  // Listings query (with or without search)
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['listings', filters, searchFromUrl || searchQuery],
    queryFn: ({ pageParam = 1 }) => {
      const query = searchFromUrl || searchQuery;
      if (query) {
        return searchListings(query, filters, pageParam, 20);
      }
      return getListings(filters, pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Popular listings query
  const { data: popularListings = [] } = useQuery({
    queryKey: ['listings', 'popular'],
    queryFn: () => getPopularListings(5),
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listings = listingsData?.pages.flatMap((page) => page.listings) ?? [];

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
    <div className="space-y-6">
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
            placeholder="მოძებნე..."
            defaultValue={searchFromUrl}
            className="pl-10"
          />
        </div>
        <Button type="submit">ძებნა</Button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">კატეგორიები</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {categories.map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/marketplace?categoryId=${category.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span>{category.name}</span>
                    {category.listingsCount !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {category.listingsCount}
                      </Badge>
                    )}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <div className="ml-4 border-l pl-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/marketplace?categoryId=${child.id}`}
                          className="flex items-center justify-between rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <span>{child.name}</span>
                          {child.listingsCount !== undefined && (
                            <span className="text-xs">{child.listingsCount}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular listings */}
          {popularListings.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">პოპულარული</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
                  >
                    {listing.images[0] && (
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <img
                          src={listing.images[0].url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{listing.title}</p>
                      <p className="text-sm text-primary font-semibold">
                        {new Intl.NumberFormat('ka-GE').format(listing.price)} ₾
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <ListingFilters categories={categories} onFiltersChange={() => refetch()} />

          {/* Listings */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა განცხადებები</p>
              <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              title="განცხადებები არ მოიძებნა"
              description={
                searchFromUrl || searchQuery
                  ? 'სცადეთ სხვა საძიებო სიტყვები'
                  : 'ჯერ არ არის განცხადებები'
              }
              action={
                <Link href="/marketplace/create">
                  <Button>დაამატე პირველი</Button>
                </Link>
              }
            />
          ) : (
            <>
              <ListingGrid listings={listings} />

              {/* Load more trigger */}
              <div ref={ref} className="py-4 flex justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketplaceLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-10 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
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
