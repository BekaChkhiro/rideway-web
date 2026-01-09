'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ConversationList, ChatWindow, ChatWindowSkeleton } from '@/components/chat';
import { getConversations } from '@/lib/api';
import { useChatStore } from '@/stores';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  const router = useRouter();

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);

  // Fetch conversations if not in store
  const { isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(1, 50),
    enabled: conversations.length === 0,
  });

  // Sync to store
  useEffect(() => {
    if (conversations.length === 0) {
      getConversations(1, 50).then((data) => {
        setConversations(data.conversations);
      });
    }
  }, [conversations.length, setConversations]);

  // Find the current conversation
  const conversation = conversations.find((c) => c.id === conversationId);

  // If conversation not found and not loading, redirect
  useEffect(() => {
    if (!isLoading && conversations.length > 0 && !conversation) {
      router.push('/messages');
    }
  }, [isLoading, conversations.length, conversation, router]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations sidebar (hidden on mobile) */}
      <div className="hidden md:flex md:w-80 lg:w-96 border-r flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">შეტყობინებები</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList activeConversationId={conversationId} />
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {isLoading || !conversation ? (
          <ChatWindowSkeleton />
        ) : (
          <ChatWindow conversation={conversation} />
        )}
      </div>
    </div>
  );
}
