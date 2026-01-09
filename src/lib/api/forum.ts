import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  ForumCategory,
  ForumThread,
  ThreadReply,
  CreateThreadData,
  UpdateThreadData,
  CreateReplyData,
  ThreadFilters,
} from '@/types';

// ==================== Categories ====================

// Get all forum categories
export async function getForumCategories(): Promise<ForumCategory[]> {
  const response = await apiClient.get<ApiResponse<ForumCategory[]>>(
    '/forum/categories'
  );
  return response.data.data;
}

// ==================== Threads ====================

// Get threads with filters
export async function getThreads(
  filters: ThreadFilters = {},
  page = 1,
  limit = 20
): Promise<{ threads: ForumThread[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<ForumThread[]> & { meta: PaginationMeta }
  >('/forum/threads', {
    params: { ...filters, page, limit },
  });
  return { threads: response.data.data, meta: response.data.meta! };
}

// Get single thread
export async function getThread(threadId: string): Promise<ForumThread> {
  const response = await apiClient.get<ApiResponse<ForumThread>>(
    `/forum/threads/${threadId}`
  );
  return response.data.data;
}

// Create thread
export async function createThread(data: CreateThreadData): Promise<ForumThread> {
  const response = await apiClient.post<ApiResponse<ForumThread>>(
    '/forum/threads',
    data
  );
  return response.data.data;
}

// Update thread
export async function updateThread(
  threadId: string,
  data: UpdateThreadData
): Promise<ForumThread> {
  const response = await apiClient.patch<ApiResponse<ForumThread>>(
    `/forum/threads/${threadId}`,
    data
  );
  return response.data.data;
}

// Delete thread
export async function deleteThread(threadId: string): Promise<void> {
  await apiClient.delete(`/forum/threads/${threadId}`);
}

// Toggle like on thread
export async function toggleThreadLike(
  threadId: string
): Promise<{ isLiked: boolean; likesCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ isLiked: boolean; likesCount: number }>
  >(`/forum/threads/${threadId}/like`);
  return response.data.data;
}

// ==================== Replies ====================

// Get replies for thread
export async function getThreadReplies(
  threadId: string,
  page = 1,
  limit = 20
): Promise<{ replies: ThreadReply[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<ThreadReply[]> & { meta: PaginationMeta }
  >(`/forum/threads/${threadId}/replies`, {
    params: { page, limit },
  });
  return { replies: response.data.data, meta: response.data.meta! };
}

// Create reply
export async function createReply(
  threadId: string,
  data: CreateReplyData
): Promise<ThreadReply> {
  const response = await apiClient.post<ApiResponse<ThreadReply>>(
    `/forum/threads/${threadId}/replies`,
    data
  );
  return response.data.data;
}

// Update reply
export async function updateReply(
  replyId: string,
  content: string
): Promise<ThreadReply> {
  const response = await apiClient.patch<ApiResponse<ThreadReply>>(
    `/forum/replies/${replyId}`,
    { content }
  );
  return response.data.data;
}

// Delete reply
export async function deleteReply(replyId: string): Promise<void> {
  await apiClient.delete(`/forum/replies/${replyId}`);
}

// Toggle like on reply
export async function toggleReplyLike(
  replyId: string
): Promise<{ isLiked: boolean; likesCount: number }> {
  const response = await apiClient.post<
    ApiResponse<{ isLiked: boolean; likesCount: number }>
  >(`/forum/replies/${replyId}/like`);
  return response.data.data;
}
