import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CognitoBrowserApp from './CognitoBrowserApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { AppID } from '../../types';

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  groundedSearch: vi.fn(),
  summarizeText: vi.fn(),
}));

describe('CognitoBrowserApp', () => {
  const mockOnOpenWindow = vi.fn();

  beforeEach(() => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockClear();
    (geminiAdvancedService.summarizeText as vi.Mock).mockClear();
    mockOnOpenWindow.mockClear();
  });

  it('renders with an iframe showing google.com by default', () => {
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    const iframe = screen.getByTitle('Cognito Browser View');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://google.com');
  });

  it('allows navigating to a new URL', () => {
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    const urlInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.submit(urlInput); // Submit by pressing Enter

    const iframe = screen.getByTitle('Cognito Browser View');
    expect(iframe).toHaveAttribute('src', 'https://example.com');
  });

  it('performs AI search when a non-URL query is entered', async () => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockResolvedValue({
      text: 'AI search results for "weather"',
      sources: [{ title: 'Weather.com', uri: 'https://weather.com' }],
    });
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    const searchInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(searchInput, { target: { value: 'weather in London' } });
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(geminiAdvancedService.groundedSearch).toHaveBeenCalledWith('weather in London', false);
      expect(screen.getByText('AI search results for "weather"')).toBeInTheDocument();
      expect(screen.getByText('Weather.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /summarize page/i })).toBeInTheDocument(); // Summarize button appears
    });
  });

  it('shows loading state during AI search', async () => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    const searchInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(searchInput, { target: { value: 'long query' } });
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('summarizes content and opens ChatApp when "Summarize Page" is clicked', async () => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockResolvedValue({
      text: 'Long text to summarize.',
      sources: [],
    });
    (geminiAdvancedService.summarizeText as vi.Mock).mockResolvedValue('Short summary.');
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    
    // First perform a search to get content for summarization
    const searchInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(searchInput, { target: { value: 'some topic' } });
    fireEvent.submit(searchInput);
    await waitFor(() => {
        expect(screen.getByText('Long text to summarize.')).toBeInTheDocument();
    });

    const summarizeButton = screen.getByRole('button', { name: /summarize page/i });
    fireEvent.click(summarizeButton);

    await waitFor(() => {
      expect(geminiAdvancedService.summarizeText).toHaveBeenCalledWith('Long text to summarize.');
      expect(mockOnOpenWindow).toHaveBeenCalledWith(AppID.chat, { initialMessage: "Here's a summary:\n\nShort summary." });
    });
  });

  it('disables summarize button during summarization', async () => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockResolvedValue({ text: 'Some content', sources: [] });
    (geminiAdvancedService.summarizeText as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    
    const searchInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(searchInput);
    await waitFor(() => expect(screen.getByText('Some content')).toBeInTheDocument());

    const summarizeButton = screen.getByRole('button', { name: /summarize page/i });
    fireEvent.click(summarizeButton);

    await waitFor(() => {
      expect(summarizeButton).toBeDisabled();
      expect(screen.getByText('Summarizing...')).toBeInTheDocument();
    });
  });

  it('handles search error gracefully', async () => {
    (geminiAdvancedService.groundedSearch as vi.Mock).mockRejectedValue(new Error('API error'));
    render(<CognitoBrowserApp onOpenWindow={mockOnOpenWindow} />);
    const searchInput = screen.getByPlaceholderText(/search with ai or enter a url/i);
    fireEvent.change(searchInput, { target: { value: 'error query' } });
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(screen.getByText("Sorry, I couldn't perform the search.")).toBeInTheDocument();
    });
  });
});