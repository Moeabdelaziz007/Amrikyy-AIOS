import React, { useState, useEffect } from 'react';
import { WeatherIcon, SettingsIcon, NotificationCenterIcon, NexusProfileIcon } from './Icons.tsx';

interface DesktopHeaderProps {
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  notificationCount?: number;
}

/**
 * DesktopHeader - Top bar for desktop with system info
 * Displays current time, date, weather, and quick access to settings
 */
const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onOpenSettings,
  onOpenNotifications,
  onOpenProfile,
  notificationCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-bg-secondary/80 backdrop-blur-md border-b border-border-color z-50 flex items-center justify-between px-4">
      {/* Left section - Logo/Brand */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <span className="font-display font-bold text-white text-sm">Amrikyy AI OS</span>
      </div>

      {/* Center section - Time and Date */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{formatTime(currentTime)}</span>
          <span className="text-text-secondary">•</span>
          <span className="text-text-secondary">{formatDate(currentTime)}</span>
        </div>
      </div>

      {/* Right section - Quick actions */}
      <div className="flex items-center gap-2">
        {/* Weather mini widget */}
        <button
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-bg-tertiary transition-colors"
          title="Weather"
        >
          <WeatherIcon className="w-4 h-4 text-primary-cyan" />
          <span className="text-xs text-text-secondary">72°F</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded hover:bg-bg-tertiary transition-colors"
          title="Notifications"
        >
          <NotificationCenterIcon className="w-5 h-5 text-text-secondary hover:text-white" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded hover:bg-bg-tertiary transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5 text-text-secondary hover:text-white" />
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-tertiary transition-colors"
          title="Profile"
        >
          <NexusProfileIcon className="w-5 h-5 text-primary-purple" />
          <span className="text-xs text-text-secondary">User</span>
        </button>
      </div>
    </div>
  );
};

export default DesktopHeader;