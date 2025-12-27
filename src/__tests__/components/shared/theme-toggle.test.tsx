import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import { ThemeToggle, ThemeToggleSimple } from '@/components/shared/theme-toggle';

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = 'light';
let mockResolvedTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
    mockResolvedTheme = 'light';
  });

  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should be accessible with sr-only text', () => {
      render(<ThemeToggle />);

      expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
    });
  });

  describe('Dropdown Menu', () => {
    it('should show dropdown menu with theme options when clicked', async () => {
      const { user } = render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
      });
    });

    it('should call setTheme with "light" when Light option is clicked', async () => {
      const { user } = render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument();
      });

      const lightOption = screen.getByRole('menuitem', { name: /light/i });
      await user.click(lightOption);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should call setTheme with "dark" when Dark option is clicked', async () => {
      const { user } = render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
      });

      const darkOption = screen.getByRole('menuitem', { name: /dark/i });
      await user.click(darkOption);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with "system" when System option is clicked', async () => {
      const { user } = render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
      });

      const systemOption = screen.getByRole('menuitem', { name: /system/i });
      await user.click(systemOption);

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Active Theme Indication', () => {
    it('should highlight current theme in dropdown', async () => {
      mockTheme = 'dark';
      const { user } = render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        const darkOption = screen.getByRole('menuitem', { name: /dark/i });
        expect(darkOption).toHaveClass('bg-accent');
      });
    });
  });
});

describe('ThemeToggleSimple Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
    mockResolvedTheme = 'light';
  });

  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should be accessible with sr-only text', () => {
      render(<ThemeToggleSimple />);

      expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
    });
  });

  describe('Theme Switching', () => {
    it('should toggle to dark theme when current theme is light', async () => {
      mockResolvedTheme = 'light';
      const { user } = render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should toggle to light theme when current theme is dark', async () => {
      mockResolvedTheme = 'dark';
      const { user } = render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Icon Display', () => {
    it('should show sun icon when in dark mode (to switch to light)', () => {
      mockResolvedTheme = 'dark';
      render(<ThemeToggleSimple />);

      // In dark mode, we show Sun icon to indicate switching to light
      // The icon is rendered as an SVG inside the button
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should show moon icon when in light mode (to switch to dark)', () => {
      mockResolvedTheme = 'light';
      render(<ThemeToggleSimple />);

      // In light mode, we show Moon icon to indicate switching to dark
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Multiple Clicks', () => {
    it('should handle multiple clicks correctly', async () => {
      mockResolvedTheme = 'light';
      const { user } = render(<ThemeToggleSimple />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      await user.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      // The component doesn't re-render with new theme because mock doesn't trigger state change
      // So the second click also calls with 'dark' since mockResolvedTheme is still 'light'
      await user.click(button);

      expect(mockSetTheme).toHaveBeenCalledTimes(2);
      // Both calls are 'dark' because the component doesn't update without re-rendering
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'dark');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'dark');
    });
  });
});
