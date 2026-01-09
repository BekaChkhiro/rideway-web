import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  UserRole,
  DashboardStats,
  AdminUser,
  AdminUserFilters,
  AdminContentFilters,
  AdminForumFilters,
  BanUserData,
  AdminPost,
  AdminComment,
  AdminListing,
  AdminForumThread,
} from '@/types';

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    '/admin/dashboard'
  );
  return response.data.data;
}

// Users Management
export async function getAdminUsers(
  filters: AdminUserFilters = {}
): Promise<{ users: AdminUser[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<AdminUser[]> & { meta: PaginationMeta }
  >('/admin/users', { params: filters });
  return { users: response.data.data, meta: response.data.meta! };
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const response = await apiClient.get<ApiResponse<AdminUser>>(
    `/admin/users/${userId}`
  );
  return response.data.data;
}

export async function changeUserRole(
  userId: string,
  role: UserRole
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/role`,
    { role }
  );
  return response.data.data;
}

export async function banUser(
  userId: string,
  data: BanUserData
): Promise<AdminUser> {
  const response = await apiClient.post<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/ban`,
    data
  );
  return response.data.data;
}

export async function unbanUser(userId: string): Promise<AdminUser> {
  const response = await apiClient.post<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/unban`
  );
  return response.data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}

// Posts Moderation
export async function getAdminPosts(
  filters: AdminContentFilters = {}
): Promise<{ posts: AdminPost[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<AdminPost[]> & { meta: PaginationMeta }
  >('/admin/posts', { params: filters });
  return { posts: response.data.data, meta: response.data.meta! };
}

export async function deleteAdminPost(postId: string): Promise<void> {
  await apiClient.delete(`/admin/posts/${postId}`);
}

// Comments Moderation
export async function getAdminComments(
  filters: AdminContentFilters = {}
): Promise<{ comments: AdminComment[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<AdminComment[]> & { meta: PaginationMeta }
  >('/admin/comments', { params: filters });
  return { comments: response.data.data, meta: response.data.meta! };
}

export async function deleteAdminComment(commentId: string): Promise<void> {
  await apiClient.delete(`/admin/comments/${commentId}`);
}

// Listings Moderation
export async function getAdminListings(
  filters: AdminContentFilters = {}
): Promise<{ listings: AdminListing[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<AdminListing[]> & { meta: PaginationMeta }
  >('/admin/listings', { params: filters });
  return { listings: response.data.data, meta: response.data.meta! };
}

export async function deleteAdminListing(listingId: string): Promise<void> {
  await apiClient.delete(`/admin/listings/${listingId}`);
}

// Forum Moderation
export async function getAdminForumThreads(
  filters: AdminForumFilters = {}
): Promise<{ threads: AdminForumThread[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<AdminForumThread[]> & { meta: PaginationMeta }
  >('/admin/forum/threads', { params: filters });
  return { threads: response.data.data, meta: response.data.meta! };
}

export async function deleteAdminForumThread(threadId: string): Promise<void> {
  await apiClient.delete(`/admin/forum/threads/${threadId}`);
}

export async function toggleThreadPin(
  threadId: string
): Promise<AdminForumThread> {
  const response = await apiClient.post<ApiResponse<AdminForumThread>>(
    `/admin/forum/threads/${threadId}/pin`
  );
  return response.data.data;
}

export async function toggleThreadLock(
  threadId: string
): Promise<AdminForumThread> {
  const response = await apiClient.post<ApiResponse<AdminForumThread>>(
    `/admin/forum/threads/${threadId}/lock`
  );
  return response.data.data;
}
