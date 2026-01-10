'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/notifications';
import type { Notification, NotificationType } from '@/types';

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
      return data.listingId ? `/marketplace/listing/${data.listingId}` : null;
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
  onClose,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
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
      onClose();
      router.push(link);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-muted/50',
        !notification.isRead && 'bg-muted/30'
      )}
      onClick={handleClick}
    >
      <div className={cn('p-1.5 rounded-full bg-muted flex-shrink-0', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm line-clamp-2', !notification.isRead && 'font-medium')}>
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ka,
          })}
        </p>
      </div>

      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Get from store
  const storeNotifications = useNotificationsStore((state) => state.notifications);
  const storeUnreadCount = useNotificationsStore((state) => state.unreadCount);
  const setStoreNotifications = useNotificationsStore((state) => state.setNotifications);
  const setStoreUnreadCount = useNotificationsStore((state) => state.setUnreadCount);
  const markAsReadInStore = useNotificationsStore((state) => state.markAsRead);
  const markAllAsReadInStore = useNotificationsStore((state) => state.markAllAsRead);

  // Merge store notifications with local (for real-time updates)
  const notifications = [...storeNotifications];
  // Add local notifications that aren't in store
  localNotifications.forEach((n) => {
    if (!notifications.find((sn) => sn.id === n.id)) {
      notifications.push(n);
    }
  });
  // Filter only unread, sort by date, limit to 10
  const displayNotifications = notifications
    .filter((n) => !n.isRead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const unreadCount = storeUnreadCount;

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [{ notifications: data }, count] = await Promise.all([
        getNotifications(1, 10),
        getUnreadNotificationsCount(),
      ]);
      setLocalNotifications(data);
      setStoreNotifications(data);
      setStoreUnreadCount(count);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [setStoreNotifications, setStoreUnreadCount]);

  // Fetch on open
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      markAsReadInStore(id);
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsReadInStore();
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Silently fail
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">შეტყობინებები</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllAsRead}
            >
              ყველას წაკითხვა
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="min-h-[300px] max-h-[400px]">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">ახალი შეტყობინებები არ არის</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={handleViewAll}
          >
            ყველას ნახვა
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
