'use client';

import { useEffect } from 'react';
import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { MessageForm } from './message-form';
import { joinConversation, leaveConversation, markMessagesRead } from '@/lib/socket';
import { markAsRead } from '@/lib/api';
import { useChatStore, useNotificationsStore } from '@/stores';
import { useSocket } from '@/providers/socket-provider';
import { markNotificationAsRead } from '@/lib/api/notifications';
import type { Conversation } from '@/types';

interface ChatWindowProps {
  conversation: Conversation;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const { isConnected } = useSocket();
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const markConversationAsRead = useChatStore((state) => state.markConversationAsRead);

  // Notifications store
  const notifications = useNotificationsStore((state) => state.notifications);
  const markNotificationAsReadInStore = useNotificationsStore((state) => state.markAsRead);

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

  // Mark related message notifications as read
  useEffect(() => {
    // Find unread NEW_MESSAGE notifications for this conversation
    const messageNotifications = notifications.filter(
      (n) => n.type === 'NEW_MESSAGE' &&
             !n.isRead &&
             n.data?.conversationId === conversation.id
    );

    // Mark each as read
    messageNotifications.forEach((notification) => {
      markNotificationAsRead(notification.id).catch(console.error);
      markNotificationAsReadInStore(notification.id);
    });
  }, [conversation.id, notifications, markNotificationAsReadInStore]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader participant={conversation.participant} conversationId={conversation.id} />
      <MessageList conversationId={conversation.id} />
      <MessageForm conversationId={conversation.id} />
    </div>
  );
}
