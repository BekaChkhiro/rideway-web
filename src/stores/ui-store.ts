import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Modals
  activeModal: string | null;
  modalData: unknown;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  // Search
  searchOpen: boolean;
  searchQuery: string;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;

  // Notifications panel
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;

  // Create post modal
  createPostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;
  toggleCreatePost: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      sidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      // Modals
      activeModal: null,
      modalData: null,
      openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Search
      searchOpen: false,
      searchQuery: '',
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

      // Notifications panel
      notificationsOpen: false,
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      toggleNotifications: () =>
        set((state) => ({ notificationsOpen: !state.notificationsOpen })),

      // Create post modal
      createPostOpen: false,
      setCreatePostOpen: (open) => set({ createPostOpen: open }),
      toggleCreatePost: () =>
        set((state) => ({ createPostOpen: !state.createPostOpen })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
