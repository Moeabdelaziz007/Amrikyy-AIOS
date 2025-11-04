import React, { useState, useRef, useEffect } from 'react';
import { interpretVoiceCommand, processLiveAudio, startLiveSession } from '../services/geminiAdvancedService';
import { useLanguage } from '../contexts/LanguageContext';

interface GlobalVoiceControlProps {
    onCommand: (command: string) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'speaking';

const GlobalVoiceControl: React.FC<GlobalVoiceControlProps> = ({ onCommand }) => {
    const { t } = useLanguage();
    const [state, setState] = useState<RecordingState>('idle');
    const [isListening, setIsListening] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
    const [aiResponse, setAiResponse] = useState<string>('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize Gemini Live session
        const initSession = async () => {
            try {
                const session = await startLiveSession();
                setSessionId(session.sessionId);
            } catch (error) {
                console.error('Failed to start live session:', error);
            }
        };
        initSession();

        // @ts-expect-error - SpeechRecognition API types are not fully standardized across browsers
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = async (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                
                if (event.results[event.results.length - 1].isFinal) {
                    setState('processing');
                    
                    // Use Gemini Live API for real-time processing
                    if (sessionId && audioChunksRef.current.length > 0) {
                        try {
                            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                            const result = await processLiveAudio(audioBlob, sessionId);
                            setAiResponse(result.response);
                            setState('speaking');
                            
                            // Speak the response
                            const utterance = new SpeechSynthesisUtterance(result.response);
                            utterance.onend = () => {
                                setState('recording');
                                setAiResponse('');
                            };
                            window.speechSynthesis.speak(utterance);
                            
                            audioChunksRef.current = [];
                        } catch (error) {
                            console.error('Live audio processing error:', error);
                        }
                    } else {
                        // Fallback to command interpretation
                        const command = await interpretVoiceCommand(transcript);
                        if (command) {
                            onCommand(`${command.action} ${command.target}`);
                        }
                        setState('recording');
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error !== 'no-speech') {
                    stopListening();
                }
            };
            
            recognitionRef.current.onend = () => {
                if (isListening && state !== 'speaking') {
                     try { 
                        recognitionRef.current.start(); 
                     } catch(e) { 
                        console.error(e); 
                        stopListening(); 
                     }
                } else if (!isListening) {
                    setState('idle');
                }
            };
        }
    }, [onCommand, isListening, sessionId]);

    // Audio visualization
    const visualizeAudio = (stream: MediaStream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateLevels = () => {
            if (!analyserRef.current || !isListening) return;
            
            analyser.getByteFrequencyData(dataArray);
            const levels = Array.from(dataArray.slice(0, 20)).map(val => val / 255);
            setAudioLevels(levels);
            
            animationFrameRef.current = requestAnimationFrame(updateLevels);
        };
        
        updateLevels();
    };
    
    const startListening = async () => {
        if (recognitionRef.current && !isListening) {
             try {
                // Start audio stream for visualization and recording
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.start(1000); // Collect data every second
                visualizeAudio(stream);

                recognitionRef.current.start();
                setIsListening(true);
                setState('recording');
             } catch(e) {
                console.error("Could not start recognition", e);
             }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setState('idle');
            setAudioLevels(Array(20).fill(0));
            
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
            window.speechSynthesis.cancel();
        }
    };
    
    const handleClick = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition not supported by this browser.");
            return;
        }
        
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const getStatusText = () => {
        if(state === 'recording') return t('voice_control.listening');
        if(state === 'processing') return t('voice_control.processing');
        if(state === 'speaking') return 'Speaking...';
        return '';
    };

    const getStatusColor = () => {
        if(state === 'recording') return 'text-green-400';
        if(state === 'processing') return 'text-yellow-400';
        if(state === 'speaking') return 'text-purple-400';
        return 'text-cyan-300';
    };

    return (
        <>
            {/* Voice Wave Visualization */}
            {isListening && (
                <div className="fixed bottom-24 left-6 z-40 flex items-end gap-1 h-16">
                    {audioLevels.map((level, i) => (
                        <div
                            key={i}
                            className="w-1.5 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full transition-all duration-75"
                            style={{
                                height: `${Math.max(level * 100, 10)}%`,
                                opacity: 0.6 + level * 0.4
                            }}
                        />
                    ))}
                </div>
            )}

            {/* AI Response Bubble */}
            {aiResponse && (
                <div className="fixed bottom-24 left-24 z-40 max-w-xs bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-purple-500/50 shadow-lg animate-slide-up">
                    <div className="flex items-start gap-2">
                        <span className="text-2xl">🤖</span>
                        <p className="text-sm text-white">{aiResponse}</p>
                    </div>
                </div>
            )}

            {/* Main Voice Button */}
            <div className="fixed bottom-6 left-6 z-50 group">
                <button
                    onClick={handleClick}
                    aria-label="Toggle Voice Control"
                    className={`size-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative
                        ${isListening 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                            : 'bg-white/10 text-cyan-300 backdrop-blur-md hover:bg-white/20'}`}
                >
                    {/* Ripple effect when listening */}
                    {isListening && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
                            <div className="absolute inset-0 rounded-full bg-purple-400 animate-pulse opacity-20" />
                        </>
                    )}
                    
                    <span className={`material-symbols-outlined text-3xl z-10 ${getStatusColor()}`}>
                        {state === 'speaking' ? 'volume_up' : isListening ? 'mic' : 'mic_off'}
                    </span>
                </button>
                
                {/* Status Text */}
                <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-white text-sm whitespace-nowrap transition-all duration-200 border border-white/10 ${getStatusText() ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                    <div className="flex items-center gap-2">
                        {state === 'recording' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                        {state === 'processing' && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin border-2 border-t-transparent" />}
                        {state === 'speaking' && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />}
                        <span className={getStatusColor()}>{getStatusText()}</span>
                    </div>
                </div>

                {/* Powered by Gemini badge */}
                {isListening && (
                    <div className="absolute -top-8 left-0 px-2 py-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md rounded-lg text-xs text-white font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Gemini Live
                    </div>
                )}
            </div>
        </>
    );
};

export default GlobalVoiceControl;