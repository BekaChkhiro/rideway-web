import { create } from 'zustand';
import type { Conversation, Message } from '@/types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Messages (keyed by conversationId)
  messages: Record<string, Message[]>;

  // Reply state (keyed by conversationId)
  replyingTo: Record<string, Message | null>;

  // Edit state (keyed by conversationId)
  editingMessage: Record<string, Message | null>;

  // Real-time state
  typingUsers: Record<string, string[]>; // conversationId -> userIds who are typing
  onlineUsers: Set<string>;

  // Counts
  unreadCount: number;
  isUnreadCountLoaded: boolean;

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
  updateMessage: (conversationId: string, message: Message) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;

  // Reply
  setReplyTo: (conversationId: string, message: Message | null) => void;
  clearReplyTo: (conversationId: string) => void;

  // Edit
  setEditingMessage: (conversationId: string, message: Message | null) => void;
  clearEditingMessage: (conversationId: string) => void;

  // Reactions
  addReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void;
  removeReaction: (conversationId: string, messageId: string, emoji: string, userId: string) => void;

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
  markMessagesAsReadByOther: (conversationId: string) => void;

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
  replyingTo: {},
  editingMessage: {},
  typingUsers: {},
  onlineUsers: new Set(),
  unreadCount: 0,
  isUnreadCountLoaded: false,
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
    set((state) => {
      const updatedConversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...data } : c
      );
      // Sort by updatedAt (newest first)
      updatedConversations.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return { conversations: updatedConversations };
    }),

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

  updateMessage: (conversationId, message) =>
    set((state) => {
      const messages = state.messages[conversationId];
      if (!messages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: messages.map((m) =>
            m.id === message.id ? message : m
          ),
        },
      };
    }),

  deleteMessage: (conversationId, messageId) =>
    set((state) => {
      const messages = state.messages[conversationId];
      if (!messages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: messages.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: '' }
              : m
          ),
        },
      };
    }),

  // Reply
  setReplyTo: (conversationId, message) =>
    set((state) => ({
      replyingTo: { ...state.replyingTo, [conversationId]: message },
    })),

  clearReplyTo: (conversationId) =>
    set((state) => ({
      replyingTo: { ...state.replyingTo, [conversationId]: null },
    })),

  // Edit
  setEditingMessage: (conversationId, message) =>
    set((state) => ({
      editingMessage: { ...state.editingMessage, [conversationId]: message },
      // Clear reply when editing
      replyingTo: { ...state.replyingTo, [conversationId]: null },
    })),

  clearEditingMessage: (conversationId) =>
    set((state) => ({
      editingMessage: { ...state.editingMessage, [conversationId]: null },
    })),

  // Reactions
  addReaction: (conversationId, messageId, emoji, userId) =>
    set((state) => {
      const messages = state.messages[conversationId];
      if (!messages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: messages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
            if (existingReaction) {
              // Update existing reaction
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, hasReacted: userId === userId || r.hasReacted }
                    : r
                ),
              };
            } else {
              // Add new reaction
              return {
                ...msg,
                reactions: [...msg.reactions, { emoji, count: 1, hasReacted: true }],
              };
            }
          }),
        },
      };
    }),

  removeReaction: (conversationId, messageId, emoji, _userId) =>
    set((state) => {
      const messages = state.messages[conversationId];
      if (!messages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: messages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
            if (!existingReaction) return msg;

            if (existingReaction.count <= 1) {
              // Remove the reaction entirely
              return {
                ...msg,
                reactions: msg.reactions.filter((r) => r.emoji !== emoji),
              };
            } else {
              // Decrement count
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count - 1, hasReacted: false }
                    : r
                ),
              };
            }
          }),
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
  setUnreadCount: (count) => set({ unreadCount: count, isUnreadCountLoaded: true }),

  decrementUnreadCount: (by = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - by),
      isUnreadCountLoaded: true,
    })),

  incrementUnreadCount: (by = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + by, isUnreadCountLoaded: true })),

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

  // Mark messages as read by the other user (for read receipts)
  markMessagesAsReadByOther: (conversationId) =>
    set((state) => {
      const messages = state.messages[conversationId];
      if (!messages) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: messages.map((m) => ({ ...m, isRead: true })),
        },
      };
    }),

  // Loading states
  setLoadingConversations: (isLoading) =>
    set({ isLoadingConversations: isLoading }),

  setLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

  // Reset
  reset: () => set(initialState),
}));

// Stable empty array references for selectors
const EMPTY_MESSAGES: Message[] = [];
const EMPTY_TYPING_USERS: string[] = [];

// Selectors
export const selectActiveConversation = (state: ChatStore) =>
  state.conversations.find((c) => c.id === state.activeConversationId);

export const selectActiveMessages = (state: ChatStore) =>
  state.activeConversationId
    ? state.messages[state.activeConversationId] ?? EMPTY_MESSAGES
    : EMPTY_MESSAGES;

export const selectTypingInConversation = (
  state: ChatStore,
  conversationId: string
) => state.typingUsers[conversationId] ?? EMPTY_TYPING_USERS;

export const selectIsUserOnline = (state: ChatStore, userId: string) =>
  state.onlineUsers.has(userId);
