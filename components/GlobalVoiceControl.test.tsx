import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalVoiceControl from './GlobalVoiceControl';
import { useLanguage } from '../contexts/LanguageContext';
import * as geminiAdvancedService from '../services/geminiAdvancedService';

// Mock contexts
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI service
vi.mock('../services/geminiAdvancedService', () => ({
  interpretVoiceCommand: vi.fn(),
}));

// Mock SpeechRecognition API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: vi.fn(),
  onerror: vi.fn(),
  onend: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useLanguage as vi.Mock).mockReturnValue({ t: (key: string) => key.split('.').pop() || key }); // Simple mock for translation
  (window as any).SpeechRecognition = vi.fn(() => mockSpeechRecognition);
  (window as any).webkitSpeechRecognition = vi.fn(() => mockSpeechRecognition);
  (geminiAdvancedService.interpretVoiceCommand as vi.Mock).mockClear();
});

describe('GlobalVoiceControl', () => {
  const mockOnCommand = vi.fn();

  it('renders the mic button in idle state', () => {
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    expect(micButton).toBeInTheDocument();
    expect(micButton).toHaveTextContent('mic');
    expect(micButton).not.toHaveClass('animate-pulse');
  });

  it('starts listening when mic button is clicked', async () => {
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    fireEvent.click(micButton);

    expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(micButton).toHaveTextContent('mic_off');
      expect(screen.getByText('listening')).toBeInTheDocument(); // 'listening' from mockT
    });
  });

  it('stops listening when mic button is clicked while listening', async () => {
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    
    // Start listening
    fireEvent.click(micButton);
    await waitFor(() => expect(mockSpeechRecognition.start).toHaveBeenCalled());

    // Stop listening
    fireEvent.click(micButton);
    await waitFor(() => {
      expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1);
      expect(micButton).toHaveTextContent('mic');
      expect(screen.queryByText('listening')).not.toBeInTheDocument();
    });
  });

  it('interprets voice command and calls onCommand', async () => {
    (geminiAdvancedService.interpretVoiceCommand as vi.Mock).mockResolvedValue({ action: 'open', target: 'chat' });
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    fireEvent.click(micButton); // Start listening

    // Simulate speech recognition result
    const mockResult = { results: [[{ transcript: 'open chat application', confidence: 0.9 }]] };
    mockSpeechRecognition.onresult(mockResult);

    await waitFor(() => {
      expect(geminiAdvancedService.interpretVoiceCommand).toHaveBeenCalledWith('open chat application');
      expect(mockOnCommand).toHaveBeenCalledWith('open chat');
      expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1); // Should stop after result
    });
  });

  it('displays processing state during command interpretation', async () => {
    (geminiAdvancedService.interpretVoiceCommand as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    fireEvent.click(micButton); // Start listening

    // Simulate speech recognition result
    const mockResult = { results: [[{ transcript: 'process this', confidence: 0.9 }]] };
    mockSpeechRecognition.onresult(mockResult);

    await waitFor(() => {
      expect(screen.getByText('processing')).toBeInTheDocument(); // 'processing' from mockT
      expect(micButton).toBeDisabled(); // Button should be disabled during processing
    });
  });

  it('handles speech recognition errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    fireEvent.click(micButton); // Start listening

    // Simulate an error
    mockSpeechRecognition.onerror({ error: 'network' });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Speech recognition error', 'network');
      expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1);
      expect(micButton).toHaveTextContent('mic'); // Returns to idle
    });
    consoleErrorSpy.mockRestore();
  });

  it('auto-restarts listening if `onend` fires while intentionally listening', async () => {
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    fireEvent.click(micButton); // Start listening

    await waitFor(() => expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1));

    mockSpeechRecognition.onend(); // Simulate recognition ending unexpectedly
    
    await waitFor(() => expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(2)); // Expect it to restart
  });

  it('does not auto-restart if `onend` fires after intentionally stopping', async () => {
    render(<GlobalVoiceControl onCommand={mockOnCommand} />);
    const micButton = screen.getByLabelText('Toggle Voice Control');
    
    fireEvent.click(micButton); // Start listening
    await waitFor(() => expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1));

    fireEvent.click(micButton); // Explicitly stop
    await waitFor(() => expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(1));

    mockSpeechRecognition.onend(); // Simulate onend after stop

    // Start should not be called again
    expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(1); 
  });
});