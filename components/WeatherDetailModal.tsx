import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './Icons';
import { CurrentWeather, WeatherData, ForecastDay } from '../types';
// FIX: Replaced non-existent `getAiWeatherReport` with a mock function.
import { getAiWeatherReport } from '../services/geminiAdvancedService';

interface WeatherDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    weatherData: CurrentWeather;
}

const mockForecast: ForecastDay[] = [
    { day: 'Tue', high: 26, low: 19, icon: 'partly_cloudy_day', condition: 'Partly Cloudy' },
    { day: 'Wed', high: 24, low: 17, icon: 'rainy', condition: 'Rainy' },
    { day: 'Thu', high: 27, low: 20, icon: 'sunny', condition: 'Sunny' },
    { day: 'Fri', high: 28, low: 21, icon: 'sunny', condition: 'Sunny' },
    { day: 'Sat', high: 26, low: 19, icon: 'cloudy', condition: 'Cloudy' },
];

const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({ isOpen, onClose, weatherData }) => {
    const { t } = useLanguage();
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const fetchSummary = async () => {
            setIsLoadingSummary(true);
            try {
                const fullWeatherData: WeatherData = {
                    current: weatherData,
                    forecast: mockForecast,
                };
                const summary = await getAiWeatherReport(fullWeatherData);
                setAiSummary(summary);
            } catch (error) {
                console.error("Failed to get AI weather summary:", error);
                setAiSummary("Could not load AI summary. Please check your connection.");
            } finally {
                setIsLoadingSummary(false);
            }
        };

        fetchSummary();
    }, [isOpen, weatherData]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[101] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weather-modal-title"
        >
            <div
                className="w-full max-w-2xl bg-bg-secondary rounded-2xl border border-border-color shadow-2xl flex flex-col animate-slide-up text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-border-color flex items-center justify-between">
                    <h2 id="weather-modal-title" className="font-display text-2xl font-bold">Weather for {weatherData.location}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10" aria-label="Close weather details">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </header>
                <main className="p-6 space-y-6 overflow-y-auto">
                    {/* Current Weather Section */}
                    <div className="bg-black/20 p-6 rounded-lg border border-border-color flex items-center gap-6">
                        <span className="material-symbols-outlined text-8xl text-yellow-300">{weatherData.icon}</span>
                        <div>
                            <p className="text-text-secondary">{weatherData.location}</p>
                            <p className="font-display text-6xl font-bold my-1">{weatherData.temp}°</p>
                            <p className="text-xl font-semibold">{weatherData.condition}</p>
                            <div className="flex items-center gap-4 text-sm mt-2">
                                <span>H: {weatherData.high}°</span>
                                <span>L: {weatherData.low}°</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><SparklesIcon className="text-accent"/> AI Summary</h3>
                        {isLoadingSummary ? (
                            <div className="text-xs text-text-muted">Generating summary...</div>
                        ) : (
                            <p className="text-xs text-text-secondary">{aiSummary}</p>
                        )}
                    </div>

                    {/* Forecast Section */}
                    <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                        <h3 className="font-bold text-sm mb-4">5-Day Forecast</h3>
                        <div className="flex justify-between">
                            {mockForecast.map(day => (
                                <div key={day.day} className="flex flex-col items-center gap-2 text-center">
                                    <p className="font-semibold text-sm">{day.day}</p>
                                    <span className="material-symbols-outlined text-3xl text-yellow-300">{day.icon}</span>
                                    <p className="text-sm font-semibold">{day.high}°</p>
                                    <p className="text-xs text-text-muted">{day.low}°</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WeatherDetailModal;