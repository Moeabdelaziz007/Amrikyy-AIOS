import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// FIX: Changed default import to named import.
import NexusGoApp from './NexusGoApp';
import { useLanguage } from '../../contexts/LanguageContext';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { DeliveryOption, RideOption, FastFoodRestaurant } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  findDeliveryOptions: vi.fn(),
  getRideOptions: vi.fn(),
}));

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success, error) => {
    success({ coords: { latitude: 34.0522, longitude: -118.2437 } }); // Default mock location
  }),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('NexusGoApp', () => {
  const mockOnOpenApp = vi.fn();
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.findDeliveryOptions as vi.Mock).mockClear();
    (geminiAdvancedService.getRideOptions as vi.Mock).mockClear();
    mockGeolocation.getCurrentPosition.mockClear();

    // Reset geolocation mock to default success
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 34.0522, longitude: -118.2437 } });
    });
  });

  it('renders with "Delivery" tab active by default', () => {
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    expect(screen.getByRole('button', { name: /delivery/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rides/i, pressed: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what are you craving/i)).toBeInTheDocument();
  });

  it('fetches geolocation on mount', async () => {
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/current location/i)).toBeInTheDocument();
    });
  });

  it('displays geolocation error if permission is denied', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'User denied geolocation' });
    });
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    await waitFor(() => {
      expect(screen.getByText(/error_location/i)).toBeInTheDocument(); // from mockT
    });
  });

  it('finds delivery options when "Find Options" is clicked', async () => {
    (geminiAdvancedService.findDeliveryOptions as vi.Mock).mockResolvedValue({
      aiSummary: 'Mock delivery summary.',
      options: [{
        name: 'Pizza Place', cuisine: 'Italian', rating: 4.5, deliveryTime: '30-40 min', priceLevel: '$$', isTrending: true,
        imageUrl: '#', address: '123 Pizza St', website: '#', reason: 'Best pizza'
      }],
    });
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);

    const queryInput = screen.getByPlaceholderText(/what are you craving/i);
    fireEvent.change(queryInput, { target: { value: 'pizza' } });
    fireEvent.click(screen.getByRole('button', { name: /find options/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.findDeliveryOptions).toHaveBeenCalledWith(
        'pizza',
        expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 })
      );
      expect(screen.getByText('Mock delivery summary.')).toBeInTheDocument();
      expect(screen.getByText('Pizza Place')).toBeInTheDocument();
    });
  });

  it('shows loading state during delivery search', async () => {
    (geminiAdvancedService.findDeliveryOptions as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);

    const queryInput = screen.getByPlaceholderText(/what are you craving/i);
    fireEvent.change(queryInput, { target: { value: 'sushi' } });
    fireEvent.click(screen.getByRole('button', { name: /find options/i }));

    await waitFor(() => {
      expect(screen.getByText(/loading_delivery/i)).toBeInTheDocument();
    });
  });

  it('switches to "Rides" tab', async () => {
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /rides/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/where do you want to go/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find options/i })).toBeInTheDocument();
    });
  });

  it('gets ride options when "Find Options" is clicked in Rides tab', async () => {
    (geminiAdvancedService.getRideOptions as vi.Mock).mockResolvedValue({
      aiSummary: 'Mock ride summary.',
      options: [{
        service: 'MockRide', estimatedCost: '$10', estimatedTime: '5 min',
        currency: 'USD', surgePricing: false, eta: '2 min', providerLogo: '#'
      }],
    });
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /rides/i }));

    const destinationInput = screen.getByPlaceholderText(/where do you want to go/i);
    fireEvent.change(destinationInput, { target: { value: 'airport' } });
    fireEvent.click(screen.getByRole('button', { name: /find options/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.getRideOptions).toHaveBeenCalledWith(
        'airport',
        expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 })
      );
      expect(screen.getByText('Mock ride summary.')).toBeInTheDocument();
      expect(screen.getByText('MockRide')).toBeInTheDocument();
    });
  });

  it('shows loading state during ride search', async () => {
    (geminiAdvancedService.getRideOptions as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<NexusGoApp onOpenApp={mockOnOpenApp} />);
    fireEvent.click(screen.getByRole('button', { name: /rides/i }));

    const destinationInput = screen.getByPlaceholderText(/where do you want to go/i);
    fireEvent.change(destinationInput, { target: { value: 'mall' } });
    fireEvent.click(screen.getByRole('button', { name: /find options/i }));

    await waitFor(() => {
      expect(screen.getByText(/loading_rides/i)).toBeInTheDocument();
    });
  });
});