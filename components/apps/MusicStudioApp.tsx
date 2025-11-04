import React, { useState } from 'react';
import { SparklesIcon, PlayIcon, StopIcon, DownloadIcon } from '../Icons';
import { generateMusic } from '../../services/geminiAdvancedService';

/**
 * MusicStudioApp - AI-powered music generation using Gemini
 * Based on: https://ai.google.dev/gemini-api/docs/music-generation
 * 
 * Features:
 * - Generate music from text descriptions
 * - Adjust duration and style
 * - Preview and download generated music
 */
const MusicStudioApp: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(10);
    const [genre, setGenre] = useState('ambient');
    const [mood, setMood] = useState('calm');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMusic, setGeneratedMusic] = useState<{
        audioUrl: string;
        description: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<{
        id: string;
        prompt: string;
        description: string;
        timestamp: number;
    }>>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a music description');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedMusic(null);

        try {
            const fullPrompt = `${genre} music, ${mood} mood: ${prompt}`;
            const result = await generateMusic(fullPrompt, duration);
            
            setGeneratedMusic(result);
            
            // Add to history
            setHistory(prev => [{
                id: Date.now().toString(),
                prompt: fullPrompt,
                description: result.description,
                timestamp: Date.now()
            }, ...prev.slice(0, 9)]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const genres = [
        'ambient', 'classical', 'electronic', 'jazz', 'rock', 
        'pop', 'cinematic', 'lo-fi', 'world', 'experimental'
    ];

    const moods = [
        'calm', 'energetic', 'melancholic', 'uplifting', 'mysterious',
        'peaceful', 'intense', 'playful', 'dramatic', 'dreamy'
    ];

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-white/20 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🎵</div>
                    <div>
                        <h1 className="text-2xl font-bold font-display">Music Studio</h1>
                        <p className="text-sm text-purple-200">AI-powered music generation with Gemini</p>
                    </div>
                </div>

                {/* Music Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 text-purple-200">Genre</label>
                        <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm"
                        >
                            {genres.map(g => (
                                <option key={g} value={g} className="bg-purple-900">{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 text-purple-200">Mood</label>
                        <select
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm"
                        >
                            {moods.map(m => (
                                <option key={m} value={m} className="bg-purple-900">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 text-purple-200">Duration: {duration}s</label>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the music you want to create... (e.g., 'A peaceful piano melody with soft strings', 'Upbeat electronic beat with synth leads')"
                        rows={2}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-purple-300 focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none text-sm"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full h-11 px-6 font-bold rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                                Generating Music...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Generate Music
                            </>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        ❌ {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Music Preview */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-purple-200 flex items-center gap-2">
                            🎼 Generated Music
                        </h3>
                        
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <SparklesIcon className="w-16 h-16 text-pink-400 animate-pulse mb-4" />
                                <p className="text-purple-200 animate-pulse">Composing your music...</p>
                                <p className="text-sm text-purple-300 mt-2">Using Gemini AI to create {genre} music</p>
                            </div>
                        ) : generatedMusic ? (
                            <div className="space-y-4">
                                {/* Music Visualization Placeholder */}
                                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-8 flex items-center justify-center">
                                    <div className="flex gap-2 items-end h-24">
                                        {[...Array(20)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-2 bg-gradient-to-t from-pink-400 to-purple-400 rounded-t animate-pulse"
                                                style={{
                                                    height: `${Math.random() * 100}%`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Music Info */}
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                    <p className="text-sm text-purple-200 whitespace-pre-wrap">
                                        {generatedMusic.description}
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                        <PlayIcon className="w-4 h-4" />
                                        Play
                                    </button>
                                    <button className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                        <DownloadIcon className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>

                                <p className="text-xs text-purple-400 text-center">
                                    Note: Music generation API is in preview. Full audio output coming soon.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-6xl mb-4">🎹</div>
                                <p className="text-purple-200">No music generated yet</p>
                                <p className="text-sm text-purple-300 mt-2">Describe your music and click Generate</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-purple-200 flex items-center gap-2">
                            📚 Recent Generations
                        </h3>
                        
                        {history.length === 0 ? (
                            <p className="text-sm text-purple-300 text-center py-8">No history yet</p>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 hover:bg-purple-500/20 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setPrompt(item.prompt);
                                            setGeneratedMusic({ audioUrl: '', description: item.description });
                                        }}
                                    >
                                        <p className="text-sm font-semibold mb-1">{item.prompt}</p>
                                        <p className="text-xs text-purple-300 line-clamp-2">{item.description}</p>
                                        <p className="text-xs text-purple-400 mt-1">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-start gap-2 text-xs">
                        <span>💡</span>
                        <div>
                            <p className="text-purple-200 font-semibold mb-1">Powered by Gemini Music Generation API</p>
                            <p className="text-purple-300">
                                Learn more: <a href="https://ai.google.dev/gemini-api/docs/music-generation" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-200">ai.google.dev/gemini-api/docs/music-generation</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MusicStudioApp;
