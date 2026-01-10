'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ka } from 'date-fns/locale';
import { MessageItem } from './message-item';
import { MessageSkeleton } from './conversation-skeleton';
import { TypingIndicator } from './typing-indicator';
import { getMessages } from '@/lib/api';
import { useChatStore, selectTypingInConversation } from '@/stores';
import { useAuthStore } from '@/stores';
import type { Message } from '@/types';

const EMPTY_MESSAGES: Message[] = [];

interface MessageListProps {
  conversationId: string;
}

function formatDateDivider(date: Date): string {
  if (isToday(date)) return 'დღეს';
  if (isYesterday(date)) return 'გუშინ';
  return format(date, 'd MMMM', { locale: ka });
}

function shouldShowDateDivider(
  currentMessage: Message,
  previousMessage?: Message
): boolean {
  if (!previousMessage) return true;
  return !isSameDay(
    new Date(currentMessage.createdAt),
    new Date(previousMessage.createdAt)
  );
}

export function MessageList({ conversationId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const user = useAuthStore((state) => state.user);
  const setMessages = useChatStore((state) => state.setMessages);
  const prependMessages = useChatStore((state) => state.prependMessages);
  const setReplyTo = useChatStore((state) => state.setReplyTo);
  const setEditingMessage = useChatStore((state) => state.setEditingMessage);
  const messages = useChatStore(
    (state) => state.messages[conversationId] ?? EMPTY_MESSAGES
  );
  const typingUsers = useChatStore((state) =>
    selectTypingInConversation(state, conversationId)
  );

  const handleReply = (message: Message) => {
    setReplyTo(conversationId, message);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(conversationId, message);
  };

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam = 1 }) => getMessages(conversationId, pageParam, 50),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Sync messages to store
  useEffect(() => {
    if (data?.pages && data.pages.length > 0) {
      const firstPage = data.pages[0];
      const lastPage = data.pages[data.pages.length - 1];

      // First page - set messages
      if (data.pages.length === 1 && firstPage) {
        setMessages(conversationId, [...firstPage.messages].reverse());
        isInitialLoad.current = false;
      } else if (lastPage) {
        // Additional pages - prepend older messages
        const olderMessages = [...lastPage.messages].reverse();
        prependMessages(conversationId, olderMessages);
      }
    }
  }, [data, conversationId, setMessages, prependMessages]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (!isInitialLoad.current && messages.length > 0) {
      // Check if user is near bottom
      const container = containerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [isLoading, messages.length]);

  // Load more when scrolled to top
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>დაიწყეთ საუბარი</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-2">
          {isFetchingNextPage && (
            <div className="space-y-2">
              <MessageSkeleton />
              <MessageSkeleton />
            </div>
          )}
        </div>
      )}

      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isOwn = message.senderId === user?.id;

        return (
          <div key={message.id}>
            {showDateDivider && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                  {formatDateDivider(new Date(message.createdAt))}
                </span>
              </div>
            )}
            <MessageItem
              message={message}
              conversationId={conversationId}
              isOwn={isOwn}
              onReply={handleReply}
              onEdit={handleEdit}
            />
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator />
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
