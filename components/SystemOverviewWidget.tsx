import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserAccount, CurrentWeather } from '../types';
import WeatherDetailModal from './WeatherDetailModal'; // New: Import WeatherDetailModal

/**
 * Props for the SystemOverviewWidget component.
 */
interface SystemOverviewWidgetProps {
    /** The current user account details. */
    userAccount: UserAccount;
    /** The current weather conditions, or null if not available. */
    currentWeather: CurrentWeather | null;
}

/**
 * The SystemOverviewWidget displays a personalized greeting, current time,
 * user's AI credit balance, and current weather conditions.
 * It also provides a way to view detailed weather information.
 * @param {SystemOverviewWidgetProps} props - The component props.
 * @returns {JSX.Element} The SystemOverviewWidget component.
 */
const SystemOverviewWidget: React.FC<SystemOverviewWidgetProps> = ({ userAccount, currentWeather }) => {
    const { t } = useLanguage();
    const [time, setTime] = useState(new Date());
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false); // New state for modal

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000); // Update every second
        return () => clearInterval(timerId);
    }, []);

    /**
     * Generates a time-based greeting (Good morning, afternoon, evening) for the user.
     * @returns {string} The personalized greeting string.
     */
    const getGreeting = () => {
        const hour = time.getHours();
        const name = userAccount.name || 'User';
        if (hour < 12) return t('desktop.greeting.morning', { name });
        if (hour < 18) return t('desktop.greeting.afternoon', { name });
        return t('desktop.greeting.evening', { name });
    };

    return (
        <div className="w-full max-w-4xl glass-effect rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up" role="region" aria-label="System Overview">
            <div className="flex items-center gap-4">
                 <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 hidden sm:flex items-center justify-center text-3xl bg-black/20">
                    {userAccount.avatar || '👩‍🚀'}
                 </div>
                 <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display">{getGreeting()}</h1>
                    <p className="text-sm sm:text-base opacity-80">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                 <div className="text-center">
                    <p className="text-xs opacity-70">{t('overview.plan', { tier: userAccount.tier })}</p>
                    <p className="font-semibold text-green-400 flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Active
                    </p>
                </div>
                 <div className="text-center">
                    <p className="text-xs opacity-70">{t('overview.credits')}</p>
                    <p className="font-semibold text-cyan-400">{userAccount.aiCredits.toLocaleString()}</p>
                </div>
                {currentWeather && (
                    <button 
                        onClick={() => setIsWeatherModalOpen(true)} // Open modal on click
                        className="flex items-center gap-2 text-xl sm:text-2xl font-bold font-mono text-[var(--accent-color)] text-right hover:text-white transition-colors"
                        aria-label={`Current weather: ${currentWeather.temp}° ${currentWeather.condition}`}
                    >
                        <span className="material-symbols-outlined text-3xl">{currentWeather.icon}</span>
                        <span>{currentWeather.temp}°</span>
                    </button>
                )}
                <div className="text-3xl sm:text-5xl font-bold font-mono text-[var(--accent-color)] text-right">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {currentWeather && (
                <WeatherDetailModal
                    isOpen={isWeatherModalOpen}
                    onClose={() => setIsWeatherModalOpen(false)}
                    weatherData={currentWeather}
                />
            )}
        </div>
    );
};

export default SystemOverviewWidget;