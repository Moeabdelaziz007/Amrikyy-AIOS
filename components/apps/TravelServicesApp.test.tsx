import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// FIX: Changed default import to named import.
import TravelServicesApp from './TravelServicesApp';
import { useLanguage } from '../../contexts/LanguageContext';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { UserAccount } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  findCleaningServices: vi.fn(),
  findNightlifeEvents: vi.fn(),
  findDeliveryOptions: vi.fn(), // Renamed from fetchDeliveryOptions in component
}));

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) => {
    success({ coords: { latitude: 34.0522, longitude: -118.2437 } }); // Default mock location
  }),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('TravelServicesApp', () => {
  const mockOnOpenApp = vi.fn();
  const mockUserAccount: UserAccount = {
    osId: 'USER-123', name: 'Traveler', avatar: '✈️', tier: 'Pro', aiCredits: 1000, joinDate: '', trustScore: 100,
  };
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.findCleaningServices as vi.Mock).mockClear();
    (geminiAdvancedService.findNightlifeEvents as vi.Mock).mockClear();
    (geminiAdvancedService.findDeliveryOptions as vi.Mock).mockClear();
    mockGeolocation.getCurrentPosition.mockClear();

    // Reset geolocation mock to default success
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 34.0522, longitude: -118.2437 } });
    });
  });

  it('renders with "Cleaning" tab active by default', () => {
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    expect(screen.getByRole('button', { name: /cleaning/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /food delivery/i, pressed: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nightlife/i, pressed: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what kind of cleaning service do you need/i)).toBeInTheDocument();
  });

  it('fetches geolocation on mount', async () => {
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/current location/i)).toBeInTheDocument();
    });
  });

  it('displays geolocation error if permission is denied', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'User denied geolocation' });
    });
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    await waitFor(() => {
      expect(screen.getByText(/error_location/i)).toBeInTheDocument();
    });
  });

  it('finds cleaning services when "Find Services" is clicked', async () => {
    (geminiAdvancedService.findCleaningServices as vi.Mock).mockResolvedValue({
      aiSummary: 'Mock cleaning summary.',
      services: [{
        name: 'Sparkle Clean', type: 'Deep', priceRange: '$100-200', rating: 5, availability: 'Next Day',
        contact: '#', imageUrl: '#', reason: 'Best clean'
      }],
    });
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);

    const queryInput = screen.getByPlaceholderText(/what kind of cleaning service do you need/i);
    fireEvent.change(queryInput, { target: { value: 'deep clean' } });
    fireEvent.click(screen.getByRole('button', { name: /find services/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.findCleaningServices).toHaveBeenCalledWith(
        'deep clean',
        expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 })
      );
      expect(screen.getByText('Mock cleaning summary.')).toBeInTheDocument();
      expect(screen.getByText('Sparkle Clean')).toBeInTheDocument();
    });
  });

  it('shows loading state during cleaning service search', async () => {
    (geminiAdvancedService.findCleaningServices as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);

    const queryInput = screen.getByPlaceholderText(/what kind of cleaning service do you need/i);
    fireEvent.change(queryInput, { target: { value: 'window wash' } });
    fireEvent.click(screen.getByRole('button', { name: /find services/i }));

    await waitFor(() => {
      expect(screen.getByText(/loading_cleaning/i)).toBeInTheDocument();
    });
  });

  it('switches to "Food Delivery" tab', async () => {
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    fireEvent.click(screen.getByRole('button', { name: /food delivery/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what food are you craving/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find food/i })).toBeInTheDocument();
    });
  });

  it('finds food delivery options when "Find Food" is clicked', async () => {
    (geminiAdvancedService.findDeliveryOptions as vi.Mock).mockResolvedValue({
      aiSummary: 'Mock food summary.',
      options: [{
        name: 'Burger Joint', cuisine: 'American', rating: 4.0, deliveryTime: '20-30 min', priceLevel: '$$', isTrending: true,
        imageUrl: '#', address: '456 Burger Ave', website: '#', reason: 'Good burgers'
      }],
    });
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    fireEvent.click(screen.getByRole('button', { name: /food delivery/i }));

    const queryInput = screen.getByPlaceholderText(/what food are you craving/i);
    fireEvent.change(queryInput, { target: { value: 'burgers' } });
    fireEvent.click(screen.getByRole('button', { name: /find food/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.findDeliveryOptions).toHaveBeenCalledWith(
        'burgers',
        expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 })
      );
      expect(screen.getByText('Mock food summary.')).toBeInTheDocument();
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
    });
  });

  it('switches to "Nightlife" tab', async () => {
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    fireEvent.click(screen.getByRole('button', { name: /nightlife/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what kind of event are you looking for/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find events/i })).toBeInTheDocument();
    });
  });

  it('finds nightlife events when "Find Events" is clicked', async () => {
    (geminiAdvancedService.findNightlifeEvents as vi.Mock).mockResolvedValue({
      aiSummary: 'Mock nightlife summary.',
      events: [{
        name: 'Jazz Club', type: 'Live Music', description: 'Smooth jazz',
        location: 'Downtown', date: 'Tonight', time: '8 PM', reason: 'Relaxing atmosphere'
      }],
    });
    render(<TravelServicesApp onOpenApp={mockOnOpenApp} userAccount={mockUserAccount} />);
    fireEvent.click(screen.getByRole('button', { name: /nightlife/i }));

    const queryInput = screen.getByPlaceholderText(/what kind of event are you looking for/i);
    fireEvent.change(queryInput, { target: { value: 'jazz' } });
    fireEvent.click(screen.getByRole('button', { name: /find events/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.findNightlifeEvents).toHaveBeenCalledWith(
        'jazz',
        expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 })
      );
      expect(screen.getByText('Mock nightlife summary.')).toBeInTheDocument();
      expect(screen.getByText('Jazz Club')).toBeInTheDocument();
    });
  });
});