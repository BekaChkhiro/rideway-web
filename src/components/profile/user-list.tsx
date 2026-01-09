'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { UserCard } from './user-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { UserCard as UserCardType, PaginationMeta } from '@/types';

interface UserListProps {
  queryKey: string[];
  queryFn: (page: number) => Promise<{ users: UserCardType[]; meta: PaginationMeta }>;
  emptyTitle: string;
  emptyDescription: string;
  currentUserId?: string;
  showFollowButton?: boolean;
}

export function UserList({
  queryKey,
  queryFn,
  emptyTitle,
  emptyDescription,
  currentUserId,
  showFollowButton = true,
}: UserListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-destructive">
        Error: {(error as Error).message}
      </div>
    );
  }

  const users = data?.pages.flatMap((page) => page.users) || [];

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-full w-full" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          showFollowButton={showFollowButton}
          currentUserId={currentUserId}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
