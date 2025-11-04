import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AtlasApp from './AtlasApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { geminiService } from '../../packages/ai/src/index';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  getFinancialNews: vi.fn(),
  getFinancialAnalysis: vi.fn(),
}));
vi.mock('../../packages/ai/src/index', () => ({
  geminiService: {
    generateText: vi.fn(),
  },
}));

describe('AtlasApp', () => {
  const mockT = vi.fn((key: string) => key.split('.').pop() || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    // Mock default successful responses for AI services
    (geminiAdvancedService.getFinancialNews as vi.Mock).mockResolvedValue([
      { title: 'Test News 1', source: 'Source A', url: '#' },
    ]);
    (geminiAdvancedService.getFinancialAnalysis as vi.Mock).mockResolvedValue({
      summary: 'Summary of Analysis',
      bullCase: 'Bull Case',
      bearCase: 'Bear Case',
      keyMetrics: [{ name: 'Metric 1', value: '100' }],
      recentNews: 'Recent News',
    });
    (geminiService.generateText as vi.Mock).mockResolvedValue('AI Chat Response');

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the main title and tab buttons', () => {
    render(<AtlasApp />);
    expect(screen.getByText('Atlas Finance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /market analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai chat/i })).toBeInTheDocument();
  });

  it('defaults to the Dashboard tab and displays mock data', async () => {
    render(<AtlasApp />);
    await waitFor(() => {
      expect(screen.getByText('Test News 1')).toBeInTheDocument(); // From mocked getFinancialNews
      expect(screen.getByText('S&P 500')).toBeInTheDocument(); // From data/finance
      expect(screen.getByText('Bitcoin')).toBeInTheDocument(); // From data/finance
    });
    expect(geminiAdvancedService.getFinancialNews).toHaveBeenCalledTimes(1);
  });

  it('switches to Market Analysis tab and allows input', async () => {
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /market analysis/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter stock or crypto ticker/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('performs financial analysis when "Analyze" button is clicked in Market Analysis tab', async () => {
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /market analysis/i }));

    const tickerInput = screen.getByPlaceholderText(/enter stock or crypto ticker/i);
    fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.getFinancialAnalysis).toHaveBeenCalledWith('AAPL');
      expect(screen.getByText('Summary of Analysis')).toBeInTheDocument();
      expect(screen.getByText('Bull Case')).toBeInTheDocument();
      expect(screen.getByText('Bear Case')).toBeInTheDocument();
    });
  });

  it('switches to AI Chat tab and allows sending messages', async () => {
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));

    await waitFor(() => {
      expect(screen.getByText(/i am atlas, your ai financial analyst/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ask a financial question/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends a message and displays AI response in AI Chat tab', async () => {
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));

    const chatInput = screen.getByPlaceholderText(/ask a financial question/i);
    fireEvent.change(chatInput, { target: { value: 'What is the current market trend?' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(geminiService.generateText).toHaveBeenCalledWith(
        'What is the current market trend?',
        expect.arrayContaining([expect.objectContaining({ parts: [{ text: expect.any(String) }] })]),
        {},
        expect.any(String)
      );
      expect(screen.getByText(/AI Chat Response/i)).toBeInTheDocument();
      expect(screen.getByText(/\*disclaimer: i am an ai assistant/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during financial analysis', async () => {
    (geminiAdvancedService.getFinancialAnalysis as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /market analysis/i }));

    const tickerInput = screen.getByPlaceholderText(/enter stock or crypto ticker/i);
    fireEvent.change(tickerInput, { target: { value: 'GOOG' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByText('Generating Report...')).toBeInTheDocument();
    });
  });

  it('displays error message if financial analysis fails', async () => {
    (geminiAdvancedService.getFinancialAnalysis as vi.Mock).mockRejectedValue(new Error('Network error'));
    render(<AtlasApp />);
    fireEvent.click(screen.getByRole('button', { name: /market analysis/i }));

    const tickerInput = screen.getByPlaceholderText(/enter stock or crypto ticker/i);
    fireEvent.change(tickerInput, { target: { value: 'FAIL' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to retrieve analysis. Please check the ticker and try again.')).toBeInTheDocument();
    });
  });
});