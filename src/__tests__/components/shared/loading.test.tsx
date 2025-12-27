import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { Loading, Spinner } from '@/components/shared/loading';

describe('Loading Component', () => {
  describe('Default Rendering', () => {
    it('should render loading spinner', () => {
      render(<Loading />);

      // Loading spinner should have animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with default medium size', () => {
      render(<Loading />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      render(<Loading size="sm" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('should render medium size correctly', () => {
      render(<Loading size="md" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });

    it('should render large size correctly', () => {
      render(<Loading size="lg" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
    });
  });

  describe('Text Display', () => {
    it('should not show text when not provided', () => {
      render(<Loading />);

      const textElement = screen.queryByText(/loading/i);
      expect(textElement).not.toBeInTheDocument();
    });

    it('should show text when provided', () => {
      render(<Loading text="Loading data..." />);

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should show custom loading message', () => {
      render(<Loading text="Please wait while we fetch your profile..." />);

      expect(screen.getByText('Please wait while we fetch your profile...')).toBeInTheDocument();
    });
  });

  describe('Full Screen Mode', () => {
    it('should not be fullscreen by default', () => {
      render(<Loading />);

      const fullscreenContainer = document.querySelector('.fixed.inset-0');
      expect(fullscreenContainer).not.toBeInTheDocument();
    });

    it('should render fullscreen when fullScreen prop is true', () => {
      render(<Loading fullScreen />);

      const fullscreenContainer = document.querySelector('.fixed.inset-0');
      expect(fullscreenContainer).toBeInTheDocument();
    });

    it('should show bike icon in fullscreen mode', () => {
      render(<Loading fullScreen />);

      // In fullscreen mode, there's a bike icon with animate-pulse
      const pulsingBike = document.querySelector('.animate-pulse');
      expect(pulsingBike).toBeInTheDocument();
    });

    it('should show text in fullscreen mode when provided', () => {
      render(<Loading fullScreen text="Loading your feed..." />);

      expect(screen.getByText('Loading your feed...')).toBeInTheDocument();
    });

    it('should have z-50 for overlay', () => {
      render(<Loading fullScreen />);

      const fullscreenContainer = document.querySelector('.z-50');
      expect(fullscreenContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<Loading className="custom-class" />);

      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('should have primary color styling', () => {
      render(<Loading />);

      const spinner = document.querySelector('.text-primary');
      expect(spinner).toBeInTheDocument();
    });

    it('should center content', () => {
      render(<Loading />);

      const container = document.querySelector('.flex.items-center.justify-center');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have spin animation', () => {
      render(<Loading />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});

describe('Spinner Component', () => {
  describe('Default Rendering', () => {
    it('should render spinner with default size', () => {
      render(<Spinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      render(<Spinner size="sm" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('should render medium size', () => {
      render(<Spinner size="md" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });

    it('should render large size', () => {
      render(<Spinner size="lg" />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<Spinner className="custom-spinner" />);

      const spinner = document.querySelector('.custom-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have primary color', () => {
      render(<Spinner />);

      const spinner = document.querySelector('.text-primary');
      expect(spinner).toBeInTheDocument();
    });
  });
});
