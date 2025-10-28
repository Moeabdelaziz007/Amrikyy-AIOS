import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LoadingScreen from './LoadingScreen';
import { useLanguage } from '../contexts/LanguageContext';

// Mock contexts
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('LoadingScreen', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'loading_screen.welcome_message': 'Welcome message...',
      'loading_screen.init_ai_core': 'Initializing AI Core...',
      'loading_screen.loading_ui_components': 'Loading UI Components...',
      'loading_screen.booting_agents': 'Booting Agents...',
      'loading_screen.fetching_user_data': 'Fetching User Data...',
      'loading_screen.establishing_network': 'Establishing Secure Network...',
      'loading_screen.syncing_preferences': 'Syncing Preferences...',
      'loading_screen.all_systems_ready': 'All Systems Ready!',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    vi.useFakeTimers(); // Control time-based effects
  });

  afterEach(() => {
    vi.runOnlyPendingTimers(); // Ensure all timers are cleared
    vi.useRealTimers();
  });

  it('renders initial welcome message and first loading stage', () => {
    render(<LoadingScreen userAccountName="Test User" />);
    expect(screen.getByText('Amrikyy AI OS')).toBeInTheDocument();
    expect(screen.getByText('Welcome message...')).toBeInTheDocument();
    expect(screen.getByText('Initializing AI Core...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /loading/i })).toBeInTheDocument();
  });

  it('progresses through loading stages and updates text', async () => {
    render(<LoadingScreen />);

    // Stage 1
    expect(screen.getByText('Initializing AI Core...')).toBeInTheDocument();
    vi.advanceTimersByTime(800); // Duration for first stage

    // Stage 2
    await waitFor(() => {
      expect(screen.getByText('Loading UI Components...')).toBeInTheDocument();
    });
    vi.advanceTimersByTime(1000); // Duration for second stage

    // Stage 3
    await waitFor(() => {
      expect(screen.getByText('Booting Agents...')).toBeInTheDocument();
    });
  });

  it('animates progress bar within each stage', async () => {
    render(<LoadingScreen />);
    const progressBar = screen.getByRole('progressbar', { name: /loading/i });
    const progressBarFill = progressBar.firstChild as HTMLElement;

    expect(progressBarFill).toHaveStyle('width: 0%');

    // Advance roughly half of the first stage's duration (800ms)
    vi.advanceTimersByTime(400); 
    await waitFor(() => {
      // Expect width to be around 50% for the first stage
      expect(parseInt(progressBarFill.style.width)).toBeGreaterThan(40);
      expect(parseInt(progressBarFill.style.width)).toBeLessThan(60);
    });

    vi.advanceTimersByTime(400); // Complete first stage
    await waitFor(() => {
      expect(screen.getByText('Loading UI Components...')).toBeInTheDocument();
      expect(progressBarFill).toHaveStyle('width: 0%'); // Progress resets for new stage
    });
  });

  it('hides the loading screen when all stages are complete', async () => {
    render(<LoadingScreen />);

    // Advance all timers significantly past total loading time
    vi.advanceTimersByTime(10000); // Sum of durations is 5700ms

    await waitFor(() => {
      const loadingScreenDiv = screen.getByText('Amrikyy AI OS').closest('div');
      expect(loadingScreenDiv).toHaveClass('opacity-0');
      expect(loadingScreenDiv).toHaveClass('pointer-events-none');
    });
  });

  it('displays "All Systems Ready!" as the final message', async () => {
    render(<LoadingScreen />);
    vi.advanceTimersByTime(10000);
    await waitFor(() => {
      expect(screen.getByText('All Systems Ready!')).toBeInTheDocument();
    });
  });

  it('does not display spinning icon for final message', async () => {
    render(<LoadingScreen />);
    vi.advanceTimersByTime(10000);
    await waitFor(() => {
      const spinningIcon = screen.queryByRole('status', { name: /loading/i });
      expect(spinningIcon).not.toBeInTheDocument();
    });
  });
});