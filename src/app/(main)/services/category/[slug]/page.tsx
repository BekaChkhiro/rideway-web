'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Plus, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
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
import { getServices, getServiceCategories, deleteService } from '@/lib/api/services';

export default function ServiceCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  // Categories query
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: getServiceCategories,
  });

  // Find current category
  const currentCategory = categories.find((c) => c.slug === slug);

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
    queryKey: ['services', { categoryId: currentCategory?.id }],
    queryFn: ({ pageParam = 1 }) =>
      getServices(currentCategory?.id, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!currentCategory,
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

  const services = servicesData?.pages.flatMap((page) => page.services) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={currentCategory?.name || 'კატეგორია'}
          description={currentCategory?.description || undefined}
          actions={
            <Link href={`/services/create?category=${slug}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                ახალი სერვისი
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {isCategoriesLoading ? (
            <ServiceCategoryListSkeleton />
          ) : (
            <ServiceCategoryList categories={categories} activeCategory={slug} />
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
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
              description="ჯერ არ არის სერვისები ამ კატეგორიაში"
              action={
                <Link href={`/services/create?category=${slug}`}>
                  <Button>დაამატე პირველი</Button>
                </Link>
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
