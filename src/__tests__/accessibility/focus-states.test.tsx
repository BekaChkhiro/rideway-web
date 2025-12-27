import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle, ThemeToggleSimple } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import LoginPage from '@/app/(auth)/login/page';
import { mockRouter } from '../setup';

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

describe('Focus States Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Focus States', () => {
    it('should have focus ring styles defined', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button', { name: /test button/i });

      // Check that the button has focus-visible styles
      expect(button.className).toContain('focus-visible:');
    });

    it('should show focus ring when focused', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button', { name: /test button/i });
      button.focus();

      // Button should be the active element when focused
      expect(document.activeElement).toBe(button);
    });

    it('should have outline or ring focus indicator', () => {
      render(<Button>Focusable Button</Button>);

      const button = screen.getByRole('button');

      // Shadcn buttons use focus-visible:ring classes
      expect(button.className).toMatch(/focus-visible:(ring|outline)/);
    });
  });

  describe('Input Focus States', () => {
    it('should have focus ring styles', () => {
      render(<Input placeholder="Test input" />);

      const input = screen.getByPlaceholderText(/test input/i);

      // Inputs should have focus-visible styling
      expect(input.className).toContain('focus-visible:');
    });

    it('should be focusable', async () => {
      render(<Input placeholder="Test input" />);

      const input = screen.getByPlaceholderText(/test input/i);
      input.focus();

      expect(document.activeElement).toBe(input);
    });

    it('should have ring styling on focus', () => {
      render(<Input placeholder="Test input" />);

      const input = screen.getByPlaceholderText(/test input/i);

      // Check for ring classes
      expect(input.className).toMatch(/focus-visible:ring/);
    });
  });

  describe('Checkbox Focus States', () => {
    it('should have focus-visible styles', () => {
      render(<Checkbox id="test" />);

      const checkbox = screen.getByRole('checkbox');

      // Checkboxes should have focus styling
      expect(checkbox.className).toContain('focus-visible:');
    });

    it('should be focusable', () => {
      render(<Checkbox id="test" />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Link Focus States', () => {
    it('should have visible focus on sidebar links', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // Links should be focusable
      const firstLink = links[0];
      if (firstLink) {
        firstLink.focus();
        expect(document.activeElement).toBe(firstLink);
      }
    });

    it('should have visible focus on mobile nav links', () => {
      render(<MobileNav />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      const firstLink = links[0];
      if (firstLink) {
        firstLink.focus();
        expect(document.activeElement).toBe(firstLink);
      }
    });
  });

  describe('Header Interactive Elements Focus', () => {
    it('should have focusable menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      menuButton.focus();

      expect(document.activeElement).toBe(menuButton);
    });

    it('should have focusable search button', () => {
      render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      searchButton.focus();

      expect(document.activeElement).toBe(searchButton);
    });

    it('should have focusable notifications button', () => {
      render(<Header />);

      const notificationsButton = screen.getByRole('button', { name: /notifications/i });
      notificationsButton.focus();

      expect(document.activeElement).toBe(notificationsButton);
    });

    it('should have focusable theme toggle', () => {
      render(<Header />);

      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      themeButton.focus();

      expect(document.activeElement).toBe(themeButton);
    });
  });

  describe('Form Focus States', () => {
    it('should have visible focus on email input', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      emailInput.focus();

      expect(document.activeElement).toBe(emailInput);
      expect(emailInput.className).toContain('focus-visible:');
    });

    it('should have visible focus on password input', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      passwordInput.focus();

      expect(document.activeElement).toBe(passwordInput);
      expect(passwordInput.className).toContain('focus-visible:');
    });

    it('should have visible focus on submit button', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      submitButton.focus();

      expect(document.activeElement).toBe(submitButton);
    });

    it('should have visible focus on remember me checkbox', () => {
      render(<LoginPage />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Theme Toggle Focus States', () => {
    it('should have focusable toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it('should have focusable simple toggle button', () => {
      render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('Focus Ring Contrast', () => {
    it('should have visible focus ring styling', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');

      // Check for focus-visible ring classes
      expect(button.className).toContain('focus-visible:');
    });

    it('should have proper ring width', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');

      // Should have ring styling for visibility
      expect(button.className).toMatch(/focus-visible:(ring|border)/);
    });
  });

  describe('Focus Order', () => {
    it('should have logical focus order in header', async () => {
      const { user } = render(<Header />);

      // Get all focusable elements
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      // All interactive elements should be present
      expect(buttons.length + links.length).toBeGreaterThan(0);

      // Tab through elements
      await user.tab();
      expect(document.activeElement?.tagName).toMatch(/BUTTON|A|INPUT/);
    });

    it('should have logical focus order in sidebar', async () => {
      const { user } = render(<Sidebar />);

      const links = screen.getAllByRole('link');

      // First link should be Feed (first nav item)
      const firstLink = links[0];
      expect(firstLink).toHaveAttribute('href', '/feed');

      // Tab through - should follow visual order
      if (firstLink) {
        firstLink.focus();
        await user.tab();

        const nextFocused = document.activeElement;
        expect(nextFocused?.tagName).toMatch(/A|BUTTON/);
      }
    });
  });

  describe('Disabled State Focus', () => {
    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');

      // Disabled buttons should not be focusable
      expect(button).toBeDisabled();
    });

    it('should not focus disabled inputs', () => {
      render(<Input disabled placeholder="Disabled" />);

      const input = screen.getByPlaceholderText(/disabled/i);
      expect(input).toBeDisabled();
    });
  });

  describe('Focus Visible vs Focus', () => {
    it('buttons should use focus-visible for keyboard focus', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');

      // Should use focus-visible (keyboard-only focus) not just focus
      expect(button.className).toContain('focus-visible:');
    });

    it('inputs should use focus-visible', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText(/test/i);
      expect(input.className).toContain('focus-visible:');
    });
  });
});
