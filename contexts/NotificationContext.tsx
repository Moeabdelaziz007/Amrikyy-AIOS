import React, { createContext, useState, useContext, useCallback } from 'react';
import { Notification } from '../types';

/**
 * Defines the shape of the context object provided by `NotificationContext`.
 */
interface NotificationContextType {
  /** An array of all historical notifications. */
  notifications: Notification[];
  /** An array of currently active "toast" notifications (short-lived, auto-dismissing). */
  toastNotifications: Notification[];
  /**
   * Function to add a new notification to both the history and as a toast.
   * @param {string} message - The message content of the notification.
   * @param {Notification['type']} type - The type of notification ('success', 'info', 'error', 'system').
   * @param {Notification['category']} [category='System'] - The category of the notification. Defaults to 'System'.
   */
  addNotification: (message: string, type: Notification['type'], category?: Notification['category']) => void;
  /** Function to clear all historical notifications. */
  clearHistory: () => void;
}

/**
 * React Context for managing application notifications.
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provides notification context to its children.
 * Manages both persistent historical notifications and transient toast notifications.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @returns {JSX.Element} The NotificationProvider component.
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  /**
   * Adds a new notification to both the main notification history and as a temporary toast notification.
   * Toast notifications are automatically dismissed after 4 seconds.
   * @param {string} message - The message content of the notification.
   * @param {Notification['type']} type - The type of notification ('success', 'info', 'error', 'system').
   * @param {Notification['category']} [category='System'] - The category of the notification. Defaults to 'System'.
   */
  const addNotification = useCallback((message: string, type: Notification['type'], category: Notification['category'] = 'System') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      category,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setToastNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 4000); // Auto-dismiss toast after 4 seconds
  }, []);

  /**
   * Clears all historical notifications from the `notifications` state.
   */
  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, toastNotifications, addNotification, clearHistory }}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to access the notification context.
 * This hook provides a convenient way for components to interact with the notification system,
 * allowing them to add new notifications and access the current lists of notifications.
 * @returns {NotificationContextType} The current notification context, including historical
 *   and toast notifications, and functions to add/clear them.
 * @throws {Error} If `useNotification` is not used within a `NotificationProvider`.
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};