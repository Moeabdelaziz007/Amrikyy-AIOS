import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// FIX: Changed named import to default import as WorkspaceApp is a default export.
import WorkspaceApp from './WorkspaceApp';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('WorkspaceApp', () => {
  const mockAddNotification = vi.fn();
  const mockT = vi.fn((key: string, options?: any) => {
    if (key === 'notifications.collab_join') return `${options.userName} has joined.`;
    if (key === 'notifications.collab_edit') return `${options.userName} is editing.`;
    return key;
  });

  beforeEach(() => {
    (useNotification as vi.Mock).mockReturnValue({ addNotification: mockAddNotification });
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    vi.useFakeTimers(); // Use fake timers for setTimeout
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders with "Notes" tab active by default and displays initial content', () => {
    render(<WorkspaceApp />);
    expect(screen.getByRole('button', { name: /notes/i })).toHaveClass('bg-accent/20');
    expect(screen.getByText('Project Phoenix - Q3 Strategy')).toBeInTheDocument();
    expect(screen.getByText(/Initial brainstorming for Q3 marketing campaign/i)).toBeInTheDocument();
  });

  it('switches tabs correctly when navigation buttons are clicked', () => {
    render(<WorkspaceApp />);
    
    // Switch to Music
    fireEvent.click(screen.getByRole('button', { name: /music/i }));
    expect(screen.getByRole('button', { name: /music/i })).toHaveClass('bg-accent/20');
    expect(screen.getByText('Starlight Echoes')).toBeInTheDocument();

    // Switch to YouTube
    fireEvent.click(screen.getByRole('button', { name: /youtube/i }));
    expect(screen.getByRole('button', { name: /youtube/i })).toHaveClass('bg-accent/20');
    expect(screen.getByTitle('YouTube video player')).toBeInTheDocument();

    // Switch to Whiteboard
    fireEvent.click(screen.getByRole('button', { name: /whiteboard/i }));
    expect(screen.getByRole('button', { name: /whiteboard/i })).toHaveClass('bg-accent/20');
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });

  it('allows editing notes in the "Notes" tab', () => {
    render(<WorkspaceApp />);
    const notesTextArea = screen.getByDisplayValue(/Initial brainstorming/i);
    fireEvent.change(notesTextArea, { target: { value: 'Updated notes content.' } });
    expect(notesTextArea).toHaveValue('Updated notes content.');
  });

  it('simulates collaborative join notification', async () => {
    render(<WorkspaceApp />);
    vi.advanceTimersByTime(3000); // Advance to trigger join notification
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith('Jane Doe has joined.', 'info', 'App');
    });
  });

  it('simulates collaborative edit notification and updates notes', async () => {
    render(<WorkspaceApp />);
    vi.advanceTimersByTime(8000); // Advance to trigger edit notification
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith('John Smith is editing.', 'info', 'App');
      expect(screen.getByText(/John S: Added a thought on influencer marketing/i)).toBeInTheDocument();
    });
  });

  it('displays member avatars', () => {
    render(<WorkspaceApp />);
    expect(screen.getByAltText('You')).toBeInTheDocument();
    expect(screen.getByAltText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByAltText('John Smith')).toBeInTheDocument();
  });
});