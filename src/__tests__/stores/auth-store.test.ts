import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';

describe('useAuthStore', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    image: 'https://example.com/avatar.jpg',
    isVerified: true,
  };

  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user and update authentication state', () => {
      const { setUser } = useAuthStore.getState();

      setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set isAuthenticated to false when user is null', () => {
      const { setUser } = useAuthStore.getState();

      // First set a user
      setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then set to null
      setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user and reset state', () => {
      const { setUser, logout } = useAuthStore.getState();

      // First authenticate
      setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user data partially', () => {
      const { setUser, updateUser } = useAuthStore.getState();

      setUser(mockUser);
      updateUser({ name: 'Updated Name', image: 'https://new-image.com/avatar.jpg' });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.image).toBe('https://new-image.com/avatar.jpg');
      expect(state.user?.email).toBe(mockUser.email); // unchanged
      expect(state.user?.id).toBe(mockUser.id); // unchanged
    });

    it('should not update if user is null', () => {
      const { updateUser } = useAuthStore.getState();

      updateUser({ name: 'Updated Name' });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should update isVerified status', () => {
      const { setUser, updateUser } = useAuthStore.getState();

      setUser({ ...mockUser, isVerified: false });
      expect(useAuthStore.getState().user?.isVerified).toBe(false);

      updateUser({ isVerified: true });
      expect(useAuthStore.getState().user?.isVerified).toBe(true);
    });
  });
});
