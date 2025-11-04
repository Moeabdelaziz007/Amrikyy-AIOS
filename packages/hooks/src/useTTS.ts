import { useState, useEffect } from 'react';

export interface UseTTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface UseTTSReturn {
  isSpeaking: boolean;
  availableVoices: SpeechSynthesisVoice[];
  speak: (text: string, options?: UseTTSOptions) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
}

export const useTTS = (defaultOptions: UseTTSOptions = {}): UseTTSReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported] = useState(() => 'speechSynthesis' in window);

  useEffect(() => {
    if (!isSupported) return;

    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    getVoices();
    // Voices are loaded asynchronously
    window.speechSynthesis.onvoiceschanged = getVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel(); // Stop any speech on unmount
    };
  }, [isSupported]);

  const speak = (text: string, options: UseTTSOptions = {}) => {
    if (!isSupported) {
      console.error('Speech Synthesis not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Merge default options with call-time options
    const finalOptions = { ...defaultOptions, ...options };

    // Find and set the voice
    if (finalOptions.voice) {
      const voice = availableVoices.find((v) => v.name === finalOptions.voice);
      if (voice) {
        utterance.voice = voice;
      }
    } else if (finalOptions.lang) {
      // Fallback to a voice that matches the language
      const languageVoice = availableVoices.find((v) => v.lang.startsWith(finalOptions.lang!));
      if (languageVoice) {
        utterance.voice = languageVoice;
      }
    }

    // Set speech parameters
    if (finalOptions.rate !== undefined) utterance.rate = finalOptions.rate;
    if (finalOptions.pitch !== undefined) utterance.pitch = finalOptions.pitch;
    if (finalOptions.volume !== undefined) utterance.volume = finalOptions.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  };

  return {
    isSpeaking,
    availableVoices,
    speak,
    cancel,
    pause,
    resume,
    isSupported,
  };
};
