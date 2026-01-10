'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users } from 'lucide-react';

import { UserAvatar } from '@/components/ui/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/auth.store';
import { getFollowing } from '@/lib/api/users';
import {
  getOnlineUsers,
  onSocketEvent,
  offSocketEvent,
  getSocket,
} from '@/lib/socket';
import type { UserCard } from '@/types';

export function OnlineFriends() {
  const { user, isAuthenticated } = useAuthStore();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Fetch following list
  const { data, isLoading } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => getFollowing(user!.id, 1, 100),
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const following = useMemo(() => data?.users ?? [], [data?.users]);

  // Check online status when following list loads
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (following.length === 0) return;

      const userIds = following.map((u) => u.id);
      const onlineIds = await getOnlineUsers(userIds);
      setOnlineUserIds(new Set(onlineIds));
    };

    if (getSocket()?.connected) {
      checkOnlineStatus();
    }
  }, [following]);

  // Listen for online/offline events
  const handleUserOnline = useCallback(
    (data: { userId: string }) => {
      const isFollowing = following.some((u) => u.id === data.userId);
      if (isFollowing) {
        setOnlineUserIds((prev) => new Set([...prev, data.userId]));
      }
    },
    [following]
  );

  const handleUserOffline = useCallback((data: { userId: string }) => {
    setOnlineUserIds((prev) => {
      const next = new Set(prev);
      next.delete(data.userId);
      return next;
    });
  }, []);

  useEffect(() => {
    onSocketEvent('user:online', handleUserOnline);
    onSocketEvent('user:offline', handleUserOffline);

    return () => {
      offSocketEvent('user:online', handleUserOnline);
      offSocketEvent('user:offline', handleUserOffline);
    };
  }, [handleUserOnline, handleUserOffline]);

  // Filter only online users
  const onlineFollowing = following.filter((u) => onlineUserIds.has(u.id));

  if (!isAuthenticated) return null;

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">ონლაინ მეგობრები</h3>
        {onlineFollowing.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {onlineFollowing.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <OnlineFriendsSkeleton />
      ) : onlineFollowing.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          ონლაინ მეგობრები არ არიან
        </p>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {onlineFollowing.map((friend) => (
              <OnlineFriendItem key={friend.id} user={friend} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function OnlineFriendItem({ user }: { user: UserCard }) {
  return (
    <Link
      href={`/${user.username}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <UserAvatar
        user={user}
        size="sm"
        showOnline
        isOnline
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.fullName}</p>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
      </div>
    </Link>
  );
}

function OnlineFriendsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
