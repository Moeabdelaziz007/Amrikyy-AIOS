import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkspaceHubWidget from './WorkspaceHubWidget';
import { useLanguage } from '../contexts/LanguageContext';

// Mocking useLanguage hook
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('WorkspaceHubWidget', () => {
  const mockT = vi.fn((key: string, options?: any) => {
    if (key === 'workspace_widget.title') return 'Workspace Hub';
    if (key === 'workspace_widget.calendar') return 'Calendar';
    if (key === 'workspace_widget.drive') return 'Drive';
    if (key === 'workspace_widget.gmail') return 'Gmail';
    if (key === 'workspace_widget.not_connected') return 'Connect to Google to see data.';
    return key;
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-19T10:00:00.000Z')); // Consistent time for formatting
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "not connected" message when isConnected is false', () => {
    render(
      <WorkspaceHubWidget
        isConnected={false}
        events={[]}
        files={[]}
        messages={[]}
      />
    );

    expect(screen.getByText('Workspace Hub')).toBeInTheDocument();
    expect(screen.getByText('Connect to Google to see data.')).toBeInTheDocument();
    expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('Drive')).not.toBeInTheDocument();
    expect(screen.queryByText('Gmail')).not.toBeInTheDocument();
  });

  it('renders connected state and data when isConnected is true', () => {
    const mockEvents = [{ id: 'e1', summary: 'Team Sync', start: '2024-07-19T11:00:00Z', end: '2024-07-19T11:30:00Z' }];
    const mockFiles = [{ id: 'f1', name: 'Report.pdf', link: '#' }];
    const mockMessages = [{ id: 'm1', snippet: 'Project update' }];

    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={mockEvents}
        files={mockFiles}
        messages={mockMessages}
      />
    );

    expect(screen.getByText('Workspace Hub')).toBeInTheDocument();
    expect(screen.queryByText('Connect to Google to see data.')).not.toBeInTheDocument();

    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Team Sync')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM - 11:30 AM')).toBeInTheDocument();

    expect(screen.getByText('Drive')).toBeInTheDocument();
    expect(screen.getByText('Report.pdf')).toBeInTheDocument();

    expect(screen.getByText('Gmail')).toBeInTheDocument();
    expect(screen.getByText('Project update')).toBeInTheDocument();
  });

  it('renders "No upcoming events." when no events are provided', () => {
    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={[]}
        files={[]}
        messages={[]}
      />
    );
    expect(screen.getByText('No upcoming events.')).toBeInTheDocument();
  });

  it('renders "No recent files." when no files are provided', () => {
    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={[]}
        files={[]}
        messages={[]}
      />
    );
    expect(screen.getByText('No recent files.')).toBeInTheDocument();
  });

  it('renders "No important messages." when no messages are provided', () => {
    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={[]}
        files={[]}
        messages={[]}
      />
    );
    expect(screen.getByText('No important messages.')).toBeInTheDocument();
  });

  it('links in Drive section have correct attributes', () => {
    const mockFiles = [{ id: 'f1', name: 'Document.docx', link: 'http://example.com/doc' }];
    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={[]}
        files={mockFiles}
        messages={[]}
      />
    );
    const fileLink = screen.getByText('Document.docx');
    expect(fileLink).toHaveAttribute('href', 'http://example.com/doc');
    expect(fileLink).toHaveAttribute('target', '_blank');
    expect(fileLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('formats time correctly for calendar events', () => {
    const mockEvents = [{ id: 'e1', summary: 'Lunch', start: '2024-07-19T13:30:00Z', end: '2024-07-19T14:00:00Z' }];
    render(
      <WorkspaceHubWidget
        isConnected={true}
        events={mockEvents}
        files={[]}
        messages={[]}
      />
    );
    expect(screen.getByText('01:30 PM - 02:00 PM')).toBeInTheDocument(); // Assuming default locale for `toLocaleTimeString`
  });
});