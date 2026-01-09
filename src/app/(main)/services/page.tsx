'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Plus, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ServiceCard,
  ServiceCardSkeleton,
  ServiceCategoryList,
  ServiceCategoryListSkeleton,
} from '@/components/services';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getServices, getServiceCategories, deleteService, searchServices } from '@/lib/api/services';

function ServicesContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Categories query
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: getServiceCategories,
  });

  // Services query
  const {
    data: servicesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['services', { search: searchQuery }],
    queryFn: ({ pageParam = 1 }) =>
      searchQuery
        ? searchServices(searchQuery, pageParam, 20)
        : getServices(undefined, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('სერვისი წაიშალა');
      setDeleteServiceId(null);
    },
    onError: () => {
      toast.error('შეცდომა');
    },
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = localSearch ? `/services?q=${encodeURIComponent(localSearch)}` : '/services';
    window.history.pushState({}, '', url);
    refetch();
  };

  const services = servicesData?.pages.flatMap((page) => page.services) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="სერვისები"
        description="მოტოციკლეტის სერვისები და მაღაზიები"
        actions={
          <Link href="/services/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ახალი სერვისი
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {isCategoriesLoading ? (
            <ServiceCategoryListSkeleton />
          ) : (
            <ServiceCategoryList categories={categories} />
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="სერვისის ძებნა..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">ძებნა</Button>
          </form>

          {/* Services */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა სერვისები</p>
              <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              title="სერვისები არ მოიძებნა"
              description={searchQuery ? 'სცადეთ სხვა საძიებო სიტყვა' : 'ჯერ არ არის სერვისები'}
              action={
                !searchQuery && (
                  <Link href="/services/create">
                    <Button>დაამატე პირველი</Button>
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onDelete={(id) => setDeleteServiceId(id)}
                  />
                ))}
              </div>

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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>სერვისის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ სერვისის წაშლა? ეს მოქმედება შეუქცევადია.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteServiceId && deleteMutation.mutate(deleteServiceId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ServiceCategoryListSkeleton />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}
