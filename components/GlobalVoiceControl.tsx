// cancel visualization loop
import React, { useState, useRef, useEffect } from 'react';
import { interpretVoiceCommand, processLiveAudio } from '../services/geminiAdvancedService';
import { transcribeAudioBlob, synthesizeTextToAudioUrl, GOOGLE_API_KEY } from '../services/googleSpeechService';
import { useLanguage } from '../contexts/LanguageContext';
import agentDef from '../data/aiAgent.aix.json';
import { safeAlert } from '../utils/safeAlert';

type GlobalVoiceControlProps = {
  onCommand: (command: string) => void;
};

type RecordingState = 'idle' | 'recording' | 'processing' | 'speaking';

const GlobalVoiceControl: React.FC<GlobalVoiceControlProps> = ({ onCommand }) => {
  const { t } = useLanguage();
  const [state, setState] = useState<RecordingState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize Gemini Live session (non-blocking)
    const initSession = async () => {
      try {
        // dynamic import and guard for test mocks
        const mod = await import('../services/geminiAdvancedService');
        const startLiveSessionFn = mod.startLiveSession;
        if (typeof startLiveSessionFn === 'function') {
          const session = await startLiveSessionFn();
          setSessionId(session?.sessionId ?? null);
        } else {
          // mocked module may not export startLiveSession; skip
          setSessionId(null);
        }
      } catch (error) {
        console.warn('Failed to start live session:', error);
        setSessionId(null);
      }
    };
    initSession();

    // Create SpeechRecognition safely; tests may mock this differently
    try {
      // @ts-expect-error vendor prefixed
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (typeof SR === 'function' || typeof SR === 'object') {
        // If SR is a constructor function, instantiate. If it's a mock factory, guard with try/catch
        try {
          // @ts-ignore
          recognitionRef.current = new SR();
        } catch (instErr) {
          // Some test mocks export a factory function; try calling it
          try {
            // @ts-ignore
            recognitionRef.current = SR();
          } catch (e) {
            console.warn('SpeechRecognition: unable to instantiate mock', e);
            recognitionRef.current = null;
          }
        }
      }
    } catch (e) {
      console.warn('SpeechRecognition setup failed', e);
      recognitionRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = async (event: any) => {
          try {
            const last = event.results[event.results.length - 1];
            const transcript = last?.[0]?.transcript?.trim();
            const isFinal = last?.isFinal;
            if (!transcript) return;

            if (isFinal) {
              setState('processing');

              // Try to use recorded audio if available + live session
              if (sessionId && audioChunksRef.current.length > 0) {
                try {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  const result = await processLiveAudio(audioBlob, sessionId);
                  if (result?.response) {
                    await speakResponse(result.response);
                  } else if (result?.transcript) {
                    const cmd = await interpretVoiceCommand(result.transcript);
                    if (cmd) onCommand(`${cmd.action} ${cmd.target}`);
                  }
                } catch (err) {
                  console.warn('processLiveAudio failed, falling back to transcript interpretation', err);
                  const cmd = await interpretVoiceCommand(transcript);
                  if (cmd) onCommand(`${cmd.action} ${cmd.target}`);
                } finally {
                  audioChunksRef.current = [];
                }
              } else {
                // No audio blob: interpret the transcript text
                const cmd = await interpretVoiceCommand(transcript);
                if (cmd) onCommand(`${cmd.action} ${cmd.target}`);
              }

              setState('recording');
            }
          } catch (e) {
            console.error('onresult handler error', e);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event?.error);
          // Stop listening when recognition error occurs to allow manual restart
          stopListening();
        };

        recognitionRef.current.onend = () => {
          if (isListening && state !== 'speaking') {
            // try restart
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn('Failed to restart recognition', e);
              stopListening();
            }
          } else if (!isListening) {
            setState('idle');
          }
        };
      } catch (e) {
        console.warn('SpeechRecognition setup failed', e);
        recognitionRef.current = null;
      }
    }

    return () => {
      // cleanup
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio visualization helper
  const visualizeAudio = (stream: MediaStream) => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (!analyserRef.current || !isListening) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 20)).map((v) => v / 255);
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch (e) {
      console.warn('visualizeAudio error', e);
    }
  };

  const startListening = async () => {
    if (isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      visualizeAudio(stream);

      // always attempt to record blobs (for server-side processing)
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
        };
        mediaRecorder.start(1000);
      } catch (e) {
        console.warn('MediaRecorder not available', e);
        mediaRecorderRef.current = null;
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsListening(true);
      setState('recording');
    } catch (err) {
      console.error('Could not start audio capture / recognition', err);
      setIsListening(false);
      setState('idle');
    }
  };

  const stopListening = async () => {
    if (!isListening) return;
    setIsListening(false);
    setState('processing');
    setAudioLevels(Array(20).fill(0));

    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {
      console.warn('Error stopping recognition', e);
    }

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    } catch (e) {
      console.warn('Error stopping media recorder or tracks', e);
    }

    try {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Prefer Google transcription if configured
        if (GOOGLE_API_KEY) {
          try {
            const transcript = await transcribeAudioBlob(audioBlob);
            if (transcript) {
              const cmd = await interpretVoiceCommand(transcript);
              if (cmd) onCommand(`${cmd.action} ${cmd.target}`);
              setState('idle');
              return;
            }
          } catch (gErr) {
            console.warn('Google transcription failed, falling back to live processing', gErr);
          }
        }

        // If session exists, try live processing
        if (sessionId) {
          try {
            const result = await processLiveAudio(audioBlob, sessionId);
            if (result?.response) {
              await speakResponse(result.response);
            } else if (result?.transcript) {
              const cmd = await interpretVoiceCommand(result.transcript);
              if (cmd) onCommand(`${cmd.action} ${cmd.target}`);
            }
          } catch (err) {
            console.error('processLiveAudio error', err);
          }
        } else {
          // no session and no google key: fallback to idle
          console.warn('No live session available to process audio.');
        }
      }
    } finally {
      audioChunksRef.current = [];
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      analyserRef.current = null;
      setState('idle');
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setAiResponse(text);
      if (GOOGLE_API_KEY) {
        const url = await synthesizeTextToAudioUrl(text);
        const audio = new Audio(url);
        setState('speaking');
        audio.onended = () => {
          setState('idle');
          setAiResponse('');
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setState('idle');
          setAiResponse('');
        };
        setState('speaking');
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('speakResponse error', e);
      setState('idle');
      setAiResponse('');
    }
  };

  const handleClick = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      safeAlert(t('voice_control.unsupported') || 'Voice recognition not supported by this browser.');
      return;
    }

    if (isListening) stopListening();
    else startListening();
  };

  const getStatusText = () => {
    if (state === 'recording') return t('voice_control.listening');
    if (state === 'processing') return t('voice_control.processing');
    if (state === 'speaking') return 'Speaking...';
    return '';
  };

  const getStatusColor = () => {
    if (state === 'recording') return 'text-green-400';
    if (state === 'processing') return 'text-yellow-400';
    if (state === 'speaking') return 'text-purple-400';
    return 'text-cyan-300';
  };

  return (
    <>
      {/* Voice Wave Visualization */}
      {isListening && (
        <div className="fixed bottom-24 left-6 z-40 flex items-end gap-1 h-20 pointer-events-none">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-cyan-400 via-blue-400 to-purple-600 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(level * 120, 8)}%`, opacity: 0.5 + level * 0.6, transform: `translateZ(${level * 8}px)` }}
            />
          ))}
        </div>
      )}

      {/* AI Response Bubble */}
      {aiResponse && (
        <div className="fixed bottom-28 left-28 z-40 max-w-xs bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-purple-500/50 shadow-lg animate-slide-up">
          <div className="flex items-start gap-2">
            <span className="text-2xl">🤖</span>
            <p className="text-sm text-white">{aiResponse}</p>
          </div>
        </div>
      )}

      {/* Main Voice + Help Controls */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        {/* AI Online Badge */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-xs text-white/90 font-medium">AI Online</span>
        </div>

        <div className="group relative">
          <button
            onClick={handleClick}
            aria-label="Toggle Voice Control"
            title="Toggle Voice Control"
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 will-change-transform ${isListening ? 'scale-105' : 'hover:scale-105'} bg-gradient-to-br from-cyan-600/20 to-purple-700/20 backdrop-blur-md border border-white/5 shadow-xl overflow-visible`}
          >
            {/* Hologram wave rings */}
            <span className={`absolute inset-0 rounded-full ${isListening ? 'animate-pulse opacity-60' : 'opacity-30'}`} style={{ boxShadow: `inset 0 0 30px rgba(99,102,241,${isListening ? 0.25 : 0.08})` }} />
            <svg className="absolute w-22 h-22 -z-10" viewBox="0 0 64 64" fill="none" aria-hidden>
              <defs>
                <radialGradient id="hg" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={isListening ? 0.18 : 0.06} />
                  <stop offset="60%" stopColor="#7C4DFF" stopOpacity={isListening ? 0.08 : 0.02} />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r={isListening ? 28 : 22} fill="url(#hg)" />
            </svg>

            <span className={`material-symbols-outlined text-2xl z-10 ${getStatusColor()}`}>{state === 'speaking' ? 'volume_up' : isListening ? 'mic' : 'mic_off'}</span>

            {isListening && <span className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-ping opacity-60" />}
          </button>

          {/* Status tooltip */}
          <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-white text-sm whitespace-nowrap transition-all duration-200 border border-white/10 ${getStatusText() ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
            <div className="flex items-center gap-2">
              {state === 'recording' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
              {state === 'processing' && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin border-2 border-t-transparent" />}
              {state === 'speaking' && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />}
              <span className={getStatusColor()}>{getStatusText()}</span>
            </div>
          </div>

          {/* Help button */}
          <button onClick={() => setShowHelp((p) => !p)} aria-label="Help" title="How does this work?" className="absolute -top-10 left-0 w-8 h-8 rounded-full bg-white/6 flex items-center justify-center text-sm text-white/80 hover:bg-white/10">?</button>
        </div>

        {/* Small help overlay */}
        {showHelp && (
          <div className="w-80 p-3 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-sm text-white shadow-lg">
            <h4 className="font-semibold text-white mb-1">{agentDef.persona?.greeting || 'Welcome to Amrikyy AI OS'}</h4>
            <p className="text-xs text-white/80 mb-2">{agentDef.persona?.summary || 'Your voice assistant is ready.'}</p>
            <div className="text-xs text-white/80 mb-2">
              <strong>Role:</strong> {agentDef.role}
            </div>
            <div className="text-xs text-white/80 mb-2">
              <strong>Skills:</strong> {agentDef.skills?.join(', ')}
            </div>
            <ul className="text-xs text-white/80 list-disc ml-4 space-y-1">
              <li>Try: "open chat" or "open files" to launch apps.</li>
              <li>Use the App Launcher (bottom dock) to browse categorized apps.</li>
              <li>Click an app to open a window; hover icons for short descriptions.</li>
            </ul>
            <div className="mt-2 text-xs text-white/70">Tip: For best results, allow microphone access and speak clearly.</div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalVoiceControl;
