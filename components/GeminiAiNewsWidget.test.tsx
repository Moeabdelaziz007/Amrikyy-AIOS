import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GeminiAiNewsWidget from './GeminiAiNewsWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { AppID } from '../../types';

// Mock the useLanguage hook
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('GeminiAiNewsWidget', () => {
  const mockOnOpenApp = vi.fn();
  const mockT = vi.fn((key: string) => {
    switch (key) {
      case 'ai_news.title': return 'AI News';
      case 'ai_news.view_more': return 'View More';
      default: return key.split('.').pop(); // Mock for category and content
    }
  });

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    mockOnOpenApp.mockClear();
    vi.useFakeTimers(); // Use fake timers for animation tests if needed
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the widget title', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('AI News')).toBeInTheDocument();
  });

  it('renders the top news story details', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('Top Story')).toBeInTheDocument();
    expect(screen.getByText(/Google Announces Gemini 2.5/i)).toBeInTheDocument();
    expect(screen.getByText(/The new flagship model, Gemini 2.5 Pro/i)).toBeInTheDocument();
  });

  it('renders market data ticker (at least partially visible due to animation)', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
    // Due to the `animate-grid-pan`, not all elements may be directly visible
    // without advancing timers/animation, but they should be in the DOM.
  });

  it('calls onOpenApp with "geminiAiNews" when "View More" button is clicked', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    const viewMoreButton = screen.getByRole('button', { name: /view more/i });
    fireEvent.click(viewMoreButton);
    expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
    expect(mockOnOpenApp).toHaveBeenCalledWith('geminiAiNews' as AppID);
  });

  it('calls onOpenApp with "geminiAiNews" when the top story card is clicked', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    const topStoryCard = screen.getByText(/Google Announces Gemini 2.5/i).closest('.cursor-pointer');
    if (topStoryCard) {
      fireEvent.click(topStoryCard);
      expect(mockOnOpenApp).toHaveBeenCalledTimes(1);
      expect(mockOnOpenApp).toHaveBeenCalledWith('geminiAiNews' as AppID);
    } else {
      // Fail test if the element or its parent isn't found, indicating a rendering issue
      throw new Error("Top story card not found or not clickable.");
    }
  });

  it('market data ticker has accessibility attributes (aria-live="off")', () => {
    render(<GeminiAiNewsWidget onOpenApp={mockOnOpenApp} />);
    const tickerContainer = screen.getByText('NVDA').closest('[aria-live="off"]');
    expect(tickerContainer).toBeInTheDocument();
  });
});