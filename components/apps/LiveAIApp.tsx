import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, StopIcon } from '../Icons';
import { startLiveSession, processLiveAudio } from '../../services/geminiAdvancedService';

/**
 * LiveAIApp - Real-time AI interactions with Gemini Live API
 * Based on: https://ai.google.dev/gemini-api/docs/live
 * 
 * Features:
 * - Real-time voice interactions
 * - Continuous conversation
 * - Audio/video streaming
 * - Low-latency responses
 */
const LiveAIApp: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<{
        id: string;
        type: 'user' | 'ai';
        text: string;
        timestamp: number;
    }>>([]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const startSession = async () => {
        try {
            setError(null);
            const session = await startLiveSession();
            setSessionId(session.sessionId);
            setIsActive(true);
            setMessages([{
                id: Date.now().toString(),
                type: 'ai',
                text: 'Live session started! I can now respond to you in real-time. Start speaking!',
                timestamp: Date.now()
            }]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const stopSession = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
        }
        setIsActive(false);
        setIsListening(false);
        setSessionId(null);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            text: 'Live session ended.',
            timestamp: Date.now()
        }]);
    };

    const startListening = async () => {
        if (!sessionId) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'user',
                text: '🎤 Listening...',
                timestamp: Date.now()
            }]);
        } catch (err: any) {
            setError('Microphone access denied. Please allow microphone access.');
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        if (!sessionId) return;

        setIsProcessing(true);
        try {
            const result = await processLiveAudio(audioBlob, sessionId);
            
            // Update the listening message with transcription
            setMessages(prev => {
                const updated = [...prev];
                const lastUserMsg = updated.findLast(m => m.type === 'user');
                if (lastUserMsg) {
                    lastUserMsg.text = result.text;
                }
                return updated;
            });

            // Add AI response
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'ai',
                text: result.response,
                timestamp: Date.now()
            }]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-white/20 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="text-3xl">🎙️</div>
                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-display">Live AI</h1>
                            <p className="text-sm text-purple-200">Real-time conversations with Gemini</p>
                        </div>
                    </div>
                    {isActive ? (
                        <button
                            onClick={stopSession}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <StopIcon className="w-5 h-5" />
                            End Session
                        </button>
                    ) : (
                        <button
                            onClick={startSession}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Start Live Session
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        ❌ {error}
                    </div>
                )}

                {!isActive && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-8xl mb-6">🎙️</div>
                        <h2 className="text-2xl font-bold mb-2">Start a Live Session</h2>
                        <p className="text-purple-200 max-w-md mb-6">
                            Experience real-time AI conversations with ultra-low latency using Gemini's Live API
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-lg">
                            <p className="text-sm text-purple-300 mb-2 font-semibold">Features:</p>
                            <ul className="text-xs text-purple-400 space-y-1 text-left">
                                <li>• Natural, flowing conversations</li>
                                <li>• Real-time speech recognition</li>
                                <li>• Instant AI responses</li>
                                <li>• Continuous interaction mode</li>
                            </ul>
                        </div>
                    </div>
                )}

                {isActive && (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* Messages */}
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${
                                        message.type === 'user'
                                            ? 'bg-blue-500/20 border border-blue-500/50'
                                            : 'bg-purple-500/20 border border-purple-500/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold">
                                            {message.type === 'user' ? 'You' : 'AI'}
                                        </span>
                                        <span className="text-xs text-purple-400">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-purple-500/20 border border-purple-500/50 rounded-2xl p-4">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Voice Control */}
            {isActive && (
                <footer className="flex-shrink-0 p-4 border-t border-white/20 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-4">
                        {!isListening ? (
                            <button
                                onClick={startListening}
                                disabled={isProcessing}
                                className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span className="text-3xl">🎤</span>
                            </button>
                        ) : (
                            <button
                                onClick={stopListening}
                                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center shadow-lg animate-pulse"
                            >
                                <StopIcon className="w-8 h-8" />
                            </button>
                        )}
                    </div>
                    <p className="text-center text-sm text-purple-300 mt-3">
                        {isListening ? 'Listening... Click to stop' : 'Click to speak'}
                    </p>
                </footer>
            )}

            {/* Info */}
            <div className="p-3 bg-white/5 border-t border-white/10 text-xs text-center">
                <p className="text-purple-300">
                    Powered by Gemini Live API • <a href="https://ai.google.dev/gemini-api/docs/live" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-200">Learn more</a>
                </p>
            </div>
        </div>
    );
};

export default LiveAIApp;
