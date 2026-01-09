'use client';

import { useEffect } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ThreadCard,
  ThreadCardSkeleton,
  CategoryList,
  CategoryListSkeleton,
} from '@/components/forum';
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
import { getThreads, getForumCategories, deleteThread } from '@/lib/api/forum';
import type { ThreadFilters } from '@/types';
import { useState } from 'react';

const sortOptions = [
  { value: 'latest', label: 'უახლესი' },
  { value: 'oldest', label: 'ძველი' },
  { value: 'popular', label: 'პოპულარული' },
  { value: 'most_replies', label: 'მეტი პასუხით' },
] as const;

export default function ForumPage() {
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<ThreadFilters['sort']>('latest');
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);

  // Categories query
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['forum', 'categories'],
    queryFn: getForumCategories,
  });

  // Threads query
  const {
    data: threadsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['forum', 'threads', { sort }],
    queryFn: ({ pageParam = 1 }) => getThreads({ sort }, pageParam, 20),
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
    mutationFn: deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
      toast.success('თემა წაიშალა');
      setDeleteThreadId(null);
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

  const threads = threadsData?.pages.flatMap((page) => page.threads) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ფორუმი"
        description="განხილვები და დისკუსიები"
        actions={
          <Link href="/forum/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ახალი თემა
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {isCategoriesLoading ? (
            <CategoryListSkeleton />
          ) : (
            <CategoryList categories={categories} />
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sort */}
          <div className="flex justify-end">
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as ThreadFilters['sort'])}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="სორტირება" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Threads */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <ThreadCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა თემები</p>
              <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
            </div>
          ) : threads.length === 0 ? (
            <EmptyState
              title="თემები არ მოიძებნა"
              description="ჯერ არ არის თემები ამ ფორუმში"
              action={
                <Link href="/forum/create">
                  <Button>შექმენი პირველი</Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="space-y-4">
                {threads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    onDelete={(id) => setDeleteThreadId(id)}
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
        open={!!deleteThreadId}
        onOpenChange={() => setDeleteThreadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>თემის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ თემის წაშლა? ეს მოქმედება შეუქცევადია.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteThreadId && deleteMutation.mutate(deleteThreadId)}
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
