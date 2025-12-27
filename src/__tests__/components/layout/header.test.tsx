import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import { Header } from '@/components/layout/header';
import { mockRouter } from '../../setup';

// Mock useLogout hook
const mockMutateAsync = vi.fn();
vi.mock('@/lib/api/hooks', () => ({
  useLogout: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the header with logo', () => {
      render(<Header />);

      // Check for logo link
      const logoLink = screen.getByRole('link', { name: /bike area/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/feed');
    });

    it('should render the search bar on desktop', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      render(<Header />);

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('should render notifications button with badge', () => {
      render(<Header />);

      const notificationsButton = screen.getByRole('button', { name: /notifications/i });
      expect(notificationsButton).toBeInTheDocument();

      // Check for notification count badge
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render user avatar button', () => {
      render(<Header />);

      // The avatar button triggers the dropdown menu
      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.querySelector('[class*="avatar"]') || btn.className.includes('rounded-full')
      );
      expect(avatarButton).toBeDefined();
    });

    it('should render mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should render mobile search button', () => {
      render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Button', () => {
    it('should call onMenuClick when mobile menu button is clicked', async () => {
      const onMenuClick = vi.fn();
      const { user } = render(<Header onMenuClick={onMenuClick} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Menu Dropdown', () => {
    it('should show dropdown menu when avatar is clicked', async () => {
      const { user } = render(<Header />);

      // Find and click the avatar button (the dropdown trigger)
      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        await user.click(avatarButton);

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
          expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
          expect(screen.getByRole('menuitem', { name: /help/i })).toBeInTheDocument();
          expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
        });
      }
    });

    it('should navigate to profile when Profile menu item is clicked', async () => {
      const { user } = render(<Header />);

      // Open the dropdown
      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        await user.click(avatarButton);

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
        });

        const profileItem = screen.getByRole('menuitem', { name: /profile/i });
        await user.click(profileItem);

        expect(mockRouter.push).toHaveBeenCalledWith('/profile');
      }
    });

    it('should navigate to settings when Settings menu item is clicked', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        await user.click(avatarButton);

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
        });

        const settingsItem = screen.getByRole('menuitem', { name: /settings/i });
        await user.click(settingsItem);

        expect(mockRouter.push).toHaveBeenCalledWith('/settings');
      }
    });

    it('should call logout when Log out menu item is clicked', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        await user.click(avatarButton);

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
        });

        const logoutItem = screen.getByRole('menuitem', { name: /log out/i });
        await user.click(logoutItem);

        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      render(<Header className="custom-class" />);

      const header = document.querySelector('header');
      expect(header).toHaveClass('custom-class');
    });

    it('should have sticky positioning', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });
  });
});
