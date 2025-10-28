import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventLogApp from './EventLogApp';

// Mocking setInterval/clearInterval for simulated streaming
vi.useFakeTimers();

describe('EventLogApp', () => {
  beforeEach(() => {
    vi.clearAllTimers(); // Clear any timers from previous tests
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after all tests
  });

  it('renders the main title and initial status', () => {
    render(<EventLogApp />);
    expect(screen.getByText('[LIVE] Agent-to-Agent Communication Bus')).toBeInTheDocument();
    expect(screen.getByText(/STREAMING\.\.\./i)).toBeInTheDocument();
  });

  it('simulates log streaming and displays messages over time', async () => {
    render(<EventLogApp />);

    // Initially, only the header/footer and possibly a few initial logs (if any mockLogs are quick)
    // We expect the first mock log to appear after the first interval
    await waitFor(() => {
      expect(screen.getByText(/Workflow "Paris Trip" initiated by user/i)).toBeInTheDocument();
    });

    // Advance time to allow more logs to appear
    vi.advanceTimersByTime(1500); // 2nd log
    await waitFor(() => {
      expect(screen.getByText(/Insight: User frequently researches European history/i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1500 * 5); // Advance for several more logs
    await waitFor(() => {
      expect(screen.getByText(/Budget finalized\. Submitting to Orion\./i)).toBeInTheDocument();
    });

    // Verify some specific agent names/colors based on mock data
    expect(screen.getByText(/\[orion\]/i)).toHaveStyle('color: rgb(255, 255, 255)'); // White glow
    expect(screen.getByText(/\[luna\]/i)).toHaveStyle('color: rgb(6, 182, 212)'); // Cyan glow
  });

  it('stops streaming when all mock logs are displayed', async () => {
    render(<EventLogApp />);

    // Advance time past all mock logs (mockLogs has 12 entries, 1.5s each = 18s)
    vi.advanceTimersByTime(1500 * 15); // A bit more than needed to ensure all are processed

    // After all logs, the status should still be streaming for this demo, but no new logs should appear.
    // The setInterval should clear itself.
    expect(screen.queryByText(/STREAMING\.\.\./i)).toBeInTheDocument();
    // Check for the last log entry to confirm completion
    await waitFor(() => {
      expect(screen.getByText(/Workflow "Paris Trip" completed successfully\./i)).toBeInTheDocument();
    });

    // No new logs should appear if we advance timers further
    const initialLogCount = screen.getAllByText(/(\[.+?\]: .+?)/).length;
    vi.advanceTimersByTime(5000);
    expect(screen.getAllByText(/(\[.+?\]: .+?)/).length).toBe(initialLogCount);
  });

  it('displays different log entry types with appropriate styling and icons', async () => {
    render(<EventLogApp />);

    vi.advanceTimersByTime(1500 * 2); // Advance to show at least insight log

    await waitFor(() => {
      const insightLog = screen.getByText(/Insight: User frequently researches European history/i);
      expect(insightLog).toHaveClass('text-blue-300');
      expect(insightLog).toHaveClass('italic');
      expect(insightLog).toHaveTextContent('💡 Insight: User frequently researches European history');

      const proactiveOfferLog = screen.getByText(/Offer: Scout, I detect budget constraints on "Tokyo Trip"/i);
      expect(proactiveOfferLog).toHaveClass('text-yellow-300');
      expect(proactiveOfferLog).toHaveClass('font-semibold');
      expect(proactiveOfferLog).toHaveTextContent('🤝 Offer: Scout, I detect budget constraints on "Tokyo Trip"');

      const standardLog = screen.getByText(/Workflow "Paris Trip" initiated by user/i);
      expect(standardLog).toHaveClass('text-gray-200');
    });
  });

  it('scrolls to the bottom when new logs are added', async () => {
    render(<EventLogApp />);
    const scrollIntoViewMock = vi.fn();
    (HTMLElement.prototype.scrollIntoView as vi.Mock) = scrollIntoViewMock;

    vi.advanceTimersByTime(1500); // Trigger first log
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    vi.advanceTimersByTime(1500); // Trigger second log
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
    });
  });
});