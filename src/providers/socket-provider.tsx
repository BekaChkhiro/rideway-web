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
import { useChatStore } from '@/stores';
import type { Message } from '@/types';

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
  const activeConversationId = useChatStore((state) => state.activeConversationId);

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

  // Handle socket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // New message handler
    const handleNewMessage = ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      addMessage(conversationId, message);

      // Update conversation's last message
      updateConversation(conversationId, {
        lastMessage: message,
        updatedAt: message.createdAt,
      });

      // Increment unread if not in active conversation
      if (conversationId !== activeConversationId) {
        incrementUnreadCount();
      }
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

    // Subscribe to events
    onSocketEvent('chat:newMessage', handleNewMessage);
    onSocketEvent('chat:typingStart', handleTypingStart);
    onSocketEvent('chat:typingStop', handleTypingStop);
    onSocketEvent('user:online', handleUserOnline);
    onSocketEvent('user:offline', handleUserOffline);

    return () => {
      offSocketEvent('chat:newMessage', handleNewMessage);
      offSocketEvent('chat:typingStart', handleTypingStart);
      offSocketEvent('chat:typingStop', handleTypingStop);
      offSocketEvent('user:online', handleUserOnline);
      offSocketEvent('user:offline', handleUserOffline);
    };
  }, [
    socket,
    isConnected,
    activeConversationId,
    addMessage,
    setTyping,
    setUserOnline,
    updateConversation,
    incrementUnreadCount,
  ]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
