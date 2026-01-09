'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ServiceCard, ServiceCardSkeleton } from '@/components/services';
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
import { getUserServices, deleteService } from '@/lib/api/services';

export default function MyServicesPage() {
  const { data: session, status } = useSession();
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const userId = session?.user?.id;

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
    queryKey: ['services', 'user', userId],
    queryFn: ({ pageParam = 1 }) => getUserServices(userId!, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
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

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">გთხოვთ გაიაროთ ავტორიზაცია</p>
        <Link href="/login">
          <Button>შესვლა</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ჩემი სერვისები"
        description="მართე შენი სერვისები"
        actions={
          <Link href="/services/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ახალი სერვისი
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          description="ჯერ არ გაქვს დამატებული სერვისები"
          action={
            <Link href="/services/create">
              <Button>დაამატე პირველი</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
