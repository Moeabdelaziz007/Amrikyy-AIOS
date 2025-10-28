import { useState, useEffect, useRef } from 'react';

interface TimeZoneInfo {
  name: string;
  zone: string;
  color: string;
}

const TIME_ZONES: TimeZoneInfo[] = [
  { name: 'UTC', zone: 'UTC', color: 'bg-blue-500' },
  { name: 'New York', zone: 'America/New_York', color: 'bg-green-500' },
  { name: 'London', zone: 'Europe/London', color: 'bg-purple-500' },
  { name: 'Tokyo', zone: 'Asia/Tokyo', color: 'bg-red-500' },
  { name: 'Dubai', zone: 'Asia/Dubai', color: 'bg-yellow-500' },
  { name: 'Sydney', zone: 'Australia/Sydney', color: 'bg-pink-500' },
];

interface WorldClockProps {
  className?: string;
}

const WorldClock: React.FC<WorldClockProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatTime = (date: Date, timeZone: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatDate = (date: Date, timeZone: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const formatted = new Intl.DateTimeFormat('en-CA', options).format(date);
    return formatted; // Returns YYYY-MM-DD format
  };

  const getTimeOffset = (timeZone: string): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(currentTime);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || '';
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl">public</span>
            World Clock
          </h2>
          <button
            onClick={() => setIs24Hour(!is24Hour)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
            aria-label={`Switch to ${is24Hour ? '12' : '24'} hour format`}
          >
            {is24Hour ? '24-Hour' : '12-Hour'}
          </button>
        </div>

        {/* Time Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIME_ZONES.map((tz) => {
            const time = formatTime(currentTime, tz.zone);
            const date = formatDate(currentTime, tz.zone);
            const offset = getTimeOffset(tz.zone);

            return (
              <div
                key={tz.zone}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg"
              >
                {/* City Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${tz.color} shadow-lg`}></div>
                  <h3 className="text-xl font-bold text-white">{tz.name}</h3>
                </div>

                {/* Time Display */}
                <div className="mb-2">
                  <div className="text-4xl font-mono font-bold text-white tabular-nums">
                    {time}
                  </div>
                </div>

                {/* Date and Offset */}
                <div className="flex flex-col gap-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span className="font-mono">{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>{offset}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Last updated: {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default WorldClock;
