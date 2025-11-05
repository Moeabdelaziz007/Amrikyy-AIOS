import React, { useState } from 'react';
import { WeatherIcon, SearchIcon, SparklesIcon } from '../Icons';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

const WeatherApp: React.FC = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!location.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using free OpenWeatherMap API as an alternative to Google Weather
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo'}`
      );
      
      if (!response.ok) {
        throw new Error('Location not found or API error');
      }
      
      const data = await response.json();
      
      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo'}`
      );
      
      const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
      
      setWeatherData({
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        feelsLike: Math.round(data.main.feels_like),
        forecast: forecastData?.list
          ? forecastData.list
              .filter((_: any, index: number) => index % 8 === 0) // Get one per day
              .slice(0, 5)
              .map((item: any) => ({
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                high: Math.round(item.main.temp_max),
                low: Math.round(item.main.temp_min),
                condition: item.weather[0].main,
              }))
          : [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Smoke: '💨',
      Haze: '🌫️',
      Dust: '💨',
      Fog: '🌫️',
    };
    return icons[condition] || '🌡️';
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 rounded-b-md text-white overflow-y-auto">
      <header className="flex-shrink-0 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className="w-10 h-10 text-yellow-300" />
            <div>
              <h1 className="font-display text-2xl font-bold">Weather</h1>
              <p className="text-sm text-blue-200">Powered by OpenWeather</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              placeholder="Enter city name..."
              className="w-full h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-11 pr-4 text-white placeholder-blue-200 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchWeather}
            disabled={isLoading || !location.trim()}
            className="h-12 px-6 font-bold rounded-lg bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </div>
      </header>

      <main className="flex-grow p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!weatherData && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-8xl mb-6">🌍</div>
            <h2 className="text-2xl font-bold mb-2">Search for Weather</h2>
            <p className="text-blue-200 max-w-md">
              Enter a city name to get current weather conditions and a 5-day forecast
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
            <p className="text-lg">Fetching weather data...</p>
          </div>
        )}

        {weatherData && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Weather */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{weatherData.location}</h2>
                  <p className="text-xl text-blue-200">{weatherData.condition}</p>
                </div>
                <div className="text-8xl">{getWeatherIcon(weatherData.condition)}</div>
              </div>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-7xl font-bold">{weatherData.temperature}°</span>
                <span className="text-3xl text-blue-200">C</span>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">Feels Like</p>
                  <p className="text-2xl font-bold">{weatherData.feelsLike}°C</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">Humidity</p>
                  <p className="text-2xl font-bold">{weatherData.humidity}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">Wind Speed</p>
                  <p className="text-2xl font-bold">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {weatherData.forecast.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-3">
                  {weatherData.forecast.map((day, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors"
                    >
                      <p className="text-sm font-semibold mb-2">{day.day}</p>
                      <div className="text-4xl my-2">{getWeatherIcon(day.condition)}</div>
                      <p className="text-xs text-blue-200 mb-1">{day.condition}</p>
                      <div className="flex justify-center gap-2 text-sm">
                        <span className="font-bold">{day.high}°</span>
                        <span className="text-blue-300">{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherApp;
