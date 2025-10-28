import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SmartWatchApp from './SmartWatchApp';
import { Alarm, Automation, AppID } from '../../types'; // FIX: Import AppID

// Mock timers for `setInterval` and `setTimeout`
vi.useFakeTimers();

describe('SmartWatchApp', () => {
  const initialAlarms: Alarm[] = [
    { id: '1', time: '07:00', label: 'Morning Alarm', enabled: true },
    { id: '2', time: '09:00', label: 'Standup', enabled: false },
  ];
  const initialAutomations: Automation[] = [
    // FIX: Use AppID enum member directly
    { id: '1', trigger: 'Time is 08:00', action: { appId: AppID.chat, task: 'Open and say good morning' } },
  ];

  const mockSetAlarms = vi.fn();
  const mockSetAutomations = vi.fn();

  beforeEach(() => {
    vi.setSystemTime(new Date('2024-07-20T10:30:00Z')); // Set a consistent time for tests
    mockSetAlarms.mockClear();
    mockSetAutomations.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the clock view with current time on mount', () => {
    render(
      <SmartWatchApp
        alarms={initialAlarms}
        setAlarms={mockSetAlarms}
        automations={initialAutomations}
        setAutomations={mockSetAutomations}
      />
    );
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText(/Sat, Jul 20/i)).toBeInTheDocument(); // Date based on mock time
  });

  it('updates the clock time every second', () => {
    render(
      <SmartWatchApp
        alarms={initialAlarms}
        setAlarms={mockSetAlarms}
        automations={initialAutomations}
        setAutomations={mockSetAutomations}
      />
    );
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    // The component re-renders, the internal state `time` updates
    expect(screen.getByText('10:30')).toBeInTheDocument(); // Still 10:30 as seconds don't display
    
    vi.setSystemTime(new Date('2024-07-20T10:31:00Z')); // Manually set to a new minute
    vi.advanceTimersByTime(1000); // Advance again to trigger re-render
    expect(screen.getByText('10:31')).toBeInTheDocument();
  });

  it('switches views when the crown button is clicked', () => {
    render(
      <SmartWatchApp
        alarms={initialAlarms}
        setAlarms={mockSetAlarms}
        automations={initialAutomations}
        setAutomations={mockSetAutomations}
      />
    );
    const crownButton = screen.getByRole('button', { hidden: true }); // Crown button is visually off-screen

    // Initial view: clock
    expect(screen.getByText('10:30')).toBeInTheDocument();

    // Click to switch to Alarms
    fireEvent.click(crownButton);
    expect(screen.getByText('Alarms')).toBeInTheDocument();
    expect(screen.getByText('Morning Alarm')).toBeInTheDocument();

    // Click to switch to Automations
    fireEvent.click(crownButton);
    expect(screen.getByText('Automations')).toBeInTheDocument();
    expect(screen.getByText('Time is 08:00')).toBeInTheDocument();

    // Click to switch back to Clock
    fireEvent.click(crownButton);
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('toggles alarm enabled state when clicked in Alarms view', () => {
    render(
      <SmartWatchApp
        alarms={initialAlarms}
        setAlarms={mockSetAlarms}
        automations={initialAutomations}
        setAutomations={mockSetAutomations}
      />
    );
    const crownButton = screen.getByRole('button', { hidden: true });
    fireEvent.click(crownButton); // Go to Alarms view

    const morningAlarmToggle = screen.getByText('Morning Alarm').closest('.flex')?.querySelector('div[class*="rounded-full"][class*="w-12"]');
    
    // Morning Alarm is initially enabled (bg-accent)
    expect(morningAlarmToggle).toHaveClass('bg-accent');
    
    if (morningAlarmToggle) {
        fireEvent.click(morningAlarmToggle); // Toggle it off
        // Expect setAlarms to be called with the updated state
        expect(mockSetAlarms).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '1', enabled: false }),
            expect.objectContaining({ id: '2', enabled: false }),
          ])
        );
    } else {
        throw new Error("Morning Alarm toggle not found.");
    }
  });

  it('displays automations correctly in Automations view', () => {
    render(
      <SmartWatchApp
        alarms={initialAlarms}
        setAlarms={mockSetAlarms}
        automations={initialAutomations}
        setAutomations={mockSetAutomations}
      />
    );
    const crownButton = screen.getByRole('button', { hidden: true });
    fireEvent.click(crownButton); // Go to Alarms view
    fireEvent.click(crownButton); // Go to Automations view

    expect(screen.getByText('Automations')).toBeInTheDocument();
    expect(screen.getByText('Time is 08:00')).toBeInTheDocument();
    expect(screen.getByText('Open and say good morning')).toBeInTheDocument();
    expect(screen.getByText('Automation creation coming soon.')).toBeInTheDocument();
  });
});