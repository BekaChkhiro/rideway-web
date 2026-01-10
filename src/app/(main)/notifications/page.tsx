'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  MessageCircle,
  Eye,
  ShoppingBag,
  Star,
  CheckCheck,
  Trash2,
  Loader2,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/api/notifications';
import { toast } from '@/lib/toast';
import type { Notification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores';

const notificationIcons: Record<NotificationType, typeof Heart> = {
  NEW_FOLLOWER: UserPlus,
  POST_LIKE: Heart,
  POST_COMMENT: MessageSquare,
  COMMENT_REPLY: MessageCircle,
  NEW_MESSAGE: MessageSquare,
  THREAD_REPLY: MessageCircle,
  LISTING_INQUIRY: ShoppingBag,
  SERVICE_REVIEW: Star,
  STORY_VIEW: Eye,
};

const notificationColors: Record<NotificationType, string> = {
  NEW_FOLLOWER: 'text-blue-500',
  POST_LIKE: 'text-red-500',
  POST_COMMENT: 'text-green-500',
  COMMENT_REPLY: 'text-purple-500',
  NEW_MESSAGE: 'text-yellow-500',
  THREAD_REPLY: 'text-indigo-500',
  LISTING_INQUIRY: 'text-orange-500',
  SERVICE_REVIEW: 'text-amber-500',
  STORY_VIEW: 'text-pink-500',
};

function getNotificationLink(notification: Notification): string | null {
  const { type, data } = notification;
  if (!data) return null;

  switch (type) {
    case 'NEW_FOLLOWER':
      return data.username ? `/${data.username}` : null;
    case 'POST_LIKE':
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return data.postId ? `/post/${data.postId}` : null;
    case 'NEW_MESSAGE':
      return data.conversationId ? `/messages/${data.conversationId}` : null;
    case 'THREAD_REPLY':
      return data.threadId ? `/forum/${data.threadId}` : null;
    case 'LISTING_INQUIRY':
      return data.listingId ? `/marketplace/${data.listingId}` : null;
    case 'SERVICE_REVIEW':
      return data.serviceId ? `/services/${data.serviceId}` : null;
    case 'STORY_VIEW':
      return null;
    default:
      return null;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const Icon = notificationIcons[notification.type] || Bell;
  const iconColor = notificationColors[notification.type] || 'text-muted-foreground';
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (link) {
      router.push(link);
    }
  };

  const actorInitials = notification.actor?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border-b transition-colors',
        !notification.isRead && 'bg-muted/50',
        link && 'cursor-pointer hover:bg-muted/30'
      )}
      onClick={handleClick}
    >
      {notification.actor ? (
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.actor.avatarUrl || undefined} />
          <AvatarFallback>{actorInitials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn('p-2 rounded-full bg-muted', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ka,
          })}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get real-time notifications from store
  const storeNotifications = useNotificationsStore((state) => state.notifications);
  const setStoreNotifications = useNotificationsStore((state) => state.setNotifications);
  const setStoreUnreadCount = useNotificationsStore((state) => state.setUnreadCount);

  // Merge store notifications with local state (for real-time updates)
  useEffect(() => {
    if (storeNotifications.length > 0) {
      setNotifications((prev) => {
        // Get new notifications that aren't in local state yet
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotifications = storeNotifications.filter((n) => !existingIds.has(n.id));
        if (newNotifications.length > 0) {
          return [...newNotifications, ...prev];
        }
        return prev;
      });
    }
  }, [storeNotifications]);

  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const { notifications: data, meta } = await getNotifications(pageNum, 20);

      if (append) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
        // Sync to store for real-time updates
        setStoreNotifications(data);
      }

      setHasMore(pageNum < meta.totalPages);
    } catch {
      toast.error('შეტყობინებების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [setStoreNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
      setStoreUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, [setStoreUnreadCount]);

  useEffect(() => {
    if (user) {
      fetchNotifications(1);
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('შეცდომა');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('ყველა შეტყობინება წაკითხულია');
    } catch {
      toast.error('შეცდომა');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      const notification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('შეტყობინება წაიშალა');
    } catch {
      toast.error('შეცდომა');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  if (authLoading) {
    return (
      <div className="container max-w-2xl py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">გაიარეთ ავტორიზაცია</p>
            <Button asChild className="mt-4">
              <Link href="/login">შესვლა</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            შეტყობინებები
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              ყველას წაკითხვა
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">შეტყობინებები არ არის</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        იტვირთება...
                      </>
                    ) : (
                      'მეტის ჩვენება'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
