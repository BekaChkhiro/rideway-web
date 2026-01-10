// Chat Types

import type { UserCard } from './user';

export interface Conversation {
  id: string;
  participant: UserCard;
  lastMessage: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ReplyInfo {
  id: string;
  content: string;
  senderId: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface MessageImage {
  id: string;
  url: string;
  order: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  isDeleted: boolean;
  editedAt: string | null;
  replyTo: ReplyInfo | null;
  reactions: MessageReaction[];
  images: MessageImage[];
  createdAt: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  replyToId?: string;
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
  title: string;
  body: string;
  isRead: boolean;
  data: Record<string, string> | null;
  actor?: UserCard | null;
  createdAt: string;
}
