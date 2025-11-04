import React, { useState, useRef, useEffect } from 'react';
import { VoiceService, TTSOptions } from '../../packages/voice-service/src/index';
import { PlayIcon, StopIcon } from '../Icons';

/**
 * AudioStudioApp - A comprehensive interface for text-to-speech (TTS) generation.
 * Users can input text, select different voices, and adjust speech parameters.
 */
const AudioStudioApp: React.FC = () => {
    const [text, setText] = useState('Hello, this is a test of the text-to-speech engine.');
    const [isPlaying, setIsPlaying] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const voiceServiceRef = useRef<VoiceService | null>(null);

    useEffect(() => {
        if (!voiceServiceRef.current) {
            voiceServiceRef.current = new VoiceService({ enableSTT: false });
        }

        const vs = voiceServiceRef.current;

        const populateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            // Set a default voice if available
            if (availableVoices.length > 0) {
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                setSelectedVoiceURI(defaultVoice.voiceURI);
            }
        };

        // Voices are loaded asynchronously
        populateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoices;
        }

        const handleSpeechStart = () => setIsPlaying(true);
        const handleSpeechEnd = () => setIsPlaying(false);
        vs.on('speech-start', handleSpeechStart);
        vs.on('speech-end', handleSpeechEnd);

        return () => {
            vs.off('speech-start', handleSpeechStart);
            vs.off('speech-end', handleSpeechEnd);
            vs.stopSpeaking();
        };
    }, []);

    const handlePlay = () => {
        if (!text.trim() || !voiceServiceRef.current) return;

        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

        const options: TTSOptions = {
            voice: selectedVoice,
            rate,
            pitch,
        };
        voiceServiceRef.current.speak(text, options);
    };

    const handleStop = () => {
        if (voiceServiceRef.current) {
            voiceServiceRef.current.stopSpeaking();
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6 overflow-y-auto">
            <header className="flex-shrink-0 flex items-center gap-3 mb-6">
                <span className="text-4xl">🎵</span>
                <h1 className="font-display text-2xl font-bold">Audio Studio</h1>
            </header>

            <main className="flex-grow space-y-6">
                <div>
                    <label htmlFor="tts-text" className="block text-sm font-medium text-text-secondary mb-2">Text to Synthesize</label>
                    <textarea
                        id="tts-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={5}
                        className="w-full bg-black/20 border border-border-color rounded-md p-3 focus:ring-2 focus:ring-primary-cyan focus:outline-none resize-none"
                        placeholder="Enter text to generate audio..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-text-secondary mb-2">Voice</label>
                        <select
                            id="voice-select"
                            value={selectedVoiceURI}
                            onChange={(e) => setSelectedVoiceURI(e.target.value)}
                            className="w-full bg-black/20 border border-border-color rounded-md p-3 focus:ring-2 focus:ring-primary-cyan focus:outline-none"
                        >
                            {voices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {`${voice.name} (${voice.lang})`}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="rate-slider" className="block text-sm font-medium text-text-secondary mb-2">Rate: {rate.toFixed(1)}</label>
                        <input id="rate-slider" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-cyan" />
                    </div>
                     <div>
                        <label htmlFor="pitch-slider" className="block text-sm font-medium text-text-secondary mb-2">Pitch: {pitch.toFixed(1)}</label>
                        <input id="pitch-slider" type="range" min="0" max="2" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-cyan" />
                    </div>
                </div>

                <div className="flex justify-center items-center pt-4">
                    {!isPlaying ? (
                        <button onClick={handlePlay} className="px-8 py-4 font-bold rounded-lg bg-gradient-to-r from-primary-cyan to-sky-500 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                            <PlayIcon className="w-6 h-6"/>
                            Generate & Play
                        </button>
                    ) : (
                        <button onClick={handleStop} className="px-8 py-4 font-bold rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                            <StopIcon className="w-6 h-6"/>
                            Stop
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AudioStudioApp;
