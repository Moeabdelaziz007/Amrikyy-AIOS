import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WorldClock from './WorldClock';

describe('WorldClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<WorldClock />);
    expect(screen.getByText('World Clock')).toBeInTheDocument();
  });

  it('displays all time zones', () => {
    render(<WorldClock />);
    
    // Use heading role to find the time zone names specifically
    const timeZones = ['UTC', 'New York', 'London', 'Tokyo', 'Dubai', 'Sydney'];
    timeZones.forEach(tz => {
      const elements = screen.getAllByText(tz);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('toggles between 12-hour and 24-hour format', () => {
    render(<WorldClock />);
    
    const toggleButton = screen.getByRole('button', { name: /switch to 12 hour format/i });
    expect(toggleButton).toHaveTextContent('24-Hour');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('12-Hour');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('24-Hour');
  });

  it('applies custom className', () => {
    const { container } = render(<WorldClock className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays dates in YYYY-MM-DD format', () => {
    render(<WorldClock />);
    
    // Check that dates are displayed (format check will depend on the time zone)
    const dateElements = screen.getAllByText(/\d{4}-\d{2}-\d{2}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
