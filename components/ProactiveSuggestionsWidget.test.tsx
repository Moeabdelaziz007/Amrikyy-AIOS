import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProactiveSuggestionsWidget from './ProactiveSuggestionsWidget';
import { useUserBehavior } from '../contexts/UserBehaviorContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as geminiAdvancedService from '../services/geminiAdvancedService';
import { AppID, UserAction } from '../types';

// Mock contexts
vi.mock('../contexts/UserBehaviorContext', () => ({
  useUserBehavior: vi.fn(),
}));
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI service
vi.mock('../services/geminiAdvancedService', () => ({
  generateProactiveSuggestion: vi.fn(),
}));

describe('ProactiveSuggestionsWidget', () => {
  const mockOnOpenApp = vi.fn();
  const mockT = vi.fn((key: string) => key.split('.')[1] || key); // Simple mock for translation

  beforeEach(() => {
    // Reset mocks before each test
    (useUserBehavior as vi.Mock).mockReturnValue({ actions: [], logAction: vi.fn(), getFrequentApps: vi.fn() });
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.generateProactiveSuggestion as vi.Mock).mockClear();

    // Use fake timers to control debounce
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers(); // Ensure any pending debounced calls are run
    vi.useRealTimers(); // Restore real timers
  });

  it('renders the default title and "No suggestions right now." when no actions', () => {
    render(<ProactiveSuggestionsWidget onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('title')).toBeInTheDocument(); // proactive_widget.title from mockT
    expect(screen.getByText('No suggestions right now.')).toBeInTheDocument();
  });

  it('calls generateProactiveSuggestion after a debounce period when actions change', async () => {
    const mockActions: UserAction[] = [
      // FIX: Use AppID enum member directly
      { appId: AppID.chat, timestamp: Date.now(), details: { message: 'hello' } },
    ];
    (useUserBehavior as vi.Mock).mockReturnValue({ actions: mockActions });
    (geminiAdvancedService.generateProactiveSuggestion as vi.Mock).mockResolvedValue({
      title: 'AI Insights',
      suggestions: [{ text: 'How about we plan a trip?', actionAppId: AppID.travelAgent }],
    });

    render(<ProactiveSuggestionsWidget onOpenApp={mockOnOpenApp} />);

    expect(geminiAdvancedService.generateProactiveSuggestion).not.toHaveBeenCalled();

    vi.advanceTimersByTime(999); // Advance almost debounce time
    expect(geminiAdvancedService.generateProactiveSuggestion).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1); // Advance past debounce time
    await waitFor(() => {
      expect(geminiAdvancedService.generateProactiveSuggestion).toHaveBeenCalledWith(mockActions.slice(0, 3));
    });

    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('How about we plan a trip?')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching suggestions', async () => {
    const mockActions: UserAction[] = [{ appId: AppID.settings, timestamp: Date.now() }];
    (useUserBehavior as vi.Mock).mockReturnValue({ actions: mockActions });
    // Keep the promise pending to simulate loading
    (geminiAdvancedService.generateProactiveSuggestion as vi.Mock).mockReturnValue(new Promise(() => {}));

    render(<ProactiveSuggestionsWidget onOpenApp={mockOnOpenApp} />);

    vi.advanceTimersByTime(1000); // Trigger the API call

    await waitFor(() => {
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });
  });

  it('calls onOpenApp when an actionable suggestion is clicked', async () => {
    const mockActions: UserAction[] = [{ appId: AppID.creatorStudio, timestamp: Date.now() }];
    (useUserBehavior as vi.Mock).mockReturnValue({ actions: mockActions });
    (geminiAdvancedService.generateProactiveSuggestion as vi.Mock).mockResolvedValue({
      title: 'Creative Boost',
      suggestions: [{ text: 'Start a new project?', actionAppId: AppID.creatorStudio }],
    });

    render(<ProactiveSuggestionsWidget onOpenApp={mockOnOpenApp} />);

    vi.advanceTimersByTime(1000); // Trigger the API call

    await waitFor(() => {
      const suggestionButton = screen.getByText('Start a new project?');
      expect(suggestionButton).toBeInTheDocument();
      fireEvent.click(suggestionButton);
    });

    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith(AppID.creatorStudio);
  });

  it('does not call onOpenApp when a non-actionable suggestion is clicked', async () => {
    const mockActions: UserAction[] = [{ appId: AppID.chat, timestamp: Date.now() }];
    (useUserBehavior as vi.Mock).mockReturnValue({ actions: mockActions });
    (geminiAdvancedService.generateProactiveSuggestion as vi.Mock).mockResolvedValue({
      title: 'General Info',
      suggestions: [{ text: 'No actionable suggestion here.' }], // No actionAppId
    });

    render(<ProactiveSuggestionsWidget onOpenApp={mockOnOpenApp} />);

    vi.advanceTimersByTime(1000); // Trigger the API call

    await waitFor(() => {
      const suggestion = screen.getByText('No actionable suggestion here.');
      expect(suggestion).toBeInTheDocument();
      fireEvent.click(suggestion); // Click a non-actionable suggestion
    });

    expect(mockOnOpenApp).not.toHaveBeenCalled();
  });
});