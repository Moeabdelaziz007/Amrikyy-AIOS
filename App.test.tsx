import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the heavy HologramWallpaper component to speed up tests
vi.mock('./components/HologramWallpaper', () => ({
  default: () => <div data-testid="hologram-wallpaper" />,
}));

describe('App', () => {
  it('renders the application dock', () => {
    render(<App />);
    const dockElement = screen.getByRole('navigation', { name: /application dock/i });
    expect(dockElement).toBeInTheDocument();
  });

  it('opens an app when its icon in the dock is clicked', async () => {
    render(<App />);
    
    // Window should not be present before the click
    expect(screen.queryByRole('dialog', { name: /travel agent pro/i })).not.toBeInTheDocument();

    // Find the Travel Agent icon in the Dock by its accessible name
    const travelIcon = screen.getByRole('button', { name: /travel agent/i });
    fireEvent.click(travelIcon);

    // `findByRole` waits for the element to appear
    const travelWindow = await screen.findByRole('dialog', { name: /travel agent pro/i });
    expect(travelWindow).toBeInTheDocument();
  });

  it('opens the app launcher when the launcher button is clicked', async () => {
    render(<App />);
    expect(screen.queryByPlaceholderText(/search apps and agents/i)).not.toBeInTheDocument();

    const launcherButton = screen.getByRole('button', { name: /open app launcher/i });
    fireEvent.click(launcherButton);

    const searchInput = await screen.findByPlaceholderText(/search apps and agents/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('opens the settings window and allows changing the theme', async () => {
    render(<App />);

    // Open Settings
    const settingsIcon = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsIcon);
    const settingsWindow = await screen.findByRole('dialog', { name: /system settings/i });
    expect(settingsWindow).toBeInTheDocument();

    // Check default theme (now 'obsidian')
    expect(document.documentElement).toHaveClass('theme-obsidian');

    // Find and click the 'Zen' theme button within the settings window
    const zenThemeButton = await screen.findByRole('button', { name: /zen/i });
    fireEvent.click(zenThemeButton);

    // Verify the theme class on the html element has changed
    await waitFor(() => {
        expect(document.documentElement).not.toHaveClass('theme-obsidian');
        expect(document.documentElement).toHaveClass('theme-zen');
    });
  });
});