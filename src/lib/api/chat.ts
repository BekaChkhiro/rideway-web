import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  Conversation,
  Message,
  CreateConversationData,
} from '@/types';

// ==================== Conversations ====================

// Get all conversations
export async function getConversations(
  page = 1,
  limit = 20
): Promise<{ conversations: Conversation[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Conversation[]> & { meta: PaginationMeta }
  >('/chat/conversations', {
    params: { page, limit },
  });
  return { conversations: response.data.data, meta: response.data.meta! };
}

// Get or create conversation with user
export async function getOrCreateConversation(
  data: CreateConversationData
): Promise<Conversation> {
  const response = await apiClient.post<ApiResponse<Conversation>>(
    '/chat/conversations',
    data
  );
  return response.data.data;
}

// Get unread messages count
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    '/chat/unread'
  );
  return response.data.data.count;
}

// ==================== Messages ====================

// Get messages for conversation
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<{ messages: Message[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Message[]> & { meta: PaginationMeta }
  >(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
  return { messages: response.data.data, meta: response.data.meta! };
}

// Send message
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  const response = await apiClient.post<ApiResponse<Message>>(
    `/chat/conversations/${conversationId}/messages`,
    { content }
  );
  return response.data.data;
}

// Mark conversation as read
export async function markAsRead(conversationId: string): Promise<void> {
  await apiClient.post(`/chat/conversations/${conversationId}/read`);
}
