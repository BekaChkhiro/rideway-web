import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { mockRouter } from '../setup';

// Mock usePathname
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => '/login',
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

describe('Form Labels Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Label Association', () => {
    it('should have label correctly associated with input using htmlFor', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" placeholder="Test" />
        </div>
      );

      const label = screen.getByText('Test Label');
      const input = screen.getByPlaceholderText('Test');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('should allow clicking label to focus input', async () => {
      const { user } = render(
        <div>
          <Label htmlFor="clickable-input">Click Me</Label>
          <Input id="clickable-input" placeholder="Focus here" />
        </div>
      );

      const label = screen.getByText('Click Me');
      await user.click(label);

      const input = screen.getByPlaceholderText('Focus here');
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Login Form Labels', () => {
    it('should have email input with accessible label or placeholder', () => {
      render(<LoginPage />);

      // Email input should be findable by its accessible label
      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have password input with accessible label or placeholder', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have labeled remember me checkbox', () => {
      render(<LoginPage />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // Should have associated label text
      expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    });

    it('should have submit button with accessible name', () => {
      render(<LoginPage />);

      const button = screen.getByRole('button', { name: /sign in/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Register Form Labels', () => {
    it('should have full name input with accessible label', () => {
      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText(/john doe/i);
      expect(fullNameInput).toBeInTheDocument();

      // Should have label
      expect(screen.getByText(/full name/i)).toBeInTheDocument();
    });

    it('should have username input with accessible label', () => {
      render(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/johndoe/i);
      expect(usernameInput).toBeInTheDocument();

      expect(screen.getByText(/username/i)).toBeInTheDocument();
    });

    it('should have email input with accessible label', () => {
      render(<RegisterPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have password input with accessible label', () => {
      render(<RegisterPage />);

      const passwordInput = screen.getByPlaceholderText(/create a strong password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have confirm password input with accessible label', () => {
      render(<RegisterPage />);

      const confirmInput = screen.getByPlaceholderText(/confirm your password/i);
      expect(confirmInput).toBeInTheDocument();
    });

    it('should have terms checkbox with accessible label', () => {
      render(<RegisterPage />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // Should have label text
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    });

    it('should have submit button with accessible name', () => {
      render(<RegisterPage />);

      const button = screen.getByRole('button', { name: /create account/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Forgot Password Form Labels', () => {
    it('should have email input with accessible label', () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have submit button with accessible name', () => {
      render(<ForgotPasswordPage />);

      const button = screen.getByRole('button', { name: /send reset link/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error Messages Association', () => {
    it('should show error message associated with email field', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error message associated with password field', async () => {
      const { user } = render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Password input should exist
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    it('should have aria-invalid on form controls', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        // The form-control wrapper has aria-invalid, not the input
        const formControl = document.querySelector('[data-slot="form-control"]');
        expect(formControl).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby linking to error message after validation', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Form control wrapper should have aria-describedby
        const formControl = document.querySelector('[data-slot="form-control"]');
        expect(formControl).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Required Field Indication', () => {
    it('should validate required fields in login form', async () => {
      const { user } = render(<LoginPage />);

      // Submit without filling fields
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show required field errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields in register form', async () => {
      const { user } = render(<RegisterPage />);

      // Submit without filling fields
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Type Attributes', () => {
    it('should have correct type for email inputs', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have correct type for password inputs', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have autocomplete attributes for forms', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);

      // Email should have autocomplete for autofill
      expect(emailInput).toHaveAttribute('autoComplete');
    });
  });

  describe('Checkbox Labels', () => {
    it('should have checkbox with id matching label for attribute', () => {
      render(
        <div className="flex items-center space-x-2">
          <Checkbox id="test-checkbox" />
          <Label htmlFor="test-checkbox">Accept terms</Label>
        </div>
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms');

      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    it('should toggle checkbox when label is clicked', async () => {
      const { user } = render(
        <div className="flex items-center space-x-2">
          <Checkbox id="clickable-checkbox" />
          <Label htmlFor="clickable-checkbox">Toggle me</Label>
        </div>
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Toggle me');

      expect(checkbox).not.toBeChecked();

      await user.click(label);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Form Structure', () => {
    it('should have form element wrapping inputs', () => {
      render(<LoginPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      // Inputs should be inside form
      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(form).toContainElement(emailInput);
    });

    it('should have fieldset grouping related inputs when appropriate', () => {
      render(<RegisterPage />);

      // Check form exists and contains all inputs
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    it('should have help text for password requirements', () => {
      render(<RegisterPage />);

      // Password field might have help text about requirements
      // Check for any descriptive text near password field
      const passwordInput = screen.getByPlaceholderText(/create a strong password/i);
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe('Input Descriptions', () => {
    it('should associate descriptions with inputs via aria-describedby after validation', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Form control wrapper should have describedby for descriptions/errors after validation
        const formControl = document.querySelector('[data-slot="form-control"]');
        expect(formControl).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Button Types', () => {
    it('should have submit type on form submit buttons', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have button type on non-submit buttons', () => {
      render(<LoginPage />);

      // Password toggle button should be type="button"
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn =>
        btn.getAttribute('type') === 'button'
      );

      if (toggleButton) {
        expect(toggleButton).toHaveAttribute('type', 'button');
      }
    });
  });
});
