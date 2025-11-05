import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss: (id: string) => void;
}

const notificationVariants = {
  info: 'bg-blue-500/20 border-blue-500',
  success: 'bg-green-500/20 border-green-500',
  warning: 'bg-yellow-500/20 border-yellow-500',
  error: 'bg-red-500/20 border-red-500',
};

export const Notification: React.FC<NotificationProps> = ({ id, title, message, type = 'info', onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative w-full max-w-sm p-4 overflow-hidden rounded-lg shadow-lg border',
        notificationVariants[type]
      )}
    >
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-2 right-2 text-white/70 hover:text-white"
      >
        &times;
      </button>
      <h4 className="font-bold text-white">{title}</h4>
      <p className="text-white/90">{message}</p>
    </motion.div>
  );
};

export const NotificationCenter: React.FC<{ notifications: Omit<NotificationProps, 'onDismiss'>[]; onDismiss: (id: string) => void; }> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Notification key={notification.id} {...notification} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
} 
