import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TravelPlanViewerApp from './TravelPlanViewerApp';
import { TravelPlan } from '../../types';

describe('TravelPlanViewerApp', () => {
  const mockTravelPlan: TravelPlan = {
    destination: 'Paris, France',
    tripTitle: 'Romantic Parisian Getaway',
    itinerary: [
      { day: 1, title: 'Arrival & Eiffel Tower', activities: ['Check into hotel', 'Visit Eiffel Tower', 'Dinner cruise on Seine'] },
      { day: 2, title: 'Museum & Art', activities: ['Louvre Museum', 'Stroll Montmartre', 'Evening cabaret'] },
    ],
    budget: [
      { category: 'Flights', cost: 1200 },
      { category: 'Accommodation', cost: 800 },
      { category: 'Activities', cost: 500 },
      { category: 'Food', cost: 400 },
    ],
    dealsAndLinks: [
      { title: 'Best Hotels in Paris', url: 'https://example.com/hotels' },
      { title: 'Paris Metro Map', url: 'https://example.com/metro' },
    ],
  };

  const mockOnShare = vi.fn();

  beforeEach(() => {
    mockOnShare.mockClear();
  });

  it('renders "No travel plan available" if no plan is provided', () => {
    // @ts-ignore - Intentionally passing null for test case
    render(<TravelPlanViewerApp plan={null} onShare={mockOnShare} />);
    expect(screen.getByText('No travel plan available.')).toBeInTheDocument();
  });

  it('renders travel plan details correctly', () => {
    render(<TravelPlanViewerApp plan={mockTravelPlan} onShare={mockOnShare} />);

    expect(screen.getByText('Romantic Parisian Getaway')).toBeInTheDocument();
    expect(screen.getByText('Your personalized AI-generated travel plan to Paris, France')).toBeInTheDocument();

    // Itinerary
    expect(screen.getByText('Itinerary')).toBeInTheDocument();
    expect(screen.getByText('Day 1: Arrival & Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Visit Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Day 2: Museum & Art')).toBeInTheDocument();
    expect(screen.getByText('Louvre Museum')).toBeInTheDocument();

    // Budget
    expect(screen.getByText('Budget Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$2,900')).toBeInTheDocument(); // 1200+800+500+400

    // Deals & Links
    expect(screen.getByText('Deals & Links')).toBeInTheDocument();
    expect(screen.getByText('Best Hotels in Paris')).toBeInTheDocument();
    expect(screen.getByText('Paris Metro Map')).toBeInTheDocument();
  });

  it('calls onShare with correct content when Share button is clicked', () => {
    render(<TravelPlanViewerApp plan={mockTravelPlan} onShare={mockOnShare} />);
    
    const shareButton = screen.getByLabelText('Share this plan');
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledTimes(1);
    expect(mockOnShare).toHaveBeenCalledWith({
      type: 'travel_plan',
      title: mockTravelPlan.tripTitle,
      subtitle: `An AI-planned adventure to ${mockTravelPlan.destination}.`,
      cta: 'Explore My AI-Generated Trip',
    });
  });

  it('links in Deals & Links section have correct attributes', () => {
    render(<TravelPlanViewerApp plan={mockTravelPlan} onShare={mockOnShare} />);
    const hotelLink = screen.getByText('Best Hotels in Paris');
    expect(hotelLink).toHaveAttribute('href', 'https://example.com/hotels');
    expect(hotelLink).toHaveAttribute('target', '_blank');
    expect(hotelLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});