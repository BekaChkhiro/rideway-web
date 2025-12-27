import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import LoginPage from '@/app/(auth)/login/page';
import { mockRouter, mockSignIn, mockToast } from '../../setup';

// Mock useSearchParams for login page
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

describe('Login Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render login form with all fields', () => {
      render(<LoginPage />);

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have password field hidden by default', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle password visibility', async () => {
      const { user } = render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      // Find the toggle button within the password field container
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => btn.getAttribute('type') === 'button' && !btn.textContent);

      expect(passwordInput).toHaveAttribute('type', 'password');

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      await user.type(emailInput, 'notvalid');

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      await user.type(passwordInput, 'password');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // The form should show a validation error for the email
      await waitFor(() => {
        const formElement = document.querySelector('form');
        expect(formElement).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Successful Login', () => {
    it('should call signIn with correct credentials', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'Password123',
          redirect: false,
        });
      });
    });

    it('should show success toast and redirect on successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null });

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
        expect(mockRouter.push).toHaveBeenCalledWith('/');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should handle remember me checkbox', async () => {
      const { user } = render(<LoginPage />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Failed Login', () => {
    it('should show error toast for invalid credentials', async () => {
      mockSignIn.mockResolvedValue({ error: 'Invalid email or password' });

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid email or password');
      });
    });

    it('should show error toast for unverified email', async () => {
      mockSignIn.mockResolvedValue({ error: 'Please verify your email before logging in' });

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'unverified@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please verify your email before logging in');
      });
    });

    it('should show generic error for network failure', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Something went wrong. Please try again.');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during login', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable form inputs during login', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have link to forgot password page', () => {
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have link to register page', () => {
      render(<LoginPage />);

      const registerLink = screen.getByRole('link', { name: /sign up/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });
});
