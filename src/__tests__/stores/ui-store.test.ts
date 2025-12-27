import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      sidebarCollapsed: false,
      sidebarOpen: false,
      mobileMenuOpen: false,
      activeModal: null,
      modalData: null,
      searchOpen: false,
      searchQuery: '',
      notificationsOpen: false,
      createPostOpen: false,
    });
  });

  describe('Sidebar', () => {
    it('should toggle sidebar collapsed state', () => {
      const { toggleSidebar } = useUIStore.getState();

      expect(useUIStore.getState().sidebarCollapsed).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });

    it('should set sidebar collapsed state directly', () => {
      const { setSidebarCollapsed } = useUIStore.getState();

      setSidebarCollapsed(true);
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      setSidebarCollapsed(false);
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);

      setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu', () => {
      const { toggleMobileMenu } = useUIStore.getState();

      expect(useUIStore.getState().mobileMenuOpen).toBe(false);

      toggleMobileMenu();
      expect(useUIStore.getState().mobileMenuOpen).toBe(true);

      toggleMobileMenu();
      expect(useUIStore.getState().mobileMenuOpen).toBe(false);
    });

    it('should set mobile menu open state directly', () => {
      const { setMobileMenuOpen } = useUIStore.getState();

      setMobileMenuOpen(true);
      expect(useUIStore.getState().mobileMenuOpen).toBe(true);

      setMobileMenuOpen(false);
      expect(useUIStore.getState().mobileMenuOpen).toBe(false);
    });
  });

  describe('Modals', () => {
    it('should open modal without data', () => {
      const { openModal } = useUIStore.getState();

      openModal('confirm-delete');

      const state = useUIStore.getState();
      expect(state.activeModal).toBe('confirm-delete');
      expect(state.modalData).toBeUndefined();
    });

    it('should open modal with data', () => {
      const { openModal } = useUIStore.getState();
      const data = { id: '123', name: 'Test Item' };

      openModal('edit-item', data);

      const state = useUIStore.getState();
      expect(state.activeModal).toBe('edit-item');
      expect(state.modalData).toEqual(data);
    });

    it('should close modal and clear data', () => {
      const { openModal, closeModal } = useUIStore.getState();

      openModal('test-modal', { test: 'data' });
      closeModal();

      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.modalData).toBeNull();
    });

    it('should replace current modal with new one', () => {
      const { openModal } = useUIStore.getState();

      openModal('modal-1', { id: 1 });
      expect(useUIStore.getState().activeModal).toBe('modal-1');

      openModal('modal-2', { id: 2 });
      expect(useUIStore.getState().activeModal).toBe('modal-2');
      expect(useUIStore.getState().modalData).toEqual({ id: 2 });
    });
  });

  describe('Search', () => {
    it('should toggle search', () => {
      const { toggleSearch } = useUIStore.getState();

      expect(useUIStore.getState().searchOpen).toBe(false);

      toggleSearch();
      expect(useUIStore.getState().searchOpen).toBe(true);

      toggleSearch();
      expect(useUIStore.getState().searchOpen).toBe(false);
    });

    it('should set search open state', () => {
      const { setSearchOpen } = useUIStore.getState();

      setSearchOpen(true);
      expect(useUIStore.getState().searchOpen).toBe(true);

      setSearchOpen(false);
      expect(useUIStore.getState().searchOpen).toBe(false);
    });

    it('should set search query', () => {
      const { setSearchQuery } = useUIStore.getState();

      setSearchQuery('test query');
      expect(useUIStore.getState().searchQuery).toBe('test query');

      setSearchQuery('');
      expect(useUIStore.getState().searchQuery).toBe('');
    });
  });

  describe('Notifications', () => {
    it('should toggle notifications panel', () => {
      const { toggleNotifications } = useUIStore.getState();

      expect(useUIStore.getState().notificationsOpen).toBe(false);

      toggleNotifications();
      expect(useUIStore.getState().notificationsOpen).toBe(true);

      toggleNotifications();
      expect(useUIStore.getState().notificationsOpen).toBe(false);
    });

    it('should set notifications open state', () => {
      const { setNotificationsOpen } = useUIStore.getState();

      setNotificationsOpen(true);
      expect(useUIStore.getState().notificationsOpen).toBe(true);

      setNotificationsOpen(false);
      expect(useUIStore.getState().notificationsOpen).toBe(false);
    });
  });

  describe('Create Post', () => {
    it('should toggle create post modal', () => {
      const { toggleCreatePost } = useUIStore.getState();

      expect(useUIStore.getState().createPostOpen).toBe(false);

      toggleCreatePost();
      expect(useUIStore.getState().createPostOpen).toBe(true);

      toggleCreatePost();
      expect(useUIStore.getState().createPostOpen).toBe(false);
    });

    it('should set create post open state', () => {
      const { setCreatePostOpen } = useUIStore.getState();

      setCreatePostOpen(true);
      expect(useUIStore.getState().createPostOpen).toBe(true);

      setCreatePostOpen(false);
      expect(useUIStore.getState().createPostOpen).toBe(false);
    });
  });
});
