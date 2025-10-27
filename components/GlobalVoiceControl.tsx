import React, { useState, useRef, useEffect } from 'react';
import { interpretVoiceCommand } from '../services/geminiAdvancedService';
import { useLanguage } from '../contexts/LanguageContext';

interface GlobalVoiceControlProps {
    onCommand: (command: string) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing';

const GlobalVoiceControl: React.FC<GlobalVoiceControlProps> = ({ onCommand }) => {
    const { t } = useLanguage();
    const [state, setState] = useState<RecordingState>('idle');
    const [isListening, setIsListening] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null); // SpeechRecognition instance

    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                setState('processing');
                const command = await interpretVoiceCommand(transcript);
                if (command) {
                    onCommand(`${command.action} ${command.target}`);
                }
                stopListening();
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                stopListening();
            };
            
            recognitionRef.current.onend = () => {
                if (isListening) { // Auto-restart if it was intentionally listening
                     try { recognitionRef.current.start(); } catch(e) { console.error(e); stopListening(); }
                } else {
                    setState('idle');
                }
            };
        }
    }, [onCommand, isListening]);
    
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
             try {
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
        return '';
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 group">
            <button
                onClick={handleClick}
                aria-label="Toggle Voice Control"
                className={`size-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                    ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-cyan-300 backdrop-blur-md hover:bg-white/20'}`}
            >
                <span className="material-symbols-outlined text-3xl">
                    {isListening ? 'mic_off' : 'mic'}
                </span>
            </button>
            <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/50 rounded-lg text-white text-sm whitespace-nowrap transition-opacity ${getStatusText() ? 'opacity-100' : 'opacity-0'}`}>
                {getStatusText()}
            </div>
        </div>
    );
};

export default GlobalVoiceControl;