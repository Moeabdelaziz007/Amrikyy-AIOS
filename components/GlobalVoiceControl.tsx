import React, { useState, useRef, useEffect } from 'react';
import { interpretVoiceCommand } from '../services/geminiAdvancedService';
import { useLanguage } from '../contexts/LanguageContext';
import { safeAlert } from '../utils/safeAlert';

// --- Types ---
type RecordingState = 'idle' | 'recording' | 'processing' | 'speaking';
type LanguageOption = 'en-US' | 'ar-SA';

// --- API Service Wrappers ---
async function fetchTranscription(audioBlob: Blob, language: LanguageOption): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const response = await fetch('/api/transcribe/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Audio, languageCode: language }),
        });
        if (!response.ok) throw new Error(`Transcription failed: ${response.statusText}`);
        const data = await response.json();
        resolve(data.transcription || '');
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

async function fetchSpeech(text: string, language: LanguageOption): Promise<string> {
  const voiceMap = {
    'en-US': { languageCode: 'en-US', name: 'en-US-Studio-M' },
    'ar-SA': { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-B' },
  };
  const response = await fetch('/api/speech/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voiceMap[language] }),
  });
  if (!response.ok) throw new Error(`Speech synthesis failed: ${response.statusText}`);
  const data = await response.json();
  return data.audioContent; // This is a base64 data URI
}

// --- Component ---
const GlobalVoiceControl: React.FC<{ onCommand: (cmd: string) => void }> = ({ onCommand }) => {
  const { t } = useLanguage();
  const [state, setState] = useState<RecordingState>('idle');
  const [language, setLanguage] = useState<LanguageOption>('en-US');
  const [aiResponse, setAiResponse] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (state !== 'idle') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setState('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });

        try {
          const transcript = await fetchTranscription(audioBlob, language);
          if (transcript) {
            const command = await interpretVoiceCommand(transcript);
            if (command?.action) {
              // For now, let's just speak the interpreted command back
              const responseText = `Command: ${command.action}, Target: ${command.target}`;
              setAiResponse(responseText);
              await speakResponse(responseText, language);
              onCommand(`${command.action} ${command.target}`);
            } else {
              setAiResponse("Couldn't understand that. Please try again.");
              await speakResponse("Couldn't understand that. Please try again.", language);
            }
          }
        } catch (error) {
          console.error('Error during processing:', error);
          safeAlert('An error occurred. Please try again.');
        } finally {
          setState('idle');
        }
      };

      mediaRecorderRef.current.start();
      setState('recording');
    } catch (err) {
      console.error('Could not start audio capture:', err);
      safeAlert(t('voice_control.unsupported'));
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const speakResponse = async (text: string, lang: LanguageOption) => {
    try {
      setState('speaking');
      const audioDataUri = await fetchSpeech(text, lang);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioDataUri;
        await audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error('speakResponse error:', error);
      setState('idle');
    }
  };

  useEffect(() => {
    // Setup audio player
    const audio = new Audio();
    audioPlayerRef.current = audio;
    audio.onended = () => setState('idle');

    // Global hotkey for voice activation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey && event.key === 'a') {
        if (state === 'idle') startRecording();
        else if (state === 'recording') stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]); // Rerun effect if state changes to correctly handle start/stop

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">
      {/* Language Switcher */}
      <div className="flex gap-2 bg-black/30 backdrop-blur-sm p-1 rounded-full border border-white/10">
        <button onClick={() => setLanguage('en-US')} className={`px-3 py-1 text-xs rounded-full ${language === 'en-US' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>English</button>
        <button onClick={() => setLanguage('ar-SA')} className={`px-3 py-1 text-xs rounded-full ${language === 'ar-SA' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>العربية</button>
      </div>

      {/* Main Voice Control Button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${state === 'recording' ? 'bg-red-500 scale-110' : 'bg-cyan-600'}`}>
        <span className="material-symbols-outlined text-3xl text-white">
          {state === 'recording' ? 'mic' : 'mic_off'}
        </span>
      </button>

      {/* Status & AI Response */}
      {state !== 'idle' && (
        <div className="absolute bottom-full mb-4 w-72 p-3 bg-black/80 backdrop-blur-md rounded-lg text-center">
          <p className="text-sm text-white">{state === 'processing' ? 'Processing...' : state === 'speaking' ? 'Speaking...' : 'Listening...'}</p>
          {aiResponse && <p className="text-xs text-gray-300 mt-1">{aiResponse}</p>}
        </div>
      )}
    </div>
  );
};

export default GlobalVoiceControl;
