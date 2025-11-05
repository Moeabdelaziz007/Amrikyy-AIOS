import React, { useState, useRef } from 'react';
import { SparklesIcon, CameraIcon, ScreenIcon } from '../Icons';
import { analyzeImage, analyzeScreenshot, analyzeScreenForActions } from '../../services/geminiAdvancedService';

interface AnalysisResult {
    text: string;
    timestamp: number;
    type: 'image' | 'screenshot' | 'computer-use';
    actions?: Array<{
        type: string;
        description: string;
        coordinates?: { x: number; y: number };
        text?: string;
        confidence: number;
    }>;
}

/**
 * GeminiControlApp - Demonstrates Gemini 2.0's Computer Use API
 * Official Documentation: https://ai.google.dev/gemini-api/docs/computer-use
 * 
 * Features:
 * - Screen understanding and UI analysis
 * - Action suggestions based on visual context
 * - Image analysis with vision capabilities
 * - Computer automation planning
 */
const GeminiControlApp: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'vision' | 'screen' | 'computer-use'>('computer-use');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScreenCapture = async () => {
        try {
            // Request screen capture using browser's screen capture API
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' as any }
            });

            const track = stream.getVideoTracks()[0];
            const imageCapture = new (window as any).ImageCapture(track);
            const bitmap = await imageCapture.grabFrame();

            // Convert to canvas and then to data URL
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(bitmap, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');

            setSelectedImage(dataUrl);
            track.stop();
            stream.getTracks().forEach(track => track.stop());
        } catch (err: any) {
            setError(`Screen capture failed: ${err.message}. Please grant screen sharing permission.`);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            setError('Please select an image or capture a screenshot first');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            if (mode === 'computer-use') {
                // Use Computer Use API for action planning
                const instruction = prompt || 'Analyze this screen and suggest actions I can take';
                const result = await analyzeScreenForActions(selectedImage, instruction);
                
                setAnalysisResult({
                    text: result.analysis + '\n\nReasoning: ' + result.reasoning,
                    timestamp: Date.now(),
                    type: 'computer-use',
                    actions: result.suggestedActions,
                });
            } else if (mode === 'screen') {
                // Simple screen analysis
                const result = await analyzeScreenshot(
                    selectedImage,
                    prompt || 'Describe what you see on this screen'
                );
                setAnalysisResult({
                    text: result,
                    timestamp: Date.now(),
                    type: 'screenshot',
                });
            } else {
                // Image analysis
                const result = await analyzeImage(
                    selectedImage,
                    prompt || 'Describe this image in detail'
                );
                setAnalysisResult({
                    text: result,
                    timestamp: Date.now(),
                    type: 'image',
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getActionIcon = (type: string) => {
        const icons: Record<string, string> = {
            click: '👆',
            type: '⌨️',
            scroll: '📜',
            wait: '⏳',
            analyze: '🔍',
        };
        return icons[type] || '🎯';
    };

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-white/20 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-purple-300" />
                        <div>
                            <h1 className="text-2xl font-bold font-display">Gemini Computer Use</h1>
                            <p className="text-sm text-purple-200">AI-powered screen understanding & automation</p>
                        </div>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setMode('computer-use')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                            mode === 'computer-use'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/10 hover:bg-white/20'
                        }`}
                    >
                        🤖 Computer Use API
                    </button>
                    <button
                        onClick={() => setMode('screen')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            mode === 'screen'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/10 hover:bg-white/20'
                        }`}
                    >
                        🖥️ Screen Analysis
                    </button>
                    <button
                        onClick={() => setMode('vision')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            mode === 'vision'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/10 hover:bg-white/20'
                        }`}
                    >
                        👁️ Vision
                    </button>
                </div>

                {/* Upload/Capture Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 h-12 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                        <CameraIcon className="w-5 h-5" />
                        Upload Image
                    </button>
                    <button
                        onClick={handleScreenCapture}
                        className="flex-1 h-12 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                        <ScreenIcon className="w-5 h-5" />
                        Capture Screen
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        ❌ {error}
                    </div>
                )}

                {mode === 'computer-use' && !selectedImage && (
                    <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <h4 className="font-semibold mb-1">Gemini Computer Use API</h4>
                                <p className="text-sm text-blue-200 mb-2">
                                    This feature uses Gemini's Computer Use capabilities to understand screens and suggest actions.
                                </p>
                                <ul className="text-xs text-blue-300 space-y-1">
                                    <li>• Capture or upload a screenshot of any application</li>
                                    <li>• Describe what you want to accomplish</li>
                                    <li>• Get AI-suggested actions with coordinates</li>
                                    <li>• Plan multi-step automation workflows</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Panel - Image/Screen Preview */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col h-[500px]">
                        <h3 className="font-semibold mb-3 text-purple-200">
                            {mode === 'computer-use' ? '🖥️ Screen Capture' : mode === 'screen' ? 'Screen Preview' : 'Image Preview'}
                        </h3>
                        <div className="flex-grow flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="text-center text-purple-200 p-8">
                                    <div className="text-6xl mb-4">
                                        {mode === 'computer-use' ? '🎯' : mode === 'screen' ? '🖥️' : '🖼️'}
                                    </div>
                                    <p className="font-semibold mb-2">No image selected</p>
                                    <p className="text-sm text-purple-300">
                                        {mode === 'computer-use' 
                                            ? 'Capture a screenshot to analyze UI and get action suggestions'
                                            : 'Upload an image or capture your screen to begin'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Analysis & Actions */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col h-[500px]">
                        <h3 className="font-semibold mb-3 text-purple-200">
                            {mode === 'computer-use' ? '🤖 AI Actions' : '✨ Analysis'}
                        </h3>
                        <div className="flex-grow overflow-y-auto mb-4 pr-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse mb-3" />
                                    <p className="text-purple-200">
                                        {mode === 'computer-use' 
                                            ? 'Planning actions with Gemini...'
                                            : 'Analyzing with Gemini 2.0...'}
                                    </p>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-4">
                                    {/* Analysis Text */}
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2 text-sm text-purple-300">
                                            <SparklesIcon className="w-4 h-4" />
                                            <span className="font-semibold">Analysis</span>
                                            <span className="ml-auto text-xs">
                                                {new Date(analysisResult.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {analysisResult.text}
                                        </p>
                                    </div>

                                    {/* Suggested Actions (Computer Use mode) */}
                                    {analysisResult.actions && analysisResult.actions.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2 text-purple-200">
                                                📋 Suggested Actions:
                                            </h4>
                                            <div className="space-y-2">
                                                {analysisResult.actions.map((action, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 hover:bg-indigo-500/20 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-xl">{getActionIcon(action.type)}</span>
                                                            <div className="flex-grow">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-semibold text-sm capitalize">{action.type}</span>
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                                                        {Math.round(action.confidence * 100)}% confident
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-purple-200">{action.description}</p>
                                                                {action.coordinates && (
                                                                    <p className="text-xs text-purple-400 mt-1">
                                                                        📍 Position: ({action.coordinates.x}, {action.coordinates.y})
                                                                    </p>
                                                                )}
                                                                {action.text && (
                                                                    <p className="text-xs text-purple-400 mt-1">
                                                                        💬 Text: "{action.text}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-center text-purple-300">
                                    <div>
                                        <div className="text-5xl mb-3">🤖</div>
                                        <p className="font-semibold">Ready to analyze</p>
                                        <p className="text-sm mt-1">
                                            {mode === 'computer-use' 
                                                ? 'Gemini will suggest specific actions to accomplish your goal'
                                                : 'Analysis results will appear here'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-2 flex-shrink-0">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'computer-use' 
                                    ? "What do you want to accomplish? (e.g., 'Click the login button', 'Fill out the form', 'Find pricing info')" 
                                    : "Ask Gemini about the image... (optional)"}
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none text-sm"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !selectedImage}
                                className="w-full h-11 px-6 font-bold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <SparklesIcon className="w-4 h-4 animate-pulse" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4" />
                                        {mode === 'computer-use' ? 'Plan Actions' : 'Analyze with Gemini'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div>
                            <h4 className="font-semibold text-sm text-purple-200 mb-1">
                                Powered by Gemini 2.0 Computer Use API
                            </h4>
                            <p className="text-xs text-purple-300">
                                Learn more at: <a href="https://ai.google.dev/gemini-api/docs/computer-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-200">ai.google.dev/gemini-api/docs/computer-use</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GeminiControlApp;
