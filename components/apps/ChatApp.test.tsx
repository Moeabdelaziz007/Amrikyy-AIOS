import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatApp from './ChatApp';
import * as geminiService from '../../services/geminiService';
import { SystemVoice } from '../../types';

// Mock the geminiService to control its behavior in tests
vi.mock('../../services/geminiService', () => ({
  generateResponse: vi.fn(),
}));

// FIX: Mock audio services to prevent errors in test environment.
vi.mock('../../services/geminiAdvancedService', () => ({
    generateSpeech: vi.fn().mockResolvedValue('mock-base64-audio'),
}));
vi.mock('../../utils/audioUtils', () => ({
    decode: vi.fn(),
    playDecodedAudio: vi.fn(),
}));

describe('ChatApp', () => {
  const mockGenerateResponse = geminiService.generateResponse as vi.Mock;
  const mockSpeechSettings = {
    voice: 'Kore' as SystemVoice,
    rate: 1.0,
    pitch: 0,
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockGenerateResponse.mockClear();
  });

  it('sends a user message and displays both the user and AI messages', async () => {
    mockGenerateResponse.mockResolvedValue('This is the AI response.');
    // FIX: Provide the required speechSettings prop.
    render(<ChatApp speechSettings={mockSpeechSettings} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    // Simulate user typing and sending a message
    fireEvent.change(input, { target: { value: 'Hello AI!' } });
    fireEvent.click(sendButton);

    // The user's message should appear immediately
    expect(screen.getByText('Hello AI!')).toBeInTheDocument();

    // Check that the API was called correctly
    expect(mockGenerateResponse).toHaveBeenCalledWith('Hello AI!', [
      { role: 'model', parts: [{ text: "Hello! I'm Maya, your AI travel assistant. How can I help you plan your next adventure today?" }] }
    ]);

    // Wait for the AI's response to appear
    await waitFor(() => {
      expect(screen.getByText('This is the AI response.')).toBeInTheDocument();
    });
  });

  it('disables input and send button while waiting for a response', async () => {
    // Create a promise that we can resolve manually to simulate a delay
    let resolveResponse: (value: string) => void;
    const delayedPromise = new Promise<string>(resolve => {
        resolveResponse = resolve;
    });
    mockGenerateResponse.mockReturnValue(delayedPromise);
    
    // FIX: Provide the required speechSettings prop.
    render(<ChatApp speechSettings={mockSpeechSettings} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.change(input, { target: { value: 'A complex question' } });
    fireEvent.click(sendButton);

    // Input and button should be disabled immediately after sending
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    
    // The loading indicator should be visible
    expect(screen.getByRole('log', { name: '' })).toHaveAttribute('aria-busy', 'true');

    // Resolve the promise to simulate the API call finishing
    resolveResponse!('A simple answer.');

    // Wait for the UI to update
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(sendButton).not.toBeDisabled();
      expect(screen.getByText('A simple answer.')).toBeInTheDocument();
    });
  });
});