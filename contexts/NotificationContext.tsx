import React, { createContext, useState, useContext, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  toastNotifications: Notification[];
  addNotification: (message: string, type: Notification['type'], category?: Notification['category']) => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

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

  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, toastNotifications, addNotification, clearHistory }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};