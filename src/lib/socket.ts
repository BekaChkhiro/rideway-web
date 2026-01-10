import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api/client';
import type { Message, Notification } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

// Socket instance
let socket: Socket | null = null;

// Event types
export interface SocketEvents {
  // Server → Client
  'chat:newMessage': (data: { conversationId: string; message: Message }) => void;
  'chat:typingStart': (data: { conversationId: string; userId: string }) => void;
  'chat:typingStop': (data: { conversationId: string; userId: string }) => void;
  'chat:messagesRead': (data: { conversationId: string; readBy: string }) => void;
  'chat:reactionAdded': (data: { conversationId: string; messageId: string; emoji: string; userId: string }) => void;
  'chat:reactionRemoved': (data: { conversationId: string; messageId: string; emoji: string; userId: string }) => void;
  'chat:messageEdited': (data: { conversationId: string; message: Message }) => void;
  'chat:messageDeleted': (data: { conversationId: string; messageId: string }) => void;
  'user:online': (data: { userId: string }) => void;
  'user:offline': (data: { userId: string }) => void;
  'new_notification': (data: { notification: Notification }) => void;
}

export interface SocketEmitEvents {
  // Client → Server
  'chat:join': (conversationId: string, callback?: (response: { success: boolean }) => void) => void;
  'chat:leave': (conversationId: string, callback?: (response: { success: boolean }) => void) => void;
  'chat:sendMessage': (
    data: { conversationId: string; content: string; replyToId?: string; imageUrls?: string[] },
    callback?: (response: { success: boolean; message?: Message }) => void
  ) => void;
  'chat:typing': (conversationId: string) => void;
  'chat:stopTyping': (conversationId: string) => void;
  'chat:markRead': (conversationId: string, callback?: (response: { success: boolean }) => void) => void;
  'chat:addReaction': (
    data: { conversationId: string; messageId: string; emoji: string },
    callback?: (response: { success: boolean }) => void
  ) => void;
  'chat:removeReaction': (
    data: { conversationId: string; messageId: string; emoji: string },
    callback?: (response: { success: boolean }) => void
  ) => void;
  'chat:editMessage': (
    data: { conversationId: string; messageId: string; content: string; removedImageIds?: string[]; newImageUrls?: string[] },
    callback?: (response: { success: boolean; message?: Message }) => void
  ) => void;
  'chat:deleteMessage': (
    data: { conversationId: string; messageId: string },
    callback?: (response: { success: boolean }) => void
  ) => void;
  'users:getOnline': (
    userIds: string[],
    callback: (response: { success: boolean; onlineUsers?: string[] }) => void
  ) => void;
}

// Get or create socket connection
export function getSocket(): Socket | null {
  return socket;
}

// Connect to socket server
export function connectSocket(): Socket | null {
  const token = getAccessToken();

  if (!token) {
    console.warn('Cannot connect socket: No access token');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Reconnect with new token (after token refresh)
export function reconnectSocket(): Socket | null {
  disconnectSocket();
  return connectSocket();
}

// Join conversation room
export function joinConversation(conversationId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit('chat:join', conversationId, (response: { success: boolean }) => {
      resolve(response.success);
    });
  });
}

// Leave conversation room
export function leaveConversation(conversationId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit('chat:leave', conversationId, (response: { success: boolean }) => {
      resolve(response.success);
    });
  });
}

// Send message via socket
export function sendSocketMessage(
  conversationId: string,
  content: string,
  replyToId?: string,
  imageUrls?: string[]
): Promise<{ success: boolean; message?: Message }> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false });
      return;
    }
    socket.emit(
      'chat:sendMessage',
      { conversationId, content, replyToId, imageUrls },
      (response: { success: boolean; message?: Message }) => {
        resolve(response);
      }
    );
  });
}

// Start typing indicator
export function startTyping(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('chat:typing', conversationId);
  }
}

// Stop typing indicator
export function stopTyping(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('chat:stopTyping', conversationId);
  }
}

// Mark messages as read
export function markMessagesRead(conversationId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit('chat:markRead', conversationId, (response: { success: boolean }) => {
      resolve(response.success);
    });
  });
}

// Get online users
export function getOnlineUsers(userIds: string[]): Promise<string[]> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve([]);
      return;
    }
    socket.emit(
      'users:getOnline',
      userIds,
      (response: { success: boolean; onlineUsers?: string[] }) => {
        resolve(response.onlineUsers || []);
      }
    );
  });
}

// Add reaction to message
export function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit(
      'chat:addReaction',
      { conversationId, messageId, emoji },
      (response: { success: boolean }) => {
        resolve(response.success);
      }
    );
  });
}

// Remove reaction from message
export function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit(
      'chat:removeReaction',
      { conversationId, messageId, emoji },
      (response: { success: boolean }) => {
        resolve(response.success);
      }
    );
  });
}

// Edit message
export function editMessage(
  conversationId: string,
  messageId: string,
  content: string,
  removedImageIds?: string[],
  newImageUrls?: string[]
): Promise<{ success: boolean; message?: Message }> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve({ success: false });
      return;
    }
    socket.emit(
      'chat:editMessage',
      { conversationId, messageId, content, removedImageIds, newImageUrls },
      (response: { success: boolean; message?: Message }) => {
        resolve(response);
      }
    );
  });
}

// Delete message
export function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve(false);
      return;
    }
    socket.emit(
      'chat:deleteMessage',
      { conversationId, messageId },
      (response: { success: boolean }) => {
        resolve(response.success);
      }
    );
  });
}

// Subscribe to socket events
export function onSocketEvent<K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
): void {
  if (socket) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event, callback as any);
  }
}

// Unsubscribe from socket events
export function offSocketEvent<K extends keyof SocketEvents>(
  event: K,
  callback?: SocketEvents[K]
): void {
  if (socket) {
    if (callback) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event, callback as any);
    } else {
      socket.off(event);
    }
  }
}

export default socket;
