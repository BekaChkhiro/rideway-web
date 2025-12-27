import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import {
  Spinner,
  SpinnerWithText,
  CenteredSpinner,
  OverlaySpinner,
  ButtonSpinner,
} from '@/components/shared/spinner';

describe('Spinner Component', () => {
  describe('Default Rendering', () => {
    it('should render spinner with animation', () => {
      render(<Spinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with default medium size', () => {
      render(<Spinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });

    it('should render with default primary variant', () => {
      render(<Spinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-primary');
    });
  });

  describe('Size Variants', () => {
    it('should render xs size', () => {
      render(<Spinner size="xs" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-3');
      expect(spinner).toHaveClass('w-3');
    });

    it('should render sm size', () => {
      render(<Spinner size="sm" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('should render md size', () => {
      render(<Spinner size="md" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });

    it('should render lg size', () => {
      render(<Spinner size="lg" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });

    it('should render xl size', () => {
      render(<Spinner size="xl" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
    });
  });

  describe('Color Variants', () => {
    it('should render default variant', () => {
      render(<Spinner variant="default" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-primary');
    });

    it('should render muted variant', () => {
      render(<Spinner variant="muted" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-muted-foreground');
    });

    it('should render white variant', () => {
      render(<Spinner variant="white" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-white');
    });

    it('should render destructive variant', () => {
      render(<Spinner variant="destructive" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-destructive');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Spinner className="custom-spinner" />);

      const spinner = document.querySelector('.custom-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });
});

describe('SpinnerWithText Component', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      render(<SpinnerWithText />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render text when provided', () => {
      render(<SpinnerWithText text="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render text when not provided', () => {
      render(<SpinnerWithText />);

      // Should not have text content
      const container = document.querySelector('.flex.items-center.gap-2');
      expect(container?.textContent).toBe('');
    });
  });

  describe('Styling', () => {
    it('should have flex layout', () => {
      render(<SpinnerWithText text="Loading" />);

      const container = document.querySelector('.flex.items-center.gap-2');
      expect(container).toBeInTheDocument();
    });

    it('should apply custom text className', () => {
      render(<SpinnerWithText text="Loading" textClassName="custom-text" />);

      const text = screen.getByText('Loading');
      expect(text).toHaveClass('custom-text');
    });
  });

  describe('Inherited Props', () => {
    it('should pass size to spinner', () => {
      render(<SpinnerWithText size="lg" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
    });

    it('should pass variant to spinner', () => {
      render(<SpinnerWithText variant="muted" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-muted-foreground');
    });
  });
});

describe('CenteredSpinner Component', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      render(<CenteredSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should center the spinner', () => {
      render(<CenteredSpinner />);

      const container = document.querySelector('.flex.items-center.justify-center');
      expect(container).toBeInTheDocument();
    });

    it('should have padding', () => {
      render(<CenteredSpinner />);

      const container = document.querySelector('.p-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom container className', () => {
      render(<CenteredSpinner containerClassName="custom-container" />);

      const container = document.querySelector('.custom-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Inherited Props', () => {
    it('should pass size to spinner', () => {
      render(<CenteredSpinner size="xl" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-12');
    });
  });
});

describe('OverlaySpinner Component', () => {
  describe('Visibility', () => {
    it('should render when show is true', () => {
      render(<OverlaySpinner show={true} />);

      const overlay = document.querySelector('.absolute.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('should render by default (show defaults to true)', () => {
      render(<OverlaySpinner />);

      const overlay = document.querySelector('.absolute.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('should not render when show is false', () => {
      render(<OverlaySpinner show={false} />);

      const overlay = document.querySelector('.absolute.inset-0');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have overlay styling', () => {
      render(<OverlaySpinner />);

      const overlay = document.querySelector('.absolute.inset-0.z-10');
      expect(overlay).toBeInTheDocument();
    });

    it('should have backdrop blur', () => {
      render(<OverlaySpinner />);

      const overlay = document.querySelector('.backdrop-blur-sm');
      expect(overlay).toBeInTheDocument();
    });

    it('should have semi-transparent background', () => {
      render(<OverlaySpinner />);

      const overlay = document.querySelector('[class*="bg-background/80"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should center the spinner', () => {
      render(<OverlaySpinner />);

      const overlay = document.querySelector('.flex.items-center.justify-center');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Inherited Props', () => {
    it('should pass size to spinner', () => {
      render(<OverlaySpinner size="lg" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
    });
  });
});

describe('ButtonSpinner Component', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      render(<ButtonSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with small size', () => {
      render(<ButtonSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('should have right margin for button layout', () => {
      render(<ButtonSpinner />);

      const spinner = document.querySelector('.mr-2');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<ButtonSpinner className="custom-button-spinner" />);

      const spinner = document.querySelector('.custom-button-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });
});
