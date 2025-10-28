import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// FIX: Changed default import to named import.
import TranslateHubApp from './TranslateHubApp';
import { useLanguage } from '../../contexts/LanguageContext';
import * as geminiAdvancedService from '../../services/geminiAdvancedService';
import * as audioUtils from '../../utils/audioUtils';
import * as fileUtils from '../../utils/fileUtils';
import { SystemVoice } from '../../types';

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

// Mock AI services
vi.mock('../../services/geminiAdvancedService', () => ({
  generateSpeech: vi.fn(),
  translateText: vi.fn(),
  transcribeAudio: vi.fn(),
}));

// Mock audio utilities
vi.mock('../../utils/audioUtils', () => ({
  decode: vi.fn(),
  playDecodedAudio: vi.fn(),
  encode: vi.fn(), // If needed, though usually not directly called in tests
}));

// Mock file utilities
vi.mock('../../utils/fileUtils', () => ({
  fileToBase64: vi.fn(),
}));

// Mock MediaRecorder and getUserMedia
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: vi.fn(),
  onstop: vi.fn(),
  stream: { getTracks: () => [{ stop: vi.fn() }] },
};
const mockGetUserMedia = vi.fn(() =>
  Promise.resolve({
    getTracks: () => [{ stop: vi.fn() }],
  })
);
const mockAudioContext = {
  // Add properties and methods that are actually used by the component
  state: 'suspended',
  resume: vi.fn(),
  close: vi.fn(),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
  })),
  createBuffer: vi.fn(),
  destination: {},
  sampleRate: 24000,
};

// Global mocks for browser APIs
beforeEach(() => {
  vi.clearAllMocks();
  (useLanguage as vi.Mock).mockReturnValue({ t: (key: string) => key }); // Simple mock for translation
  (window.MediaRecorder as any) = vi.fn(() => mockMediaRecorder);
  (navigator.mediaDevices.getUserMedia as vi.Mock) = mockGetUserMedia;
  (window.AudioContext as any) = vi.fn(() => mockAudioContext);
  (window as any).webkitAudioContext = vi.fn(() => mockAudioContext);
});

describe('TranslateHubApp', () => {
  const mockSpeechSettings = {
    voice: 'Kore' as SystemVoice,
    rate: 1.0,
    pitch: 0,
  };

  it('renders with "Text" tab active by default', () => {
    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);
    expect(screen.getByRole('button', { name: /text/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /conversation/i, pressed: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
  });

  it('translates text and displays output', async () => {
    (geminiAdvancedService.translateText as vi.Mock).mockResolvedValue('Hola Mundo');
    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);

    const inputTextArea = screen.getByLabelText(/text to translate/i);
    const translateButton = screen.getByLabelText(/translate button/i);
    
    fireEvent.change(inputTextArea, { target: { value: 'Hello World' } });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(geminiAdvancedService.translateText).toHaveBeenCalledWith('Hello World', 'es', undefined);
      expect(screen.getByLabelText(/translated text output/i)).toHaveValue('Hola Mundo');
    });
  });

  it('speaks translated text when "Speak" button is clicked', async () => {
    (geminiAdvancedService.translateText as vi.Mock).mockResolvedValue('Bonjour');
    (geminiAdvancedService.generateSpeech as vi.Mock).mockResolvedValue('base64audio_french');
    (audioUtils.decode as vi.Mock).mockReturnValue(new Uint8Array());
    (audioUtils.playDecodedAudio as vi.Mock).mockResolvedValue(undefined);

    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);

    const inputTextArea = screen.getByLabelText(/text to translate/i);
    const translateButton = screen.getByLabelText(/translate button/i);
    
    fireEvent.change(inputTextArea, { target: { value: 'Hello' } });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/translated text output/i)).toHaveValue('Bonjour');
    });

    const speakButton = screen.getByLabelText(/speak translated text/i);
    fireEvent.click(speakButton);

    await waitFor(() => {
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(geminiAdvancedService.generateSpeech).toHaveBeenCalledWith('Bonjour', mockSpeechSettings.voice, mockSpeechSettings.rate, mockSpeechSettings.pitch);
      expect(audioUtils.decode).toHaveBeenCalledWith('base64audio_french');
      expect(audioUtils.playDecodedAudio).toHaveBeenCalledWith(expect.any(Uint8Array), mockAudioContext);
    });
  });

  it('switches to "Conversation" tab and shows mic control', async () => {
    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start speaking/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target language/i)).toBeInTheDocument();
    });
  });

  it('starts and stops recording in "Conversation" tab', async () => {
    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    const micButton = screen.getByLabelText(/start speaking/i);
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(mockMediaRecorder.start).toHaveBeenCalled();
      expect(screen.getByText(/listening\.\.\./i)).toBeInTheDocument();
      expect(micButton).toHaveAccessibleName(/stop speaking/i);
    });

    fireEvent.click(micButton); // Stop recording

    await waitFor(() => {
      expect(mockMediaRecorder.stop).toHaveBeenCalled();
      expect(mockMediaRecorder.stream.getTracks()[0].stop).toHaveBeenCalled();
      expect(screen.getByText(/translating\.\.\./i)).toBeInTheDocument();
    });
  });

  it('processes recorded conversation (transcribe, translate, speak)', async () => {
    const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
    const mockAudioFile = new File([mockAudioBlob], 'recording.webm', { type: 'audio/webm' });

    (fileUtils.fileToBase64 as vi.Mock).mockResolvedValue('data:audio/webm;base64,mockbase64audio');
    (geminiAdvancedService.transcribeAudio as vi.Mock).mockResolvedValue('User said this');
    (geminiAdvancedService.translateText as vi.Mock).mockResolvedValue('El usuario dijo esto');
    (geminiAdvancedService.generateSpeech as vi.Mock).mockResolvedValue('base64audio_translated');
    (audioUtils.decode as vi.Mock).mockReturnValue(new Uint8Array());
    (audioUtils.playDecodedAudio as vi.Mock).mockResolvedValue(undefined);

    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    // Simulate recording
    fireEvent.click(screen.getByLabelText(/start speaking/i));
    mockMediaRecorder.ondataavailable({ data: new Blob() }); // Simulate audio chunk
    fireEvent.click(screen.getByLabelText(/stop speaking/i));

    // Wait for onstop to trigger processConversation
    await waitFor(() => {
        mockMediaRecorder.onstop();
    });
    
    await waitFor(() => {
      expect(fileUtils.fileToBase64).toHaveBeenCalledWith(expect.any(File));
      expect(geminiAdvancedService.transcribeAudio).toHaveBeenCalledWith('mockbase64audio', 'audio/webm');
      expect(screen.getByText('User said this')).toBeInTheDocument();

      expect(geminiAdvancedService.translateText).toHaveBeenCalledWith('User said this', 'ar', 'en'); // Default languages
      expect(screen.getByText('El usuario dijo esto')).toBeInTheDocument();
      expect(screen.getByText(/speaking\.\.\./i)).toBeInTheDocument();

      expect(geminiAdvancedService.generateSpeech).toHaveBeenCalledWith('El usuario dijo esto', mockSpeechSettings.voice, mockSpeechSettings.rate, mockSpeechSettings.pitch);
      expect(audioUtils.playDecodedAudio).toHaveBeenCalled();
      expect(screen.getByLabelText(/start speaking/i)).toBeInTheDocument(); // Returns to idle
    }, { timeout: 5000 }); // Increase timeout for full process
  });

  it('displays error if microphone access is denied', async () => {
    (navigator.mediaDevices.getUserMedia as vi.Mock).mockRejectedValue(new Error('Permission denied'));

    render(<TranslateHubApp speechSettings={mockSpeechSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /conversation/i }));

    const micButton = screen.getByLabelText(/start speaking/i);
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(screen.getByText('translate_hub.error_mic_access')).toBeInTheDocument();
      expect(micButton).toHaveAccessibleName(/start speaking/i); // Returns to idle
    });
  });
});