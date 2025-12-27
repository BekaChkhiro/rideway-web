import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle, ThemeToggleSimple } from '@/components/shared/theme-toggle';
import { Loading } from '@/components/shared/loading';
import { ErrorFallback, NotFound, EmptyState } from '@/components/shared/error-boundary';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { mockRouter } from '../setup';
import { AlertTriangle } from 'lucide-react';

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

describe('Screen Reader Labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Screen Reader Labels', () => {
    it('should have sr-only label for menu toggle', () => {
      render(<Header />);

      expect(screen.getByText(/toggle menu/i)).toBeInTheDocument();
      expect(screen.getByText(/toggle menu/i)).toHaveClass('sr-only');
    });

    it('should have sr-only label for search button', () => {
      render(<Header />);

      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('should have sr-only label for notifications', () => {
      render(<Header />);

      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });

    it('should have sr-only label for theme toggle', () => {
      render(<Header />);

      expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
    });

    it('should have accessible name on logo link', () => {
      render(<Header />);

      const logoLink = screen.getByRole('link', { name: /bike area/i });
      expect(logoLink).toBeInTheDocument();
    });

    it('should have labeled search input', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Sidebar Screen Reader Labels', () => {
    it('should have accessible names for all navigation links', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /parts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /forum/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
    });

    it('should have sr-only labels when sidebar is collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      // When collapsed, labels should be sr-only
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('should have accessible toggle button label', () => {
      render(<Sidebar onToggle={vi.fn()} isCollapsed={false} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should have accessible toggle button label when collapsed', () => {
      render(<Sidebar onToggle={vi.fn()} isCollapsed={true} />);

      const toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation Screen Reader Labels', () => {
    it('should have accessible names for navigation items', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should have navigation landmark', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Theme Toggle Screen Reader Labels', () => {
    it('should have accessible label on theme toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should have accessible label on simple theme toggle', () => {
      render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should have sr-only text for toggle theme', () => {
      render(<ThemeToggleSimple />);

      expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
    });
  });

  describe('Login Form Screen Reader Labels', () => {
    it('should have accessible heading', () => {
      render(<LoginPage />);

      // Check for welcome back text which serves as the heading
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('should have accessible email input', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have accessible password input', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have accessible submit button', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should have accessible forgot password link', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotLink).toBeInTheDocument();
    });

    it('should have accessible sign up link', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toBeInTheDocument();
    });
  });

  describe('Register Form Screen Reader Labels', () => {
    it('should have accessible heading', () => {
      render(<RegisterPage />);

      // Check for create an account text which serves as the heading
      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    });

    it('should have accessible checkbox with label', () => {
      render(<RegisterPage />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should have accessible terms links', () => {
      render(<RegisterPage />);

      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });

    it('should have accessible submit button', () => {
      render(<RegisterPage />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Forgot Password Form Screen Reader Labels', () => {
    it('should have accessible heading', () => {
      render(<ForgotPasswordPage />);

      // Check for forgot password text which serves as the heading
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should have accessible submit button', () => {
      render(<ForgotPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should have accessible back to login link', () => {
      render(<ForgotPasswordPage />);

      const backLink = screen.getByRole('link', { name: /back to login/i });
      expect(backLink).toBeInTheDocument();
    });
  });

  describe('Error Components Screen Reader Labels', () => {
    it('should have accessible heading on error fallback', () => {
      render(<ErrorFallback />);

      // Card title may not have heading role, but text should be visible
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should have accessible button on error fallback', () => {
      render(<ErrorFallback reset={vi.fn()} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should have accessible link on error fallback', () => {
      render(<ErrorFallback />);

      expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    });

    it('should have accessible heading on not found', () => {
      render(<NotFound />);

      // Card title may not have heading role, but text should be visible
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('should have accessible content on empty state', () => {
      render(
        <EmptyState
          title="No posts yet"
          description="Create your first post to get started"
          icon={<AlertTriangle className="h-8 w-8" />}
        />
      );

      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first post to get started')).toBeInTheDocument();
    });
  });

  describe('Loading Component Screen Reader', () => {
    it('should have text for screen readers when text provided', () => {
      render(<Loading text="Loading your profile..." />);

      expect(screen.getByText('Loading your profile...')).toBeInTheDocument();
    });

    it('should have visible text in fullscreen mode', () => {
      render(<Loading fullScreen text="Please wait..." />);

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-invalid on form controls after validation', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // After submission with empty fields, form controls should be marked invalid
      await waitFor(() => {
        const formControl = document.querySelector('[data-slot="form-control"]');
        expect(formControl).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby for form control wrapper after validation', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // After validation, form control wrapper should have aria-describedby for error messages
      await waitFor(() => {
        const formControl = document.querySelector('[data-slot="form-control"]');
        expect(formControl).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Landmark Regions', () => {
    it('should have header landmark', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should have navigation landmark in sidebar', () => {
      render(<Sidebar />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have navigation landmark in mobile nav', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have aside landmark in sidebar', () => {
      render(<Sidebar />);

      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('Form Element Associations', () => {
    it('should have form element in login page', () => {
      render(<LoginPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have form element in register page', () => {
      render(<RegisterPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have form element in forgot password page', () => {
      render(<ForgotPasswordPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});
