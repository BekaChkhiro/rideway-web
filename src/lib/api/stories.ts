import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  Story,
  StoryGroup,
  CreateStoryData,
  UserCard,
} from '@/types';

// Get stories feed (grouped by user)
export async function getStoriesFeed(): Promise<StoryGroup[]> {
  const response = await apiClient.get<ApiResponse<StoryGroup[]>>('/stories');
  return response.data.data;
}

// Get my active stories
export async function getMyStories(): Promise<Story[]> {
  const response = await apiClient.get<ApiResponse<Story[]>>('/stories/me');
  return response.data.data;
}

// Get stories by user
export async function getUserStories(userId: string): Promise<Story[]> {
  const response = await apiClient.get<ApiResponse<Story[]>>(
    `/stories/user/${userId}`
  );
  return response.data.data;
}

// Get single story
export async function getStory(storyId: string): Promise<Story> {
  const response = await apiClient.get<ApiResponse<Story>>(
    `/stories/${storyId}`
  );
  return response.data.data;
}

// Create story
export async function createStory(data: CreateStoryData): Promise<Story> {
  const formData = new FormData();
  formData.append('media', data.media);

  const response = await apiClient.post<ApiResponse<Story>>(
    '/stories',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

// Mark story as viewed
export async function viewStory(storyId: string): Promise<void> {
  await apiClient.post(`/stories/${storyId}/view`);
}

// Get story viewers (only for own stories)
export async function getStoryViewers(
  storyId: string,
  page = 1,
  limit = 50
): Promise<{ viewers: UserCard[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<UserCard[]> & { meta: PaginationMeta }
  >(`/stories/${storyId}/viewers`, {
    params: { page, limit },
  });
  return { viewers: response.data.data, meta: response.data.meta! };
}

// Delete story
export async function deleteStory(storyId: string): Promise<void> {
  await apiClient.delete(`/stories/${storyId}`);
}
