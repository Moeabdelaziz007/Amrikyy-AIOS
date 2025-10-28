import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationCenter } from './NotificationCenter';
import { useNotification } from '../contexts/NotificationContext';
import { Notification } from '../types';

// Mock the useNotification hook
vi.mock('../contexts/NotificationContext', () => ({
  useNotification: vi.fn(),
}));

describe('NotificationCenter', () => {
  const mockNotifications: Notification[] = [
    { id: 1, message: 'Success message', type: 'success', category: 'System' },
    { id: 2, message: 'Info message', type: 'info', category: 'Agent' },
    { id: 3, message: 'Error message', type: 'error', category: 'App' },
  ];

  beforeEach(() => {
    (useNotification as vi.Mock).mockReturnValue({
      notifications: [], // Not directly used by NotificationCenter
      toastNotifications: mockNotifications,
      addNotification: vi.fn(),
      clearHistory: vi.fn(),
    });
    vi.useFakeTimers(); // Use fake timers to control auto-dismissal if needed
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders all toast notifications provided by the context', () => {
    render(<NotificationCenter />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies correct styling and icon for "success" type notification', () => {
    render(<NotificationCenter />);
    const successNotification = screen.getByText('Success message').closest('div');
    expect(successNotification).toHaveClass('bg-green-500/30');
    expect(successNotification).toHaveClass('text-green-300');
    expect(successNotification?.querySelector('.material-symbols-outlined')).toHaveTextContent('check_circle');
  });

  it('applies correct styling and icon for "info" type notification', () => {
    render(<NotificationCenter />);
    const infoNotification = screen.getByText('Info message').closest('div');
    expect(infoNotification).toHaveClass('bg-blue-500/30');
    expect(infoNotification).toHaveClass('text-blue-300');
    expect(infoNotification?.querySelector('.material-symbols-outlined')).toHaveTextContent('info');
  });

  it('applies correct styling and icon for "error" type notification', () => {
    render(<NotificationCenter />);
    const errorNotification = screen.getByText('Error message').closest('div');
    expect(errorNotification).toHaveClass('bg-red-500/30');
    expect(errorNotification).toHaveClass('text-red-300');
    expect(errorNotification?.querySelector('.material-symbols-outlined')).toHaveTextContent('error');
  });

  it('renders no notifications when toastNotifications array is empty', () => {
    (useNotification as vi.Mock).mockReturnValue({
      notifications: [],
      toastNotifications: [], // Empty array
      addNotification: vi.fn(),
      clearHistory: vi.fn(),
    });
    render(<NotificationCenter />);
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('notifications have correct ARIA attributes', () => {
    render(<NotificationCenter />);
    const successNotification = screen.getByText('Success message').closest('div');
    expect(successNotification).toHaveAttribute('role', 'status');
    expect(successNotification).toHaveAttribute('aria-label', 'success notification: Success message');
  });

  // Note: Auto-dismissal logic is handled in the `NotificationProvider` and
  // would require mocking `setToastNotifications` and advancing timers to verify.
  // This test focuses on the `NotificationCenter` component's rendering of `toastNotifications` prop.
});