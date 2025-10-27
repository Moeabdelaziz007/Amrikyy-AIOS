import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationCenterIcon } from '../Icons';
import { Notification } from '../../types';
import ConfirmationDialog from '../ConfirmationDialog';

const NotificationCenterApp: React.FC = () => {
    const { notifications, clearHistory } = useNotification();
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    
    const categoryStyles: Record<Notification['category'], {icon: string, color: string}> = {
        'System': { icon: 'settings', color: 'text-cyan-400' },
        'Agent': { icon: 'smart_toy', color: 'text-purple-400' },
        'App': { icon: 'apps', color: 'text-green-400' },
    };

    const handleConfirmClear = () => {
        clearHistory();
        setIsConfirmingClear(false);
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <NotificationCenterIcon className="w-8 h-8 text-primary-cyan"/>
                    <h1 className="font-display text-2xl font-bold">Notification Center</h1>
                </div>
                <button onClick={() => setIsConfirmingClear(true)} disabled={notifications.length === 0} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">
                    Clear All
                </button>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted text-center">
                        <span className="material-symbols-outlined text-5xl mb-2">notifications_off</span>
                        <p>No new notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notification => {
                            const styles = categoryStyles[notification.category] || categoryStyles['System'];
                            return (
                                <div key={notification.id} className="bg-black/20 p-3 rounded-lg flex items-start gap-3 border border-border-color">
                                    <span className={`material-symbols-outlined text-xl ${styles.color}`}>{styles.icon}</span>
                                    <div className="flex-grow">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-text-muted mt-1">{new Date(notification.id).toLocaleTimeString()}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <ConfirmationDialog
                isOpen={isConfirmingClear}
                onClose={() => setIsConfirmingClear(false)}
                onConfirm={handleConfirmClear}
                title="Clear All Notifications"
                message="Are you sure you want to permanently delete all notifications? This action cannot be undone."
            />
        </div>
    );
};

export default NotificationCenterApp;
