import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { ErrorBoundary, ErrorFallback, NotFound, EmptyState } from '@/components/shared/error-boundary';
import { AlertTriangle } from 'lucide-react';

describe('ErrorFallback Component', () => {
  describe('Default Rendering', () => {
    it('should render with default title', () => {
      render(<ErrorFallback />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render with default description', () => {
      render(<ErrorFallback />);

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('should render alert icon', () => {
      render(<ErrorFallback />);

      // The AlertTriangle icon creates an SVG element
      const card = document.querySelector('[class*="rounded-full"]');
      expect(card).toBeInTheDocument();
    });

    it('should render Go home button', () => {
      render(<ErrorFallback />);

      const homeButton = screen.getByRole('link', { name: /go home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', '/feed');
    });
  });

  describe('Custom Props', () => {
    it('should render custom title', () => {
      render(<ErrorFallback title="Custom Error Title" />);

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('should render custom description', () => {
      render(<ErrorFallback description="This is a custom error description." />);

      expect(screen.getByText('This is a custom error description.')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should render Try again button when reset is provided', () => {
      const reset = vi.fn();
      render(<ErrorFallback reset={reset} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should not render Try again button when reset is not provided', () => {
      render(<ErrorFallback />);

      const tryAgainButton = screen.queryByRole('button', { name: /try again/i });
      expect(tryAgainButton).not.toBeInTheDocument();
    });

    it('should call reset when Try again button is clicked', async () => {
      const reset = vi.fn();
      const { user } = render(<ErrorFallback reset={reset} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      expect(reset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Display', () => {
    it('should not show error message by default in production', () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'production');

      render(<ErrorFallback error={new Error('Test error message')} />);

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();

      vi.stubEnv('NODE_ENV', originalEnv);
    });
  });

  describe('Styling', () => {
    it('should have centered layout', () => {
      render(<ErrorFallback />);

      const container = document.querySelector('.flex.min-h-\\[400px\\].items-center.justify-center');
      expect(container).toBeInTheDocument();
    });

    it('should have card styling', () => {
      render(<ErrorFallback />);

      const card = document.querySelector('[class*="max-w-md"]');
      expect(card).toBeInTheDocument();
    });
  });
});

describe('NotFound Component', () => {
  describe('Default Rendering', () => {
    it('should render 404 text', () => {
      render(<NotFound />);

      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<NotFound />);

      expect(screen.getByText('Page not found')).toBeInTheDocument();
    });

    it('should render default description', () => {
      render(<NotFound />);

      expect(screen.getByText("The page you're looking for doesn't exist or has been moved.")).toBeInTheDocument();
    });

    it('should render Go home button', () => {
      render(<NotFound />);

      const homeButton = screen.getByRole('link', { name: /go home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', '/feed');
    });
  });

  describe('Custom Props', () => {
    it('should render custom title', () => {
      render(<NotFound title="Custom 404 Title" />);

      expect(screen.getByText('Custom 404 Title')).toBeInTheDocument();
    });

    it('should render custom description', () => {
      render(<NotFound description="This page has been removed." />);

      expect(screen.getByText('This page has been removed.')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have centered text', () => {
      render(<NotFound />);

      const card = document.querySelector('.text-center');
      expect(card).toBeInTheDocument();
    });

    it('should have large 404 text', () => {
      render(<NotFound />);

      const notFoundText = screen.getByText('404');
      expect(notFoundText).toHaveClass('text-8xl');
    });
  });
});

describe('EmptyState Component', () => {
  describe('Rendering', () => {
    it('should render title', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<EmptyState title="No items" description="Add your first item to get started." />);

      expect(screen.getByText('Add your first item to get started.')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState title="No items" />);

      const description = screen.queryByText(/get started/i);
      expect(description).not.toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(
        <EmptyState
          title="No items"
          icon={<AlertTriangle data-testid="empty-icon" className="h-8 w-8" />}
        />
      );

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('should not render icon container when icon not provided', () => {
      render(<EmptyState title="No items" />);

      const iconContainer = document.querySelector('.mb-4.flex.h-16.w-16');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should render action when provided', () => {
      render(
        <EmptyState
          title="No posts"
          action={<button>Create Post</button>}
        />
      );

      expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have centered layout', () => {
      render(<EmptyState title="No items" />);

      const container = document.querySelector('.flex.min-h-\\[200px\\].flex-col.items-center.justify-center');
      expect(container).toBeInTheDocument();
    });

    it('should have text-center styling', () => {
      render(<EmptyState title="No items" />);

      const container = document.querySelector('.text-center');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('ErrorBoundary Component', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render fallback when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should provide reset function to fallback', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // The default fallback includes a Try again button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });
  });
});

// Import afterEach for cleanup
import { afterEach } from 'vitest';
