import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ControlPanelApp from './ControlPanelApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { AppID } from '../../types';

// Mock the useLanguage hook
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('ControlPanelApp', () => {
  const mockOnOpenApp = vi.fn();
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'app_titles.controlPanel': 'Control Panel',
      'settings.appearance': 'Appearance',
      'settings.profile': 'Profile',
      'settings.assistant': 'AI Assistant',
      'settings.billing': 'Subscription',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnOpenApp.mockClear();
  });

  it('renders the control panel title', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Control Panel')).toBeInTheDocument();
  });

  it('renders system toggle controls', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('System Toggles')).toBeInTheDocument();
    expect(screen.getByText('Do Not Disturb')).toBeInTheDocument();
    expect(screen.getByText('Performance Mode')).toBeInTheDocument();
  });

  it('renders settings shortcut buttons', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Settings Shortcuts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscription/i })).toBeInTheDocument();
  });

  it('toggles "Do Not Disturb" state on click', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    const dndToggle = screen.getByText('Do Not Disturb').closest('div')?.querySelector('div[role="switch"], div[class*="rounded-full"]');
    
    // Initial state: off
    const initialToggleState = dndToggle?.querySelector('div[class*="translate-x-6"]');
    expect(initialToggleState).not.toBeInTheDocument();

    if (dndToggle) {
        fireEvent.click(dndToggle);
        // After click: on
        const toggledState = dndToggle.querySelector('div[class*="translate-x-6"]');
        expect(toggledState).toBeInTheDocument();

        fireEvent.click(dndToggle);
        // After second click: off
        expect(toggledState).not.toBeInTheDocument();
    } else {
        throw new Error("Do Not Disturb toggle not found.");
    }
  });

  it('toggles "Performance Mode" state on click', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    const performanceToggle = screen.getByText('Performance Mode').closest('div')?.querySelector('div[role="switch"], div[class*="rounded-full"]');
    
    // Initial state: off
    const initialToggleState = performanceToggle?.querySelector('div[class*="translate-x-6"]');
    expect(initialToggleState).not.toBeInTheDocument();

    if (performanceToggle) {
        fireEvent.click(performanceToggle);
        // After click: on
        const toggledState = performanceToggle.querySelector('div[class*="translate-x-6"]');
        expect(toggledState).toBeInTheDocument();
    } else {
        throw new Error("Performance Mode toggle not found.");
    }
  });

  it('calls onOpenApp with "settings" and correct initialSection when settings shortcut is clicked', () => {
    render(<ControlPanelApp onOpenApp={mockOnOpenApp} />);
    const appearanceButton = screen.getByRole('button', { name: /appearance/i });
    fireEvent.click(appearanceButton);

    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('settings' as AppID, { initialSection: 'appearance' });

    mockOnOpenApp.mockClear(); // Clear for next test
    const profileButton = screen.getByRole('button', { name: /profile/i });
    fireEvent.click(profileButton);
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('settings' as AppID, { initialSection: 'profile' });
  });
});