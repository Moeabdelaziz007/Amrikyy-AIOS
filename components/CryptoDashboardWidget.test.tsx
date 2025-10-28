import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CryptoDashboardWidget from './CryptoDashboardWidget';

// Mocking setInterval and clearInterval for time-based updates
vi.useFakeTimers();

describe('CryptoDashboardWidget', () => {
  beforeEach(() => {
    vi.clearAllTimers(); // Clear any timers from previous tests
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after all tests
  });

  it('renders the Crypto Dashboard title', () => {
    render(<CryptoDashboardWidget />);
    expect(screen.getByText('Crypto Dashboard')).toBeInTheDocument();
  });

  it('renders initial crypto data with correct names and tickers', () => {
    render(<CryptoDashboardWidget />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('renders initial prices and changes', () => {
    render(<CryptoDashboardWidget />);

    expect(screen.getByText(/\$68420.69/i)).toBeInTheDocument();
    expect(screen.getByText('+2.50%')).toBeInTheDocument(); // Expecting fixed to 2 decimal places
    expect(screen.getByText(/\$3450.12/i)).toBeInTheDocument();
    expect(screen.getByText('-1.20%')).toBeInTheDocument();
  });

  it('updates crypto prices and changes over time', async () => {
    render(<CryptoDashboardWidget />);

    const initialBtcPrice = screen.getByText(/\$68420.69/i);
    const initialEthPrice = screen.getByText(/\$3450.12/i);

    // Advance timers by the update interval (3000ms)
    vi.advanceTimersByTime(3000);

    // Prices and changes should have updated (non-deterministically, but different from initial)
    await waitFor(() => {
      expect(screen.queryByText(/\$68420.69/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$3450.12/i)).not.toBeInTheDocument();
      
      // We can't assert specific new values due to randomness,
      // but we can check for the format and existence of new prices/changes.
      expect(screen.getByText(/^\$[0-9]+\.[0-9]{2}$/)).toBeInTheDocument(); // Check for dollar value format
      expect(screen.getByText(/^[+-][0-9]+\.[0-9]{2}%$/)).toBeInTheDocument(); // Check for change percentage format
    });
  });

  it('applies correct styling for positive and negative changes', () => {
    render(<CryptoDashboardWidget />);

    // Initially BTC is positive, ETH is negative
    expect(screen.getByText('+2.50%')).toHaveClass('text-green-400');
    expect(screen.getByText('-1.20%')).toHaveClass('text-red-400');

    // To test the change, we would need to mock Math.random to control the outcome.
    // For now, we rely on the initial state for class assertion.
  });
});