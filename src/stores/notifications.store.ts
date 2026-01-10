import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationsState {
  // Notifications list
  notifications: Notification[];
  unreadCount: number;
  isLoaded: boolean;

  // Loading states
  isLoading: boolean;
}

interface NotificationsActions {
  // Notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;

  // Counts
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: (by?: number) => void;
  decrementUnreadCount: (by?: number) => void;

  // Loading
  setLoading: (isLoading: boolean) => void;
  setLoaded: (isLoaded: boolean) => void;

  // Reset
  reset: () => void;
}

type NotificationsStore = NotificationsState & NotificationsActions;

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoaded: false,
  isLoading: false,
};

export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  ...initialState,

  // Notifications
  setNotifications: (notifications) =>
    set({ notifications, isLoaded: true }),

  addNotification: (notification) =>
    set((state) => {
      // Check if notification already exists
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) {
        return state;
      }
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      if (!notification || notification.isRead) {
        return state;
      }
      return {
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: notification && !notification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),

  // Counts
  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: (by = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + by })),

  decrementUnreadCount: (by = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

  // Loading
  setLoading: (isLoading) => set({ isLoading }),
  setLoaded: (isLoaded) => set({ isLoaded }),

  // Reset
  reset: () => set(initialState),
}));
