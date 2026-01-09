'use client';

import { useEffect } from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { joinConversation, leaveConversation, markMessagesRead } from '@/lib/socket';
import { markAsRead } from '@/lib/api';
import { useChatStore } from '@/stores';
import { useSocket } from '@/providers/socket-provider';
import type { Conversation } from '@/types';

interface ChatWindowProps {
  conversation: Conversation;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const { isConnected } = useSocket();
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const markConversationAsRead = useChatStore((state) => state.markConversationAsRead);

  // Set active conversation and join socket room
  useEffect(() => {
    setActiveConversation(conversation.id);

    if (isConnected) {
      joinConversation(conversation.id);
    }

    return () => {
      setActiveConversation(null);
      if (isConnected) {
        leaveConversation(conversation.id);
      }
    };
  }, [conversation.id, isConnected, setActiveConversation]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      // Mark via API
      markAsRead(conversation.id).catch(console.error);

      // Update local state
      markConversationAsRead(conversation.id);

      // Mark via socket for real-time sync
      if (isConnected) {
        markMessagesRead(conversation.id);
      }
    }
  }, [conversation.id, conversation.unreadCount, isConnected, markConversationAsRead]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader participant={conversation.participant} />
      <MessageList conversationId={conversation.id} />
      <MessageForm conversationId={conversation.id} />
    </div>
  );
}
