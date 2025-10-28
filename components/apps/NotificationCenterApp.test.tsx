import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationCenterApp from './NotificationCenterApp';
import { useNotification } from '../../contexts/NotificationContext';
import { Notification } from '../../types';

// Mock the useNotification hook
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}));

describe('NotificationCenterApp', () => {
  const mockNotifications: Notification[] = [
    { id: 1, message: 'System update available!', type: 'info', category: 'System' },
    { id: 2, message: 'Agent Luna completed task.', type: 'success', category: 'Agent' },
  ];
  const mockClearHistory = vi.fn();

  beforeEach(() => {
    (useNotification as vi.Mock).mockReturnValue({
      notifications: mockNotifications,
      toastNotifications: [], // Not directly tested here, but required by context
      addNotification: vi.fn(),
      clearHistory: mockClearHistory,
    });
    mockClearHistory.mockClear();
  });

  it('renders the app title', () => {
    render(<NotificationCenterApp />);
    expect(screen.getByText('Notification Center')).toBeInTheDocument();
  });

  it('renders a list of notifications', () => {
    render(<NotificationCenterApp />);
    expect(screen.getByText('System update available!')).toBeInTheDocument();
    expect(screen.getByText('Agent Luna completed task.')).toBeInTheDocument();
  });

  it('displays "Clear All" button', () => {
    render(<NotificationCenterApp />);
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('prompts with confirmation dialog when "Clear All" is clicked', () => {
    render(<NotificationCenterApp />);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.getByRole('dialog', { name: /clear all notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to permanently delete all notifications/i)).toBeInTheDocument();
  });

  it('calls clearHistory when confirmation is made', () => {
    render(<NotificationCenterApp />);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i })); // Confirm button in dialog
    expect(mockClearHistory).toHaveBeenCalledTimes(1);
  });

  it('does not call clearHistory when cancellation is made', () => {
    render(<NotificationCenterApp />);
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i })); // Cancel button in dialog
    expect(mockClearHistory).not.toHaveBeenCalled();
  });

  it('renders "No new notifications." when there are no notifications', () => {
    (useNotification as vi.Mock).mockReturnValue({
      notifications: [],
      toastNotifications: [],
      addNotification: vi.fn(),
      clearHistory: mockClearHistory,
    });
    render(<NotificationCenterApp />);
    expect(screen.getByText('No new notifications.')).toBeInTheDocument();
  });

  it('disables "Clear All" button when there are no notifications', () => {
    (useNotification as vi.Mock).mockReturnValue({
      notifications: [],
      toastNotifications: [],
      addNotification: vi.fn(),
      clearHistory: mockClearHistory,
    });
    render(<NotificationCenterApp />);
    expect(screen.getByRole('button', { name: /clear all/i })).toBeDisabled();
  });
});