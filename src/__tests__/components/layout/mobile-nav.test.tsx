import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { MobileNav } from '@/components/layout/mobile-nav';
import { setMockSession, clearMockSession } from '../../setup';

// Mock usePathname
let mockPathname = '/feed';
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => mockPathname,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
  };
});

describe('MobileNav Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/feed';
    clearMockSession();
  });

  describe('Rendering', () => {
    it('should render all navigation items', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      // Create link doesn't have text, just icon - find by href
      expect(document.querySelector('a[href="/create"]')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should render navigation links with correct hrefs', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/feed');
      expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '/explore');
      expect(document.querySelector('a[href="/create"]')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/messages');
      expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
    });

    it('should have fixed positioning at bottom', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
    });

    it('should be hidden on large screens', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('lg:hidden');
    });
  });

  describe('Navigation Labels', () => {
    it('should display all navigation labels', () => {
      render(<MobileNav />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should highlight feed as active when on /feed', () => {
      mockPathname = '/feed';
      render(<MobileNav />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('text-primary');
    });

    it('should highlight explore as active when on /explore', () => {
      mockPathname = '/explore';
      render(<MobileNav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      expect(exploreLink).toHaveClass('text-primary');
    });

    it('should highlight messages as active when on /messages', () => {
      mockPathname = '/messages';
      render(<MobileNav />);

      const messagesLink = screen.getByRole('link', { name: /messages/i });
      expect(messagesLink).toHaveClass('text-primary');
    });

    it('should highlight profile as active when on /profile', () => {
      mockPathname = '/profile';
      render(<MobileNav />);

      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toHaveClass('text-primary');
    });

    it('should highlight nested routes as active', () => {
      mockPathname = '/messages/123';
      render(<MobileNav />);

      const messagesLink = screen.getByRole('link', { name: /messages/i });
      expect(messagesLink).toHaveClass('text-primary');
    });

    it('should not highlight inactive items', () => {
      mockPathname = '/feed';
      render(<MobileNav />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      expect(exploreLink).not.toHaveClass('text-primary');
    });
  });

  describe('Create Button', () => {
    it('should have special styling for create button', () => {
      render(<MobileNav />);

      const createLink = document.querySelector('a[href="/create"]');
      const createButton = createLink?.querySelector('div');

      expect(createButton).toHaveClass('bg-primary');
      expect(createButton).toHaveClass('rounded-full');
    });
  });

  describe('Profile Avatar', () => {
    it('should display user initials in profile avatar', () => {
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'John Doe', username: 'johndoe' },
        },
        status: 'authenticated',
      });

      render(<MobileNav />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display default initial when no user name', () => {
      clearMockSession();
      render(<MobileNav />);

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should have ring styling when profile is active', () => {
      mockPathname = '/profile';
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Jane Doe', username: 'janedoe' },
        },
        status: 'authenticated',
      });

      render(<MobileNav />);

      // Find the avatar with ring styling
      const profileLink = screen.getByRole('link', { name: /profile/i });
      const avatar = profileLink.querySelector('[class*="ring-primary"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      render(<MobileNav className="custom-class" />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });

    it('should have backdrop blur effect', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('backdrop-blur');
    });

    it('should have z-index for overlay', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('z-50');
    });
  });

  describe('Safe Area', () => {
    it('should include safe area padding for iOS', () => {
      render(<MobileNav />);

      const safeArea = document.querySelector('.h-safe-area-inset-bottom');
      expect(safeArea).toBeInTheDocument();
    });
  });
});
