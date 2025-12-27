import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
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

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/feed';
    clearMockSession();
  });

  describe('Rendering', () => {
    it('should render all navigation items', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /parts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /forum/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
    });

    it('should render navigation links with correct hrefs', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/feed');
      expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '/explore');
      expect(screen.getByRole('link', { name: /marketplace/i })).toHaveAttribute('href', '/marketplace');
      expect(screen.getByRole('link', { name: /parts/i })).toHaveAttribute('href', '/parts');
      expect(screen.getByRole('link', { name: /forum/i })).toHaveAttribute('href', '/forum');
      expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '/services');
      expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/messages');
    });

    it('should render profile link', () => {
      render(<Sidebar />);

      const profileLinks = screen.getAllByRole('link').filter(link =>
        link.getAttribute('href') === '/profile'
      );
      expect(profileLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Active State', () => {
    it('should highlight active navigation item', () => {
      mockPathname = '/feed';
      render(<Sidebar />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      const feedButton = feedLink.querySelector('button');

      // Active button should have different styling
      expect(feedButton).toHaveClass('bg-primary/10');
    });

    it('should highlight nested routes as active', () => {
      mockPathname = '/feed/123';
      render(<Sidebar />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      const feedButton = feedLink.querySelector('button');

      expect(feedButton).toHaveClass('bg-primary/10');
    });

    it('should not highlight inactive items', () => {
      mockPathname = '/feed';
      render(<Sidebar />);

      const exploreLink = screen.getByRole('link', { name: /explore/i });
      const exploreButton = exploreLink.querySelector('button');

      expect(exploreButton).not.toHaveClass('bg-primary/10');
    });
  });

  describe('Collapsed State', () => {
    it('should have full width when not collapsed', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should have narrow width when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should show labels when expanded', () => {
      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('Feed')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
    });

    it('should hide labels but keep sr-only text when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      // Labels should be sr-only when collapsed
      const srOnlyLabels = document.querySelectorAll('.sr-only');
      expect(srOnlyLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Toggle Button', () => {
    it('should render toggle button when onToggle is provided', () => {
      const onToggle = vi.fn();
      render(<Sidebar onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', { name: /expand sidebar|collapse sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should not render toggle button when onToggle is not provided', () => {
      render(<Sidebar />);

      const toggleButton = screen.queryByRole('button', { name: /expand sidebar|collapse sidebar/i });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('should call onToggle when toggle button is clicked', async () => {
      const onToggle = vi.fn();
      const { user } = render(<Sidebar onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should show expand icon when collapsed', () => {
      render(<Sidebar isCollapsed={true} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show collapse icon when expanded', () => {
      render(<Sidebar isCollapsed={false} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('User Section', () => {
    it('should display user initials in avatar', () => {
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'John Doe', username: 'johndoe' },
        },
        status: 'authenticated',
      });

      render(<Sidebar />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display default initial when no user name', () => {
      clearMockSession();
      render(<Sidebar />);

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should show "View profile" text when expanded', () => {
      setMockSession({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'John Doe', username: 'johndoe' },
        },
        status: 'authenticated',
      });

      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('View profile')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      render(<Sidebar className="custom-class" />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('custom-class');
    });
  });
});

describe('MobileSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/feed';
    clearMockSession();
  });

  describe('Rendering', () => {
    it('should render all navigation items', () => {
      render(<MobileSidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
    });

    it('should render user section at top', () => {
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

  describe('Closing Behavior', () => {
    it('should call onClose when navigation item is clicked', async () => {
      const onClose = vi.fn();
      const { user } = render(<MobileSidebar onClose={onClose} />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      await user.click(feedLink);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when profile is clicked', async () => {
      const onClose = vi.fn();
      const { user } = render(<MobileSidebar onClose={onClose} />);

      const profileLinks = screen.getAllByRole('link').filter(link =>
        link.getAttribute('href') === '/profile'
      );

      const firstProfileLink = profileLinks[0];
      if (firstProfileLink) {
        await user.click(firstProfileLink);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });
});
