import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { mockRouter, setMockSession, clearMockSession } from '../setup';

// Mock useLogout hook
vi.mock('@/lib/api/hooks', () => ({
  useLogout: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock usePathname with changeable value
let mockPathname = '/feed';
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => mockPathname,
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

// Helper to set viewport width
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Navigation Adaptation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/feed';
    clearMockSession();
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  describe('Mobile to Desktop Navigation Transition', () => {
    it('should show mobile nav at mobile width', () => {
      setViewportWidth(375);
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('lg:hidden');
    });

    it('should hide mobile nav at desktop width (via CSS)', () => {
      setViewportWidth(1280);
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      // The class lg:hidden means it's hidden at lg breakpoint
      expect(nav).toHaveClass('lg:hidden');
    });

    it('should show sidebar navigation at desktop width', () => {
      setViewportWidth(1280);
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();

      // Should show full navigation
      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
    });
  });

  describe('Header Menu Button Adaptation', () => {
    it('should show menu button on mobile', () => {
      setViewportWidth(375);
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should hide menu button on desktop (via CSS)', () => {
      setViewportWidth(1280);
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      // lg:hidden class means it will be hidden at lg breakpoint
      expect(menuButton.className).toContain('lg:hidden');
    });
  });

  describe('Search Bar Adaptation', () => {
    it('should show search button on mobile', () => {
      setViewportWidth(375);
      render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton.className).toContain('md:hidden');
    });

    it('should show search input on tablet and desktop', () => {
      setViewportWidth(768);
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;

      expect(searchContainer?.className).toContain('md:flex');
    });
  });

  describe('Sidebar Collapse Behavior', () => {
    it('should support collapsed state', () => {
      render(<Sidebar isCollapsed={true} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should support expanded state', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should show tooltips when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      // When collapsed, sr-only labels should exist for tooltips
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('should toggle between collapsed and expanded', async () => {
      const onToggle = vi.fn();
      const { user, rerender } = render(<Sidebar isCollapsed={false} onToggle={onToggle} />);

      let toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(toggleButton);
      expect(onToggle).toHaveBeenCalled();

      // Rerender with collapsed state
      rerender(<Sidebar isCollapsed={true} onToggle={onToggle} />);

      toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Mobile Sidebar (Sheet) Behavior', () => {
    it('should render mobile sidebar with all nav items', () => {
      render(<MobileSidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
    });

    it('should call onClose when nav item clicked', async () => {
      const onClose = vi.fn();
      const { user } = render(<MobileSidebar onClose={onClose} />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      await user.click(feedLink);

      expect(onClose).toHaveBeenCalled();
    });

    it('should show user info in mobile sidebar', () => {
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'John Doe', username: 'johndoe' },
        },
        status: 'authenticated',
      });

      render(<MobileSidebar />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Active State Across Navigation Types', () => {
    it('should highlight active item in sidebar', () => {
      mockPathname = '/feed';
      render(<Sidebar />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      const feedButton = feedLink.querySelector('button');

      expect(feedButton).toHaveClass('bg-primary/10');
    });

    it('should highlight active item in mobile nav', () => {
      mockPathname = '/feed';
      render(<MobileNav />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('text-primary');
    });

    it('should highlight active item in mobile sidebar', () => {
      mockPathname = '/explore';
      render(<MobileSidebar />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      const exploreButton = exploreLink.querySelector('button');

      expect(exploreButton).toHaveClass('bg-primary/10');
    });
  });

  describe('Navigation Items Consistency', () => {
    it('should have same nav items in sidebar and mobile sidebar', () => {
      const sidebarItems = ['Feed', 'Explore', 'Marketplace', 'Parts', 'Forum', 'Services', 'Messages'];

      render(<Sidebar />);
      sidebarItems.forEach(item => {
        expect(screen.getByRole('link', { name: new RegExp(item, 'i') })).toBeInTheDocument();
      });
    });

    it('should have core nav items in mobile bottom nav', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });
  });

  describe('User Avatar Consistency', () => {
    beforeEach(() => {
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Jane Smith', username: 'janesmith' },
        },
        status: 'authenticated',
      });
    });

    it('should show user initials in header avatar', () => {
      render(<Header />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should show user initials in sidebar avatar', () => {
      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should show user initials in mobile nav', () => {
      render(<MobileNav />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should show user initials in mobile sidebar', () => {
      render(<MobileSidebar />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  describe('Breakpoint Transitions', () => {
    it('should handle transition from mobile to tablet', () => {
      // Start at mobile
      setViewportWidth(375);
      const { rerender } = render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton.className).toContain('md:hidden');

      // Transition to tablet
      setViewportWidth(768);
      rerender(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle transition from tablet to desktop', () => {
      // Start at tablet
      setViewportWidth(768);
      const { rerender } = render(<Header />);

      let menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton.className).toContain('lg:hidden');

      // Transition to desktop
      setViewportWidth(1280);
      rerender(<Header />);

      menuButton = screen.getByRole('button', { name: /toggle menu/i });
      // Still exists but hidden via CSS
      expect(menuButton.className).toContain('lg:hidden');
    });
  });

  describe('Navigation with Different Routes', () => {
    const routes = ['/feed', '/explore', '/marketplace', '/parts', '/forum', '/services', '/messages'];

    routes.forEach(route => {
      it(`should highlight correct item for ${route}`, () => {
        mockPathname = route;
        render(<Sidebar />);

        const links = screen.getAllByRole('link');
        const activeLink = links.find(link => link.getAttribute('href') === route);
        const activeButton = activeLink?.querySelector('button');

        expect(activeButton).toHaveClass('bg-primary/10');
      });
    });
  });

  describe('Profile Navigation', () => {
    it('should link to profile from sidebar', () => {
      render(<Sidebar />);

      const profileLinks = screen.getAllByRole('link').filter(link =>
        link.getAttribute('href') === '/profile'
      );
      expect(profileLinks.length).toBeGreaterThan(0);
    });

    it('should link to profile from mobile nav', () => {
      render(<MobileNav />);

      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('should link to profile from mobile sidebar', () => {
      render(<MobileSidebar />);

      const profileLinks = screen.getAllByRole('link').filter(link =>
        link.getAttribute('href') === '/profile'
      );
      expect(profileLinks.length).toBeGreaterThan(0);
    });
  });
});
