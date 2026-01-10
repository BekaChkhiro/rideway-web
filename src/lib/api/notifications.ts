import { apiClient } from './client';
import type { ApiResponse, PaginationMeta, Notification } from '@/types';

// Get notifications
export async function getNotifications(
  page = 1,
  limit = 20
): Promise<{ notifications: Notification[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Notification[]> & { meta: PaginationMeta }
  >('/notifications', {
    params: { page, limit },
  });
  return { notifications: response.data.data, meta: response.data.meta! };
}

// Get unread notifications count
export async function getUnreadNotificationsCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
    '/notifications/unread'
  );
  return response.data.data.unreadCount;
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await apiClient.post(`/notifications/${notificationId}/read`);
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

// Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}
