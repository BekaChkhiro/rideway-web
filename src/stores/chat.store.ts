import { create } from 'zustand';
import type { Conversation, Message } from '@/types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Messages (keyed by conversationId)
  messages: Record<string, Message[]>;

  // Real-time state
  typingUsers: Record<string, string[]>; // conversationId -> userIds who are typing
  onlineUsers: Set<string>;

  // Counts
  unreadCount: number;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
}

interface ChatActions {
  // Conversations
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, data: Partial<Conversation>) => void;
  setActiveConversation: (conversationId: string | null) => void;

  // Messages
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;

  // Real-time
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;

  // Counts
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  incrementUnreadCount: (by?: number) => void;

  // Mark as read
  markConversationAsRead: (conversationId: string) => void;

  // Loading states
  setLoadingConversations: (isLoading: boolean) => void;
  setLoadingMessages: (isLoading: boolean) => void;

  // Reset
  reset: () => void;
}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  unreadCount: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
};

export const useChatStore = create<ChatStore>()((set) => ({
  ...initialState,

  // Conversations
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => {
      // Check if conversation already exists
      const exists = state.conversations.some((c) => c.id === conversation.id);
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c.id === conversation.id ? conversation : c
          ),
        };
      }
      return { conversations: [conversation, ...state.conversations] };
    }),

  updateConversation: (conversationId, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...data } : c
      ),
    })),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  // Messages
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      // Avoid duplicates
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
      };
    }),

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      // Filter out duplicates
      const newMessages = messages.filter(
        (m) => !existingMessages.some((em) => em.id === m.id)
      );
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...newMessages, ...existingMessages],
        },
      };
    }),

  // Real-time
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] || [];
      let newTyping: string[];

      if (isTyping) {
        if (!currentTyping.includes(userId)) {
          newTyping = [...currentTyping, userId];
        } else {
          return state;
        }
      } else {
        newTyping = currentTyping.filter((id) => id !== userId);
      }

      return {
        typingUsers: { ...state.typingUsers, [conversationId]: newTyping },
      };
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    }),

  setOnlineUsers: (userIds) =>
    set({ onlineUsers: new Set(userIds) }),

  // Counts
  setUnreadCount: (count) => set({ unreadCount: count }),

  decrementUnreadCount: (by = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - by),
    })),

  incrementUnreadCount: (by = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + by })),

  // Mark as read
  markConversationAsRead: (conversationId) =>
    set((state) => {
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (!conversation || conversation.unreadCount === 0) {
        return state;
      }

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
        unreadCount: Math.max(0, state.unreadCount - conversation.unreadCount),
      };
    }),

  // Loading states
  setLoadingConversations: (isLoading) =>
    set({ isLoadingConversations: isLoading }),

  setLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

  // Reset
  reset: () => set(initialState),
}));

// Selectors
export const selectActiveConversation = (state: ChatStore) =>
  state.conversations.find((c) => c.id === state.activeConversationId);

export const selectActiveMessages = (state: ChatStore) =>
  state.activeConversationId
    ? state.messages[state.activeConversationId] || []
    : [];

export const selectTypingInConversation = (
  state: ChatStore,
  conversationId: string
) => state.typingUsers[conversationId] || [];

export const selectIsUserOnline = (state: ChatStore, userId: string) =>
  state.onlineUsers.has(userId);
