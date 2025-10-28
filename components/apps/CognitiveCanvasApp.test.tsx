import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CognitiveCanvasApp from './CognitiveCanvasApp';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import { useLanguage } from '../../contexts/LanguageContext';
import { SystemVoice } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  expandTopic: vi.fn(),
  // FIX: Added mock for getResearchSummary
  getResearchSummary: vi.fn(),
  translateText: vi.fn(),
}));

describe('CognitiveCanvasApp', () => {
  const mockSpeechSettings = {
    voice: 'Kore' as SystemVoice,
    rate: 1.0,
    pitch: 0,
  };
  const mockT = vi.fn((key: string) => key.split('.')[1] || key); // Simple mock for translation

  beforeEach(() => {
    (useLanguage as vi.Mock).mockReturnValue({ t: mockT });
    (geminiAdvancedService.expandTopic as vi.Mock).mockClear();
    (geminiAdvancedService.getResearchSummary as vi.Mock).mockClear();
    (geminiAdvancedService.translateText as vi.Mock).mockClear();
  });

  it('renders initial state with a prompt to start brainstorming', () => {
    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    expect(screen.getByText('Start a new brainstorming session')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Quantum Computing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate mind map/i })).toBeInTheDocument();
  });

  it('generates a mind map when "Generate Mind Map" is clicked', async () => {
    (geminiAdvancedService.expandTopic as vi.Mock).mockResolvedValue({
      mainIdea: 'AI Ethics',
      subTopics: ['Bias in AI', 'Privacy Concerns'],
      questions: ['How to regulate AI?', 'Who is responsible for AI actions?'],
    });

    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    const topicInput = screen.getByPlaceholderText('e.g., Quantum Computing');
    fireEvent.change(topicInput, { target: { value: 'AI Ethics' } });
    fireEvent.click(screen.getByRole('button', { name: /generate mind map/i }));

    await waitFor(() => {
      expect(geminiAdvancedService.expandTopic).toHaveBeenCalledWith('AI Ethics');
      expect(screen.getByText('AI Ethics')).toBeInTheDocument(); // Main node
      expect(screen.getByText('Bias in AI')).toBeInTheDocument(); // Sub-topic
      expect(screen.getByText('How to regulate AI?')).toBeInTheDocument(); // Question
    });
  });

  it('shows loading state during mind map generation', async () => {
    (geminiAdvancedService.expandTopic as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    const topicInput = screen.getByPlaceholderText('e.g., Quantum Computing');
    fireEvent.change(topicInput, { target: { value: 'AI Ethics' } });
    fireEvent.click(screen.getByRole('button', { name: /generate mind map/i }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
      expect(screen.getByText('Generate Mind Map')).toBeDisabled();
    });
  });

  it('performs research for a node when its spark icon is clicked', async () => {
    (geminiAdvancedService.expandTopic as vi.Mock).mockResolvedValue({
      mainIdea: 'AI Ethics',
      subTopics: ['Bias in AI'],
      questions: [],
    });
    // FIX: Mocked getResearchSummary
    (geminiAdvancedService.getResearchSummary as vi.Mock).mockResolvedValue('Summary on Bias in AI.');

    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    const topicInput = screen.getByPlaceholderText('e.g., Quantum Computing');
    fireEvent.change(topicInput, { target: { value: 'AI Ethics' } });
    fireEvent.click(screen.getByRole('button', { name: /generate mind map/i }));

    await waitFor(() => {
      expect(screen.getByText('Bias in AI')).toBeInTheDocument();
    });

    const researchButton = screen.getByLabelText('Research Bias in AI');
    fireEvent.click(researchButton);

    await waitFor(() => {
      expect(geminiAdvancedService.getResearchSummary).toHaveBeenCalledWith('Bias in AI');
      expect(screen.getByDisplayValue('Summary on Bias in AI.')).toBeInTheDocument();
    });
  });

  it('translates node content when its translate icon is clicked', async () => {
    (geminiAdvancedService.expandTopic as vi.Mock).mockResolvedValue({
      mainIdea: 'Hello',
      subTopics: [],
      questions: [],
    });
    // First, set some content to enable the translate button
    // FIX: Mocked getResearchSummary
    (geminiAdvancedService.getResearchSummary as vi.Mock).mockResolvedValue('English content.');
    (geminiAdvancedService.translateText as vi.Mock).mockResolvedValue('Contenido en inglés.');
    (useLanguage as vi.Mock).mockReturnValue({ t: (key: string) => key === 'language_code' ? 'es' : key.split('.')[1] || key });


    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    const topicInput = screen.getByPlaceholderText('e.g., Quantum Computing');
    fireEvent.change(topicInput, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /generate mind map/i }));

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    // Research to add content
    const researchButton = screen.getByLabelText('Research Hello');
    fireEvent.click(researchButton);
    await waitFor(() => {
        const contentTextArea = screen.getByLabelText('Content for Hello');
        expect(screen.getByDisplayValue('English content.')).toBeInTheDocument();
    });

    // Now translate
    const translateButton = screen.getByLabelText('Translate content of Hello');
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(geminiAdvancedService.translateText).toHaveBeenCalledWith('English content.', 'es');
      expect(screen.getByDisplayValue('Contenido en inglés.')).toBeInTheDocument();
    });
  });

  it('allows editing node content directly', async () => {
    (geminiAdvancedService.expandTopic as vi.Mock).mockResolvedValue({
      mainIdea: 'Editable Topic',
      subTopics: [],
      questions: [],
    });

    render(<CognitiveCanvasApp speechSettings={mockSpeechSettings} />);
    const topicInput = screen.getByPlaceholderText('e.g., Quantum Computing');
    fireEvent.change(topicInput, { target: { value: 'Editable Topic' } });
    fireEvent.click(screen.getByRole('button', { name: /generate mind map/i }));

    await waitFor(() => {
      expect(screen.getByText('Editable Topic')).toBeInTheDocument();
    });

    // Click research to make content editable
    const researchButton = screen.getByLabelText('Research Editable Topic');
    fireEvent.click(researchButton);
    await waitFor(() => {
        const contentTextArea = screen.getByLabelText('Content for Editable Topic');
        fireEvent.change(contentTextArea, { target: { value: 'New edited content.' } });
        expect(screen.getByDisplayValue('New edited content.')).toBeInTheDocument();
    });
  });
});