// Chat Types

import type { UserCard } from './user';

export interface Conversation {
  id: string;
  participant: UserCard;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
}

export interface CreateConversationData {
  participantId: string;
}

// Notification Types

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'COMMENT_REPLY'
  | 'NEW_MESSAGE'
  | 'THREAD_REPLY'
  | 'LISTING_INQUIRY'
  | 'SERVICE_REVIEW'
  | 'STORY_VIEW';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  data: Record<string, string> | null;
  actor: UserCard | null;
  createdAt: string;
}
