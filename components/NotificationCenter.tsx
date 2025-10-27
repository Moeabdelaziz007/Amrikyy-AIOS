import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Notification } from '../types';

const notificationStyles: Record<Notification['type'], { icon: string; classes: string }> = {
    success: { icon: 'check_circle', classes: 'bg-green-500/30 text-green-300' },
    info: { icon: 'info', classes: 'bg-blue-500/30 text-blue-300' },
    error: { icon: 'error', classes: 'bg-red-500/30 text-red-300' },
    system: { icon: 'settings_suggest', classes: 'bg-purple-500/30 text-purple-300' },
};

export const NotificationCenter: React.FC = () => {
    const { toastNotifications } = useNotification();

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3">
            {toastNotifications.map(notification => {
                const style = notificationStyles[notification.type] || notificationStyles.info;
                return (
                    <div
                        key={notification.id}
                        className="glass-effect rounded-xl p-4 flex items-center gap-3 animate-slide-in-right shadow-lg border border-white/10"
                    >
                        <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${style.classes}`}>
                            <span className="material-symbols-outlined text-xl">{style.icon}</span>
                        </div>
                        <p className="text-sm font-medium text-white/90">{notification.message}</p>
                    </div>
                )
            })}
        </div>
    );
};