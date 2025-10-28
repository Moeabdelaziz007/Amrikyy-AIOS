import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppLauncher from './AppLauncher';
import { AppID } from '../types';
import { ChatIcon, SettingsIcon, TripIcon } from './Icons'; // Import actual icons for rendering
import { useLanguage } from '../contexts/LanguageContext';

// Mock contexts
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

/**
 * Mock data representing all available applications for the App Launcher.
 */
const mockAllApps = [
  { id: AppID.chat, name: 'AI Chat', icon: ChatIcon },
  { id: AppID.settings, name: 'System Settings', icon: SettingsIcon },
  { id: AppID.travelAgent, name: 'Travel Agent Pro', icon: TripIcon },
];

/**
 * Mock function for `onOpen` callback.
 * @param {AppID} appId - The ID of the application to open.
 * @param {any} [props] - Optional props to pass to the application.
 */
const mockOnOpen = vi.fn();
/**
 * Mock function for `onClose` callback.
 */
const mockOnClose = vi.fn();
/**
 * Mock translation function for `useLanguage` hook.
 * @param {string} key - The translation key.
 * @returns {string} The mock translated string.
 */
const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

beforeEach(() => {
  (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
});

describe('AppLauncher', () => {
  it('renders a search input and app grid', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    expect(screen.getByPlaceholderText(/search apps and agents/i)).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /applications/i })).toBeInTheDocument();
  });

  it('renders all provided applications', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Travel Agent Pro')).toBeInTheDocument();
  });

  it('filters applications based on search term', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    const searchInput = screen.getByPlaceholderText(/search apps and agents/i);

    fireEvent.change(searchInput, { target: { value: 'settings' } });
    expect(screen.queryByText('AI Chat')).not.toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.queryByText('Travel Agent Pro')).not.toBeInTheDocument();
  });

  it('calls onOpen when an app icon is clicked', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    fireEvent.click(screen.getByText('AI Chat'));
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnOpen).toHaveBeenCalledWith(AppID.chat);
  });

  it('calls onClose when clicking outside the launcher content', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    fireEvent.click(screen.getByRole('dialog', { name: /app launcher/i })); // Click on the overlay
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays "No apps found" message when search yields no results', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    const searchInput = screen.getByPlaceholderText(/search apps and agents/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.getByText('No apps found matching your search.')).toBeInTheDocument();
  });

  it('app buttons have correct ARIA labels', () => {
    render(<AppLauncher onOpen={mockOnOpen} onClose={mockOnClose} allApps={mockAllApps} />);
    expect(screen.getByRole('button', { name: 'Open AI Chat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open System Settings' })).toBeInTheDocument();
  });
});