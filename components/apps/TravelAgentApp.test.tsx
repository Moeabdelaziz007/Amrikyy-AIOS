import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TravelAgentApp from './TravelAgentApp';

describe('TravelAgentApp', () => {
  const mockStartTravelWorkflow = vi.fn();

  beforeEach(() => {
    mockStartTravelWorkflow.mockClear();
  });

  it('renders with "Plan Trip" tab active by default', () => {
    render(<TravelAgentApp startTravelWorkflow={mockStartTravelWorkflow} />);
    expect(screen.getByRole('button', { name: /plan trip/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Plan Your Next Adventure')).toBeInTheDocument();
  });

  it('switches tabs correctly when buttons are clicked', () => {
    render(<TravelAgentApp startTravelWorkflow={mockStartTravelWorkflow} />);

    // Switch to Explore Places
    fireEvent.click(screen.getByRole('button', { name: /explore places/i }));
    expect(screen.getByText('Explore Places')).toBeInTheDocument();
    expect(screen.getByText(/this feature is under construction/i)).toBeInTheDocument();

    // Switch to Find Deals
    fireEvent.click(screen.getByRole('button', { name: /find deals/i }));
    expect(screen.getByText('Find Deals')).toBeInTheDocument();
    expect(screen.getByText(/get ready to find the best travel deals/i)).toBeInTheDocument();

    // Switch to My Plans
    fireEvent.click(screen.getByRole('button', { name: /my plans/i }));
    expect(screen.getByText('My Saved Plans')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Adventure in Tokyo')).toBeInTheDocument();
  });

  it('allows user to input trip details and create a trip', () => {
    render(<TravelAgentApp startTravelWorkflow={mockStartTravelWorkflow} />);

    const destinationInput = screen.getByLabelText(/destination/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const budgetSlider = screen.getByLabelText(/budget: \$.*/i);
    const createTripButton = screen.getByRole('button', { name: /create trip with ai/i });

    fireEvent.change(destinationInput, { target: { value: 'Rome' } });
    fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-07' } });
    fireEvent.change(budgetSlider, { target: { value: '3000' } }); // Simulate setting budget

    fireEvent.click(createTripButton);

    expect(mockStartTravelWorkflow).toHaveBeenCalledTimes(1);
    expect(mockStartTravelWorkflow).toHaveBeenCalledWith({
      destination: 'Rome',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      budget: '3000',
    });
  });

  it('shows alert if required fields are not filled before creating trip', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<TravelAgentApp startTravelWorkflow={mockStartTravelWorkflow} />);

    const createTripButton = screen.getByRole('button', { name: /create trip with ai/i });
    fireEvent.click(createTripButton); // Try to create with empty fields

    expect(alertSpy).toHaveBeenCalledWith('Please fill out all fields before creating a trip.');
    expect(mockStartTravelWorkflow).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('displays mock plans in "My Plans" tab', () => {
    render(<TravelAgentApp startTravelWorkflow={mockStartTravelWorkflow} />);
    fireEvent.click(screen.getByRole('button', { name: /my plans/i }));

    expect(screen.getByText('Cyberpunk Adventure in Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Ancient Wonders of Rome')).toBeInTheDocument();
    expect(screen.getByText('Relaxing Beach Getaway in Bali')).toBeInTheDocument();
    expect(screen.getByText('Your future plans will appear here.')).toBeInTheDocument();
  });
});