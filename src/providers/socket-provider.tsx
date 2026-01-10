'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  onSocketEvent,
  offSocketEvent,
} from '@/lib/socket';
import { useChatStore, useNotificationsStore } from '@/stores';
import { getOrCreateConversation, getUnreadCount } from '@/lib/api/chat';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead } from '@/lib/api/notifications';
import type { Message, Notification } from '@/types';

// Request browser notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Show browser notification
const showBrowserNotification = (title: string, body: string, onClick?: () => void) => {
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    const notification = new Notification(title, {
      body,
      icon: '/Rideway-logo.svg',
      tag: 'new-message',
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
  }
};

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Chat store actions
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const setUserOnline = useChatStore((state) => state.setUserOnline);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const incrementUnreadCount = useChatStore((state) => state.incrementUnreadCount);
  const setUnreadCount = useChatStore((state) => state.setUnreadCount);
  const markMessagesAsReadByOther = useChatStore((state) => state.markMessagesAsReadByOther);
  const addConversation = useChatStore((state) => state.addConversation);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const addReactionToStore = useChatStore((state) => state.addReaction);
  const removeReactionFromStore = useChatStore((state) => state.removeReaction);
  const updateMessageInStore = useChatStore((state) => state.updateMessage);
  const deleteMessageInStore = useChatStore((state) => state.deleteMessage);

  // Notifications store actions
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const setNotifications = useNotificationsStore((state) => state.setNotifications);
  const setNotificationsUnreadCount = useNotificationsStore((state) => state.setUnreadCount);

  const connect = useCallback(() => {
    const newSocket = connectSocket();
    if (newSocket) {
      setSocket(newSocket);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  // Connect when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      connect();
    } else if (status === 'unauthenticated') {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [status, session, connect, disconnect]);

  // Handle connection state
  useEffect(() => {
    const currentSocket = getSocket();
    if (!currentSocket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    currentSocket.on('connect', handleConnect);
    currentSocket.on('disconnect', handleDisconnect);

    // Set initial connection state
    setIsConnected(currentSocket.connected);

    return () => {
      currentSocket.off('connect', handleConnect);
      currentSocket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Fetch unread counts and notifications on connection
  useEffect(() => {
    if (!isConnected) return;

    const fetchData = async () => {
      try {
        const [messagesCount, notificationsCount, { notifications }] = await Promise.all([
          getUnreadCount(),
          getUnreadNotificationsCount(),
          getNotifications(1, 50), // Fetch recent notifications
        ]);
        setUnreadCount(messagesCount);
        setNotificationsUnreadCount(notificationsCount);
        setNotifications(notifications);
      } catch {
        // Silently fail
      }
    };

    fetchData();
    requestNotificationPermission();
  }, [isConnected, setUnreadCount, setNotificationsUnreadCount, setNotifications]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // New message handler
    const handleNewMessage = async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      addMessage(conversationId, message);

      // Check if this is not the active conversation
      const isNotActive = conversationId !== activeConversationId;

      // Check if this message is from someone else (not our own message)
      const currentUserId = (session?.user as { id?: string })?.id;
      const isFromOther = message.senderId !== currentUserId;

      // Check if conversation exists in store
      const existingConversation = useChatStore.getState().conversations.find(
        (c) => c.id === conversationId
      );

      if (existingConversation) {
        // Update conversation's last message and unread count
        updateConversation(conversationId, {
          lastMessage: message.content,
          lastMessageSenderId: message.senderId,
          updatedAt: message.createdAt,
          // Only increment unread if not active AND message is from someone else
          ...(isNotActive && isFromOther && {
            unreadCount: (existingConversation.unreadCount || 0) + 1,
          }),
        });
      } else if (isFromOther) {
        // New conversation from someone else - fetch it and add to store
        try {
          const conversation = await getOrCreateConversation({ participantId: message.senderId });
          if (conversation) {
            addConversation({
              ...conversation,
              unreadCount: 1,
            });
          }
        } catch {
          // Silently fail - conversation will appear on next load
        }
      }

      // Increment global unread if not in active conversation AND from someone else
      if (isNotActive && isFromOther) {
        incrementUnreadCount();

        // Browser push notification (when tab is not active)
        const senderName = existingConversation?.participant?.fullName
          || existingConversation?.participant?.username
          || 'ახალი შეტყობინება';

        showBrowserNotification(
          senderName,
          message.content.length > 100
            ? message.content.substring(0, 100) + '...'
            : message.content,
          () => {
            window.location.href = `/messages/${conversationId}`;
          }
        );
      }
    };

    // Read receipt handler
    const handleMessagesRead = ({
      conversationId,
    }: {
      conversationId: string;
      readBy: string;
    }) => {
      markMessagesAsReadByOther(conversationId);
    };

    // Typing handlers
    const handleTypingStart = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      setTyping(conversationId, userId, true);
    };

    const handleTypingStop = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      setTyping(conversationId, userId, false);
    };

    // Online status handlers
    const handleUserOnline = ({ userId }: { userId: string }) => {
      setUserOnline(userId, true);
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setUserOnline(userId, false);
    };

    // New notification handler
    const handleNewNotification = ({ notification }: { notification: Notification }) => {
      // Check if this is a message notification for the active conversation
      const isMessageForActiveConversation =
        notification.type === 'NEW_MESSAGE' &&
        notification.data?.conversationId === activeConversationId;

      if (isMessageForActiveConversation) {
        // User is viewing this conversation, mark notification as read immediately
        markNotificationAsRead(notification.id).catch(() => {});
        // Don't add to store since it's already read
        return;
      }

      // Add to store for real-time updates on notifications page
      addNotification(notification);
    };

    // Reaction added handler
    const handleReactionAdded = ({
      conversationId,
      messageId,
      emoji,
      userId,
    }: {
      conversationId: string;
      messageId: string;
      emoji: string;
      userId: string;
    }) => {
      addReactionToStore(conversationId, messageId, emoji, userId);
    };

    // Reaction removed handler
    const handleReactionRemoved = ({
      conversationId,
      messageId,
      emoji,
      userId,
    }: {
      conversationId: string;
      messageId: string;
      emoji: string;
      userId: string;
    }) => {
      removeReactionFromStore(conversationId, messageId, emoji, userId);
    };

    // Message edited handler
    const handleMessageEdited = ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      updateMessageInStore(conversationId, message);
    };

    // Message deleted handler
    const handleMessageDeleted = ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      deleteMessageInStore(conversationId, messageId);
    };

    // Subscribe to events
    onSocketEvent('chat:newMessage', handleNewMessage);
    onSocketEvent('chat:messagesRead', handleMessagesRead);
    onSocketEvent('chat:typingStart', handleTypingStart);
    onSocketEvent('chat:typingStop', handleTypingStop);
    onSocketEvent('chat:reactionAdded', handleReactionAdded);
    onSocketEvent('chat:reactionRemoved', handleReactionRemoved);
    onSocketEvent('chat:messageEdited', handleMessageEdited);
    onSocketEvent('chat:messageDeleted', handleMessageDeleted);
    onSocketEvent('user:online', handleUserOnline);
    onSocketEvent('user:offline', handleUserOffline);
    onSocketEvent('new_notification', handleNewNotification);

    return () => {
      offSocketEvent('chat:newMessage', handleNewMessage);
      offSocketEvent('chat:messagesRead', handleMessagesRead);
      offSocketEvent('chat:typingStart', handleTypingStart);
      offSocketEvent('chat:typingStop', handleTypingStop);
      offSocketEvent('chat:reactionAdded', handleReactionAdded);
      offSocketEvent('chat:reactionRemoved', handleReactionRemoved);
      offSocketEvent('chat:messageEdited', handleMessageEdited);
      offSocketEvent('chat:messageDeleted', handleMessageDeleted);
      offSocketEvent('user:online', handleUserOnline);
      offSocketEvent('user:offline', handleUserOffline);
      offSocketEvent('new_notification', handleNewNotification);
    };
  }, [
    socket,
    isConnected,
    session,
    activeConversationId,
    addMessage,
    addConversation,
    addNotification,
    addReactionToStore,
    removeReactionFromStore,
    updateMessageInStore,
    deleteMessageInStore,
    setTyping,
    setUserOnline,
    updateConversation,
    incrementUnreadCount,
    markMessagesAsReadByOther,
  ]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
