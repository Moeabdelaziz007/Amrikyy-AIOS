import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import Toast, { ToastProps } from './Toast';
import { useNotifications, type Notification } from '../hooks/useNotifications';

export interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'top-right',
  className,
}) => {
  const { notifications, removeNotification } = useNotifications();

  const positionClasses = {
    'top-right': 'top-0 right-0 flex-col-reverse',
    'top-left': 'top-0 left-0 flex-col-reverse',
    'bottom-right': 'bottom-0 right-0 flex-col',
    'bottom-left': 'bottom-0 left-0 flex-col',
    'top-center': 'top-0 left-1/2 -translate-x-1/2 flex-col-reverse',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 md:max-w-md',
        positionClasses[position],
        className
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification: Notification) => (
          <Toast
            key={notification.id}
            {...notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
