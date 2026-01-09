import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  User,
  UserProfile,
  UserCard,
  UpdateProfileData,
} from '@/types';

// Get user profile by username
export async function getUserByUsername(username: string): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>(
    `/users/${username}`
  );
  return response.data.data;
}

// Update current user profile
export async function updateProfile(data: UpdateProfileData): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
  return response.data.data;
}

// Search users
export async function searchUsers(
  query: string,
  page = 1,
  limit = 20
): Promise<{ users: UserCard[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<UserCard[]> & { meta: PaginationMeta }
  >('/users/search', {
    params: { q: query, page, limit },
  });
  return { users: response.data.data, meta: response.data.meta! };
}

// Get followers
export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: UserCard[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<UserCard[]> & { meta: PaginationMeta }
  >(`/users/${userId}/followers`, {
    params: { page, limit },
  });
  return { users: response.data.data, meta: response.data.meta! };
}

// Get following
export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: UserCard[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<UserCard[]> & { meta: PaginationMeta }
  >(`/users/${userId}/following`, {
    params: { page, limit },
  });
  return { users: response.data.data, meta: response.data.meta! };
}

// Follow user
export async function followUser(userId: string): Promise<void> {
  await apiClient.post(`/users/${userId}/follow`);
}

// Unfollow user
export async function unfollowUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}/follow`);
}

// Block user
export async function blockUser(userId: string): Promise<void> {
  await apiClient.post(`/users/${userId}/block`);
}

// Unblock user
export async function unblockUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}/block`);
}

// Get blocked users
export async function getBlockedUsers(
  page = 1,
  limit = 20
): Promise<{ users: UserCard[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<UserCard[]> & { meta: PaginationMeta }
  >('/users/blocked', {
    params: { page, limit },
  });
  return { users: response.data.data, meta: response.data.meta! };
}
