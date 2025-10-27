import React, { useState } from 'react';
import { VideoAnalyzeIcon, SparklesIcon, UploadIcon } from '../Icons';
import { analyzeVideo } from '../../services/geminiAdvancedService';
import { fileToBase64 } from '../../utils/fileUtils';

const VideoAnalyzerApp: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            setAnalysis('');
            setError(null);
        } else {
            setError('Please select a valid video file.');
        }
    };

    const handleAnalyze = async () => {
        if (!videoFile || !prompt || isLoading) return;

        setIsLoading(true);
        setAnalysis('');
        setError(null);

        try {
            const base64Video = await fileToBase64(videoFile);
            const result = await analyzeVideo(base64Video.split(',')[1], videoFile.type, prompt);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze the video.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6 gap-6">
            <div className="text-center">
                <VideoAnalyzeIcon className="w-16 h-16 mx-auto mb-2 text-indigo-400" />
                <h1 className="text-2xl font-bold font-display">Video Analyzer</h1>
                <p className="text-text-muted">Upload a video and ask questions about its content.</p>
                {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                <div className="flex flex-col gap-4">
                    <label htmlFor="video-upload" className="w-full h-48 flex flex-col items-center justify-center bg-black/20 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors">
                        {videoPreview ? (
                            <video src={videoPreview} controls className="w-full h-full object-contain rounded-lg" />
                        ) : (
                            <>
                                <UploadIcon className="w-10 h-10 text-text-muted mb-2" />
                                <span className="text-text-secondary">Click to upload a video</span>
                                <span className="text-xs text-text-muted">Max 2GB</span>
                            </>
                        )}
                    </label>
                    <input id="video-upload" type="file" accept="video/*" className="sr-only" onChange={handleFileChange} />
                    
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What is the main subject of this video? Provide timestamps for key events."
                        disabled={isLoading || !videoFile}
                        className="flex-grow bg-white/5 border border-white/10 rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 resize-none"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !videoFile || !prompt}
                        className="w-full h-12 font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Analyze Video
                    </button>
                </div>
                <div className="w-full h-full bg-black/20 border border-white/10 rounded-xl p-4 overflow-y-auto">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full gap-3 text-indigo-400">
                            <SparklesIcon className="w-6 h-6 animate-pulse" />
                            <p>Analyzing video...</p>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap">{analysis || "Your analysis will appear here..."}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoAnalyzerApp;