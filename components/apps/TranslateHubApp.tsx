import React, { useState, useRef, useEffect } from 'react';
import { TranslateIcon, SparklesIcon, SendIcon, SpeakerIcon, MicrophoneIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { SystemVoice } from '../../types';
import { generateSpeech, translateText, transcribeAudio } from '../../services/geminiAdvancedService';
import { decode, playDecodedAudio, encode } from '../../utils/audioUtils';
import { fileToBase64 } from '../../utils/fileUtils'; // Import fileToBase64

type Tab = 'text' | 'conversation';
type AudioState = 'idle' | 'listening' | 'translating' | 'speaking';

interface TranslateHubAppProps {
    speechSettings: {
        voice: SystemVoice;
        rate: number;
        pitch: number;
    };
}

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
];

const TranslateHubApp: React.FC<TranslateHubAppProps> = ({ speechSettings }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('text');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <TranslateIcon className="w-8 h-8 text-primary-cyan"/>
                    <h1 className="font-display text-2xl font-bold">{t('translate_hub.title')}</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="text" activeTab={activeTab} setActiveTab={setActiveTab} label={t('translate_hub.text_tab')} />
                    <TabButton id="conversation" activeTab={activeTab} setActiveTab={setActiveTab} label={t('translate_hub.conversation_tab')} />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'text' && <TextTranslateView speechSettings={speechSettings} />}
                {activeTab === 'conversation' && <ConversationTranslateView speechSettings={speechSettings} />}
            </main>
        </div>
    );
};

const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

const TextTranslateView: React.FC<TranslateHubAppProps> = ({ speechSettings }) => {
    const { t } = useLanguage();
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('es'); // Default to Spanish
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
      return () => {
        audioContextRef.current?.close();
      }
    }, []);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }

    const handleTranslate = async () => {
        if (!inputText.trim() || isLoading) return;
        setIsLoading(true);
        setOutputText('');
        try {
            const translated = await translateText(inputText, targetLang, sourceLang === 'auto' ? undefined : sourceLang);
            setOutputText(translated);
        } catch (error) {
            console.error("Translation error:", error);
            setOutputText("Failed to translate text.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = async (text: string) => {
        if (!text || isSpeaking) return;
        initAudioContext();
        if (!audioContextRef.current) return;

        setIsSpeaking(true);
        try {
            const { voice, rate, pitch } = speechSettings;
            const base64Audio = await generateSpeech(text, voice, rate, pitch);
            if (base64Audio) {
                await playDecodedAudio(decode(base64Audio), audioContextRef.current);
            }
        } catch (error) {
            console.error("Speech synthesis error:", error);
        } finally {
            setIsSpeaking(false);
        }
    };

    return (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="source-lang" className="text-sm font-semibold">{t('translate_hub.source_language')}</label>
                    <select 
                        id="source-lang" 
                        value={sourceLang} 
                        onChange={e => setSourceLang(e.target.value)} 
                        className="bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-cyan focus:outline-none"
                    >
                        <option value="auto">Detect Language</option>
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={t('translate_hub.input_placeholder')}
                    rows={8}
                    className="w-full flex-grow bg-white/5 border border-white/10 rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary-cyan focus:outline-none resize-none"
                    disabled={isLoading}
                />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="target-lang" className="text-sm font-semibold">{t('translate_hub.target_language')}</label>
                    <select 
                        id="target-lang" 
                        value={targetLang} 
                        onChange={e => setTargetLang(e.target.value)} 
                        className="bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-cyan focus:outline-none"
                        disabled={isLoading}
                    >
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <div className="relative flex-grow">
                    <textarea
                        value={outputText}
                        readOnly
                        placeholder={t('translate_hub.output_placeholder')}
                        rows={8}
                        className="w-full h-full bg-black/20 border border-white/10 rounded-lg p-3 text-text-primary resize-none focus:outline-none"
                    />
                     <button
                        onClick={() => handleSpeak(outputText)}
                        disabled={isSpeaking || !outputText}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-primary-purple text-white hover:bg-primary-purple/80 transition-colors disabled:opacity-50"
                        aria-label="Speak translated text"
                    >
                        {isSpeaking ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <SpeakerIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <button
                    onClick={handleTranslate}
                    disabled={isLoading || !inputText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 font-bold rounded-lg bg-gradient-to-r from-primary-cyan to-primary-blue hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                    {t('translate_hub.translate_button')}
                </button>
            </div>
        </div>
    );
};

const ConversationTranslateView: React.FC<TranslateHubAppProps> = ({ speechSettings }) => {
    const { t } = useLanguage();
    const [audioState, setAudioState] = useState<AudioState>('idle');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('ar');
    const [transcribedText, setTranscribedText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = processConversation;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setAudioState('listening');
            setTranscribedText('');
            setTranslatedText('');
            setError(null);
        } catch (err) {
            setError(t('translate_hub.error_mic_access'));
            console.error("Microphone access error:", err);
            setAudioState('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && audioState === 'listening') {
            mediaRecorderRef.current.stop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setAudioState('translating');
        }
    };

    const processConversation = async () => {
        if (audioChunksRef.current.length === 0) {
            setAudioState('idle');
            return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });

        try {
            // 1. Transcribe audio
            const base64Audio = await fileToBase64(audioFile);
            const transcript = await transcribeAudio(base64Audio.split(',')[1], audioFile.type);
            if (!isMounted.current) return;
            setTranscribedText(transcript);

            // 2. Translate the transcribed text
            const translated = await translateText(transcript, targetLang, sourceLang);
            if (!isMounted.current) return;
            setTranslatedText(translated);
            setAudioState('speaking');

            // 3. Generate speech from the translated text
            initAudioContext();
            if (!audioContextRef.current) return;
            const { voice, rate, pitch } = speechSettings;
            const translatedAudioBase64 = await generateSpeech(translated, voice, rate, pitch);
            if (!isMounted.current) return;

            if (translatedAudioBase64) {
                await playDecodedAudio(decode(translatedAudioBase64), audioContextRef.current);
            }
        } catch (e) {
            console.error("Conversation processing error:", e);
            setError("Failed to process conversation.");
        } finally {
            if (isMounted.current) {
                setAudioState('idle');
            }
        }
    };

    const handleToggleListening = () => {
        if (audioState === 'listening') {
            stopRecording();
        } else if (audioState === 'idle' || audioState === 'speaking') { // Allow re-initiating after speaking
            startRecording();
        }
    };

    const getStatusMessage = () => {
        switch (audioState) {
            case 'listening': return t('translate_hub.listening');
            case 'translating': return t('translate_hub.translating');
            case 'speaking': return t('translate_hub.speaking');
            default: return '';
        }
    };

    return (
        <div className="p-4 md:p-6 flex flex-col items-center justify-center gap-6 h-full text-center">
            <div className="flex items-center gap-4">
                <select 
                    value={sourceLang} 
                    onChange={e => setSourceLang(e.target.value)} 
                    className="bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-cyan focus:outline-none"
                    disabled={audioState !== 'idle'}
                >
                    {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
                <span className="material-symbols-outlined text-xl text-text-muted">arrow_forward</span>
                <select 
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value)} 
                    className="bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary-cyan focus:outline-none"
                    disabled={audioState !== 'idle'}
                >
                    {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
            </div>

            <div className="relative size-48 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-2 ${audioState === 'listening' ? 'border-red-500 animate-ping-slow' : 'border-primary-cyan/30'}`} />
                <div className={`absolute inset-4 rounded-full border ${audioState === 'listening' ? 'border-red-400 animate-pulse-fast' : 'border-primary-cyan/20'}`} />
                <button
                    onClick={handleToggleListening}
                    disabled={audioState === 'translating'}
                    className={`relative size-32 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg
                        ${audioState === 'listening' ? 'bg-red-600' : 'bg-primary-blue hover:bg-primary-blue/80'} disabled:bg-gray-500`}
                >
                    <MicrophoneIcon className="w-12 h-12" />
                </button>
                {getStatusMessage() && (
                    <div className="absolute -bottom-8 px-3 py-1 bg-black/50 rounded-lg text-sm whitespace-nowrap">
                        {getStatusMessage()}
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 mt-4">{error}</p>}

            <div className="w-full max-w-lg mt-4 space-y-4">
                {transcribedText && (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/10 text-left">
                        <p className="text-xs text-text-muted">{t('translate_hub.source_language')} ({sourceLang.toUpperCase()})</p>
                        <p className="text-sm">{transcribedText}</p>
                    </div>
                )}
                {translatedText && (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/10 text-left">
                        <p className="text-xs text-text-muted">{t('translate_hub.target_language')} ({targetLang.toUpperCase()})</p>
                        <p className="text-sm">{translatedText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};