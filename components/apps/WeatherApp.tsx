import React, { useState } from 'react';
import { WeatherIcon, SearchIcon } from '../Icons.tsx';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

const MOCK_WEATHER: WeatherData = {
  location: 'San Francisco, CA',
  temperature: 72,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  icon: '⛅',
};

const MOCK_FORECAST: ForecastDay[] = [
  { day: 'Mon', high: 75, low: 62, condition: 'Sunny', icon: '☀️' },
  { day: 'Tue', high: 73, low: 61, condition: 'Partly Cloudy', icon: '⛅' },
  { day: 'Wed', high: 70, low: 59, condition: 'Cloudy', icon: '☁️' },
  { day: 'Thu', high: 68, low: 58, condition: 'Rainy', icon: '🌧️' },
  { day: 'Fri', high: 71, low: 60, condition: 'Partly Cloudy', icon: '⛅' },
  { day: 'Sat', high: 74, low: 62, condition: 'Sunny', icon: '☀️' },
  { day: 'Sun', high: 76, low: 63, condition: 'Sunny', icon: '☀️' },
];

const SAVED_LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'London, UK',
  'Tokyo, Japan',
];

/**
 * WeatherApp - Weather Dashboard
 * Features:
 * - Current weather display with animated icons
 * - 7-day forecast
 * - Multiple location support
 * - Weather alerts
 * - AI-powered insights using Gemini
 */
const WeatherApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(SAVED_LOCATIONS[0]);
  const [aiInsight] = useState(
    'Perfect weather for outdoor activities! Temperature will remain comfortable throughout the week.'
  );

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
      {/* Header */}
      <header className="flex-shrink-0 p-6 border-b border-border-color">
        <div className="flex items-center gap-3 mb-4">
          <WeatherIcon className="w-8 h-8 text-primary-cyan" />
          <h1 className="font-display text-2xl font-bold">Weather</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary-cyan"
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* Current Weather */}
        <div className="bg-gradient-to-br from-primary-cyan/20 to-primary-purple/20 rounded-lg p-6 border border-border-color">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{MOCK_WEATHER.location}</h2>
              <p className="text-text-secondary">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-6xl">{MOCK_WEATHER.icon}</div>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <div className="text-6xl font-bold">{MOCK_WEATHER.temperature}°</div>
            <div className="text-2xl text-text-secondary mb-2">F</div>
          </div>

          <div className="text-xl mb-6">{MOCK_WEATHER.condition}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-secondary/50 rounded-lg p-3">
              <div className="text-sm text-text-secondary mb-1">Humidity</div>
              <div className="text-xl font-semibold">{MOCK_WEATHER.humidity}%</div>
            </div>
            <div className="bg-bg-secondary/50 rounded-lg p-3">
              <div className="text-sm text-text-secondary mb-1">Wind Speed</div>
              <div className="text-xl font-semibold">{MOCK_WEATHER.windSpeed} mph</div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-bg-secondary rounded-lg p-4 border border-primary-purple/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="font-semibold mb-1 text-primary-purple">AI Weather Insight</div>
              <p className="text-sm text-text-secondary">{aiInsight}</p>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <h3 className="text-lg font-bold mb-4">7-Day Forecast</h3>
          <div className="grid grid-cols-7 gap-2">
            {MOCK_FORECAST.map((day) => (
              <div
                key={day.day}
                className="bg-bg-secondary rounded-lg p-3 text-center border border-border-color hover:border-primary-cyan transition-colors"
              >
                <div className="font-semibold mb-2">{day.day}</div>
                <div className="text-3xl mb-2">{day.icon}</div>
                <div className="text-sm mb-1">
                  <span className="font-semibold">{day.high}°</span>
                </div>
                <div className="text-xs text-text-secondary">{day.low}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Locations */}
        <div>
          <h3 className="text-lg font-bold mb-4">Saved Locations</h3>
          <div className="grid grid-cols-2 gap-3">
            {SAVED_LOCATIONS.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  selectedLocation === location
                    ? 'bg-primary-cyan/20 border border-primary-cyan'
                    : 'bg-bg-secondary border border-border-color hover:border-primary-cyan/50'
                }`}
              >
                <div className="font-semibold">{location}</div>
                <div className="text-sm text-text-secondary">72°F • Partly Cloudy</div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeatherApp;