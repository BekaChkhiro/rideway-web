import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  isCreatePostOpen: boolean;
  isSearchOpen: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (isOpen: boolean) => void;
  openCreatePost: () => void;
  closeCreatePost: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // State
  isSidebarOpen: true,
  isMobileNavOpen: false,
  isCreatePostOpen: false,
  isSearchOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setMobileNavOpen: (isOpen) => set({ isMobileNavOpen: isOpen }),

  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
