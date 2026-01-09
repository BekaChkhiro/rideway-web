'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChatStore, selectIsUserOnline } from '@/stores';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({
  conversation,
  isActive,
}: ConversationItemProps) {
  const { participant, lastMessage, unreadCount, updatedAt } = conversation;
  const isOnline = useChatStore((state) =>
    selectIsUserOnline(state, participant.id)
  );

  const initials = participant.fullName
    ? participant.fullName.slice(0, 2).toUpperCase()
    : participant.username.slice(0, 2).toUpperCase();

  const timeAgo = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
    locale: ka,
  });

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50',
        isActive && 'bg-muted',
        unreadCount > 0 && 'bg-muted/30'
      )}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={participant.avatarUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'font-medium truncate',
              unreadCount > 0 && 'text-foreground'
            )}
          >
            {participant.fullName || participant.username}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {timeAgo}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              'text-sm truncate',
              unreadCount > 0
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            {lastMessage?.content || 'დაიწყეთ საუბარი'}
          </p>

          {unreadCount > 0 && (
            <span className="flex-shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
