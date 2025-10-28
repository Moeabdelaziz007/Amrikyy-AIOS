import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemOverviewWidget from './SystemOverviewWidget';
import { UserAccount, CurrentWeather } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import WeatherDetailModal from './WeatherDetailModal'; // Import the actual modal for shallow rendering checks

// Mocking useLanguage hook
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mocking WeatherDetailModal
vi.mock('./WeatherDetailModal', () => ({
  default: vi.fn(() => null), // Mock as a component that renders null
}));

describe('SystemOverviewWidget', () => {
  const mockUserAccount: UserAccount = {
    osId: 'test-id',
    name: 'Test User',
    avatar: '🤖',
    tier: 'Pro',
    aiCredits: 5000,
    joinDate: '2023-01-01',
    trustScore: 90,
  };

  const mockCurrentWeather: CurrentWeather = {
    location: 'Test City',
    temp: 25,
    condition: 'Sunny',
    icon: 'sunny',
    high: 30,
    low: 18,
  };

  const mockT = vi.fn((key: string, options?: any) => {
    if (key === 'desktop.greeting.morning') return `Good morning, ${options.name}`;
    if (key === 'desktop.greeting.afternoon') return `Good afternoon, ${options.name}`;
    if (key === 'desktop.greeting.evening') return `Good evening, ${options.name}`;
    if (key === 'overview.plan') return `${options.tier} Plan`;
    if (key === 'overview.credits') return 'AI Credits';
    return key;
  });

  beforeEach(() => {
    // Reset the mock before each test
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    vi.useFakeTimers();
    // Set a consistent time for reproducible greetings
    vi.setSystemTime(new Date('2024-07-19T09:00:00.000Z')); // Morning time
    (WeatherDetailModal as vi.Mock).mockClear(); // Clear mock calls
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders user greeting, plan, credits, and current time', () => {
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={null} />);

    expect(screen.getByText('Good morning, Test User')).toBeInTheDocument();
    expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    expect(screen.getByText('AI Credits')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument(); // Formatted credits
    expect(screen.getByText(/09:00 AM/i)).toBeInTheDocument();
  });

  it('updates time every minute', () => { // Updated description
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={null} />);

    // Advance timers by less than a minute, time should not change visually
    vi.advanceTimersByTime(30000); // 30 seconds
    expect(screen.getByText(/09:00 AM/i)).toBeInTheDocument(); 

    // Advance timers by a full minute
    vi.advanceTimersByTime(30000); // 30 more seconds to make a full minute
    vi.setSystemTime(new Date('2024-07-19T09:01:00.000Z')); // Manually set for next minute check
    vi.advanceTimersByTime(1); // Advance by minimal time to trigger re-render if it runs on interval
    expect(screen.getByText(/09:01 AM/i)).toBeInTheDocument();
  });

  it('renders weather information if provided', () => {
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={mockCurrentWeather} />);

    expect(screen.getByText(/25°/)).toBeInTheDocument();
    expect(screen.getByLabelText(`Current weather: ${mockCurrentWeather.temp}° ${mockCurrentWeather.condition}`)).toBeInTheDocument();
    expect(screen.getByText('sunny')).toBeInTheDocument(); // material icon name
  });

  it('opens WeatherDetailModal when weather icon is clicked', async () => {
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={mockCurrentWeather} />);

    const weatherButton = screen.getByLabelText(`Current weather: ${mockCurrentWeather.temp}° ${mockCurrentWeather.condition}`);
    fireEvent.click(weatherButton);

    // WeatherDetailModal should be rendered with isOpen=true and correct weatherData
    await waitFor(() => {
        expect(WeatherDetailModal).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: true,
                weatherData: mockCurrentWeather,
            }),
            {} // Second arg is context/ref, typically empty in direct calls
        );
    });
  });

  it('shows "Good afternoon" for afternoon time', () => {
    vi.setSystemTime(new Date('2024-07-19T14:30:00.000Z')); // Afternoon time
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={null} />);
    expect(screen.getByText('Good afternoon, Test User')).toBeInTheDocument();
  });

  it('shows "Good evening" for evening time', () => {
    vi.setSystemTime(new Date('2024-07-19T19:00:00.000Z')); // Evening time
    render(<SystemOverviewWidget userAccount={mockUserAccount} currentWeather={null} />);
    expect(screen.getByText('Good evening, Test User')).toBeInTheDocument();
  });
});