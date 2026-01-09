import { apiClient } from './client';
import type { ApiResponse, User } from '@/types';

// Upload avatar
export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.patch<ApiResponse<User>>(
    '/media/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

// Delete avatar
export async function deleteAvatar(): Promise<User> {
  const response = await apiClient.delete<ApiResponse<User>>('/media/avatar');
  return response.data.data;
}

// Upload cover
export async function uploadCover(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('cover', file);

  const response = await apiClient.patch<ApiResponse<User>>(
    '/media/cover',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

// Delete cover
export async function deleteCover(): Promise<User> {
  const response = await apiClient.delete<ApiResponse<User>>('/media/cover');
  return response.data.data;
}
