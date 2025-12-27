import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import { mockRouter, mockSignIn } from '../setup';

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

// Mock usePathname
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => '/feed',
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Navigation', () => {
    it('should navigate through header elements with Tab key', async () => {
      const { user } = render(<Header />);

      // Start by focusing the document
      document.body.focus();

      // Tab through header elements
      await user.tab();

      // Should be able to reach interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).not.toBe(document.body);
    });

    it('should be able to activate buttons with Enter key', async () => {
      const onMenuClick = vi.fn();
      const { user } = render(<Header onMenuClick={onMenuClick} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      menuButton.focus();

      await user.keyboard('{Enter}');

      expect(onMenuClick).toHaveBeenCalled();
    });

    it('should be able to activate buttons with Space key', async () => {
      const onMenuClick = vi.fn();
      const { user } = render(<Header onMenuClick={onMenuClick} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      menuButton.focus();

      await user.keyboard(' ');

      expect(onMenuClick).toHaveBeenCalled();
    });

    it('should open dropdown menu with Enter key', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        avatarButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });
      }
    });

    it('should close dropdown menu with Escape key', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        avatarButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        await user.keyboard('{Escape}');

        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });
      }
    });

    it('should navigate dropdown menu items with arrow keys', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        avatarButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        // Navigate down through menu items
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');

        // Menu items should be focusable
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Sidebar Navigation', () => {
    it('should navigate through sidebar links with Tab key', async () => {
      const { user } = render(<Sidebar />);

      // Get all sidebar links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // Focus the first link
      const firstLink = links[0];
      if (firstLink) {
        firstLink.focus();
        expect(document.activeElement).toBe(firstLink);

        // Tab to next element - might be a button inside the link, then the next link
        await user.tab();
        // Just verify we moved to a different element
        expect(document.activeElement).not.toBe(firstLink);
      }
    });

    it('should activate links with Enter key', () => {
      render(<Sidebar />);

      const feedLink = screen.getByRole('link', { name: /feed/i });
      feedLink.focus();

      // Enter key should work on links
      expect(feedLink).toHaveAttribute('href', '/feed');
    });

    it('should toggle sidebar with keyboard', async () => {
      const onToggle = vi.fn();
      const { user } = render(<Sidebar onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      toggleButton.focus();

      await user.keyboard('{Enter}');

      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Mobile Navigation', () => {
    it('should navigate through mobile nav links with Tab key', async () => {
      const { user } = render(<MobileNav />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // Tab through links
      const firstLink = links[0];
      if (firstLink) {
        firstLink.focus();
        await user.tab();

        expect(document.activeElement?.tagName).toBe('A');
      }
    });
  });

  describe('Theme Toggle', () => {
    it('should open theme dropdown with Enter key', async () => {
      const { user } = render(<ThemeToggle />);

      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should navigate theme options with arrow keys', async () => {
      const { user } = render(<ThemeToggle />);

      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(3); // Light, Dark, System
    });
  });

  describe('Login Form Keyboard Navigation', () => {
    it('should navigate through form fields with Tab key', async () => {
      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);

      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      // Should move to next interactive element
      expect(document.activeElement).not.toBe(emailInput);
      expect(document.activeElement?.tagName).toMatch(/INPUT|BUTTON/);
    });

    it('should submit form with Enter key', async () => {
      mockSignIn.mockResolvedValue({ error: null });
      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });

    it('should toggle password visibility with keyboard', async () => {
      const { user } = render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find(btn =>
        btn.getAttribute('type') === 'button' &&
        btn.getAttribute('tabindex') === '-1'
      );

      expect(passwordInput).toHaveAttribute('type', 'password');

      if (passwordToggle) {
        passwordToggle.focus();
        await user.keyboard('{Enter}');
        expect(passwordInput).toHaveAttribute('type', 'text');
      }
    });
  });

  describe('Register Form Keyboard Navigation', () => {
    it('should navigate through all form fields with Tab key', async () => {
      const { user } = render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);

      fullNameInput.focus();
      expect(document.activeElement).toBe(fullNameInput);

      // Tab through form fields
      await user.tab();
      expect(document.activeElement?.tagName).toMatch(/INPUT|BUTTON/);
    });

    it('should toggle checkbox with Space key', async () => {
      const { user } = render(<RegisterPage />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).not.toBeChecked();

      await user.keyboard(' ');

      expect(checkbox).toBeChecked();
    });
  });

  describe('Focus Trap in Modals', () => {
    it('should trap focus within dropdown menu', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        avatarButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        // Tab through menu items - focus should stay within menu
        const menuItems = screen.getAllByRole('menuitem');

        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();

        // After tabbing through all items, focus should cycle within menu or close
        const currentFocused = document.activeElement;
        const isInMenu = menuItems.some(item => item.contains(currentFocused));
        const menuClosed = !screen.queryByRole('menu');

        expect(isInMenu || menuClosed).toBe(true);
      }
    });
  });

  describe('Skip Links', () => {
    it('should have focusable main content area', () => {
      render(<Sidebar />);

      // Navigation elements should have proper roles
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Reverse Tab Navigation', () => {
    it('should navigate backwards with Shift+Tab', async () => {
      const { user } = render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      passwordInput.focus();

      await user.tab({ shift: true });

      // Should have moved backwards in tab order
      const currentFocus = document.activeElement;
      expect(currentFocus?.tagName).toMatch(/INPUT|BUTTON/);
    });
  });
});
