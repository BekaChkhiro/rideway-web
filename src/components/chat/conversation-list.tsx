'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { ConversationItem } from './conversation-item';
import { ConversationSkeleton } from './conversation-skeleton';
import { getConversations } from '@/lib/api';
import { useChatStore } from '@/stores';

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const setConversations = useChatStore((state) => state.setConversations);
  const conversations = useChatStore((state) => state.conversations);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam = 1 }) => getConversations(pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Sync conversations to store
  useEffect(() => {
    if (data?.pages) {
      const allConversations = data.pages.flatMap((page) => page.conversations);
      setConversations(allConversations);
    }
  }, [data, setConversations]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p>შეცდომა საუბრების ჩატვირთვისას</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
        <p>საუბრები არ გაქვთ</p>
        <p className="text-sm">დაიწყეთ ახალი საუბარი პროფილის გვერდიდან</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
        />
      ))}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={ref} className="py-2">
          {isFetchingNextPage && <ConversationSkeleton />}
        </div>
      )}
    </div>
  );
}
