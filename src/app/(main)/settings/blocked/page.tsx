'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Ban, UserX } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { getBlockedUsers, unblockUser } from '@/lib/api/users';
import { toast } from '@/lib/toast';
import type { UserCard as UserCardType } from '@/types';

function BlockedUserCard({ user }: { user: UserCardType }) {
  const queryClient = useQueryClient();

  const unblockMutation = useMutation({
    mutationFn: () => unblockUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'blocked'] });
      toast.success(`${user.fullName} განბლოკილია`);
    },
    onError: () => {
      toast.error('განბლოკვა ვერ მოხერხდა');
    },
  });

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg">
      <Link
        href={`/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.fullName}</p>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
      </Link>

      <Button
        variant="outline"
        size="sm"
        onClick={() => unblockMutation.mutate()}
        disabled={unblockMutation.isPending}
      >
        {unblockMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'განბლოკვა'
        )}
      </Button>
    </div>
  );
}

function BlockedUsersList() {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', 'blocked'],
    queryFn: ({ pageParam = 1 }) => getBlockedUsers(pageParam),
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
        icon={<Ban className="h-full w-full" />}
        title="დაბლოკილი მომხმარებლები არ არის"
        description="დაბლოკილი მომხმარებლები აქ გამოჩნდებიან."
      />
    );
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <BlockedUserCard key={user.id} user={user} />
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
                იტვირთება...
              </>
            ) : (
              'მეტის ჩატვირთვა'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BlockedUsersPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            დაბლოკილი მომხმარებლები
          </CardTitle>
          <CardDescription>
            მომხმარებლები რომლებიც დაბლოკე. ისინი ვერ ხედავენ შენს პროფილს, პოსტებს
            და ვერ გწერენ შეტყობინებებს.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedUsersList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>რა ხდება როცა ვინმეს დაბლოკავ?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>ისინი ვერ იპოვიან შენს პროფილს და პოსტებს.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>ვერ გამოგიგზავნიან შეტყობინებას და ვერ მოგყვებიან.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>მათ არ მიიღებენ შეტყობინებას დაბლოკვის შესახებ.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>
                თუ ერთმანეთს მიყვებოდით, ორივე გაუნფოლოვდებით.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
