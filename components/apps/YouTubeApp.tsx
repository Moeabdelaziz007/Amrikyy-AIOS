import React, { useState } from 'react';
import { getYouTubeVideoInfo, getYouTubeTranscript } from '../../services/youtubeService';
import { summarizeText } from '../../services/geminiAdvancedService';
import { SparklesIcon, DownloadIcon } from '../Icons';

interface VideoInfo {
    title: string;
    author: string;
    thumbnail: string;
}

interface HistoryItem {
    id: string;
    videoUrl: string;
    videoInfo: VideoInfo;
    summary: string;
    timestamp: number;
}

const YouTubeApp: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [transcript, setTranscript] = useState('');

    const handleSummarize = async () => {
        if (!videoUrl) return;
        setIsLoading(true);
        setError(null);
        setSummary('');
        setVideoInfo(null);
        setTranscript('');

        try {
            const videoId = new URL(videoUrl).searchParams.get('v');
            if (!videoId) throw new Error('Invalid YouTube URL');

            const info = await getYouTubeVideoInfo(videoUrl);
            setVideoInfo(info);

            const transcriptText = await getYouTubeTranscript(videoId);
            if (!transcriptText) throw new Error('Could not fetch transcript.');

            setTranscript(transcriptText);
            const summarizedText = await summarizeText(`Summarize this transcript:\n\n${transcriptText}`);
            setSummary(summarizedText);

            // Add to history
            const historyItem: HistoryItem = {
                id: Date.now().toString(),
                videoUrl,
                videoInfo: info,
                summary: summarizedText,
                timestamp: Date.now(),
            };
            setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromHistory = (item: HistoryItem) => {
        setVideoUrl(item.videoUrl);
        setVideoInfo(item.videoInfo);
        setSummary(item.summary);
        setShowHistory(false);
    };

    const downloadSummary = () => {
        if (!summary || !videoInfo) return;
        
        const content = `YouTube Video Summary\n\nTitle: ${videoInfo.title}\nAuthor: ${videoInfo.author}\nURL: ${videoUrl}\n\nSummary:\n${summary}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-summary-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        // Could add a toast notification here
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-secondary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold font-display">YouTube Summarizer</h1>
                        <p className="text-text-secondary text-sm">AI-powered video summaries</p>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
                    >
                        {showHistory ? 'Hide' : 'History'} ({history.length})
                    </button>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSummarize()}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-grow h-12 bg-black/20 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <button
                        onClick={handleSummarize}
                        disabled={isLoading || !videoUrl}
                        className="h-12 px-6 font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                                Processing...
                            </>
                        ) : (
                            'Summarize'
                        )}
                    </button>
                </div>
            </header>

            {showHistory && (
                <div className="flex-shrink-0 p-4 border-b border-border-color bg-black/20 max-h-48 overflow-y-auto">
                    <h3 className="font-semibold mb-2 text-sm text-text-secondary">Recent Summaries</h3>
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <p className="text-sm text-text-muted">No history yet</p>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    <img src={item.videoInfo.thumbnail} alt="" className="w-20 h-12 object-cover rounded" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold truncate">{item.videoInfo.title}</p>
                                        <p className="text-xs text-text-secondary">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <main className="flex-grow p-6 overflow-y-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        ❌ {error}
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <SparklesIcon className="w-16 h-16 text-red-500 animate-pulse mb-4" />
                        <p className="text-lg font-semibold">Analyzing video...</p>
                        <p className="text-sm text-text-secondary mt-2">Fetching transcript and generating summary</p>
                    </div>
                )}

                {!isLoading && !videoInfo && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-8xl mb-6">📺</div>
                        <h2 className="text-2xl font-bold mb-2">Paste a YouTube URL</h2>
                        <p className="text-text-secondary max-w-md">
                            Get an AI-generated summary of any YouTube video with transcript
                        </p>
                    </div>
                )}

                {videoInfo && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                        <div className="bg-black/20 border border-white/10 rounded-lg overflow-hidden">
                            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-64 object-cover"/>
                            <div className="p-4">
                                <h2 className="font-bold text-xl mb-1">{videoInfo.title}</h2>
                                <p className="text-sm text-text-secondary mb-3">by {videoInfo.author}</p>
                                <a 
                                    href={videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-red-400 hover:text-red-300 hover:underline"
                                >
                                    Watch on YouTube →
                                </a>
                            </div>
                        </div>

                        {summary && (
                            <div className="bg-black/20 border border-white/10 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-yellow-400" />
                                        AI Summary
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            📋 Copy
                                        </button>
                                        <button
                                            onClick={downloadSummary}
                                            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                                            title="Download summary"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
                            </div>
                        )}

                        {transcript && (
                            <details className="bg-black/20 border border-white/10 rounded-lg p-4">
                                <summary className="cursor-pointer font-semibold text-sm hover:text-accent">
                                    View Full Transcript
                                </summary>
                                <div className="mt-4 text-sm text-text-secondary max-h-96 overflow-y-auto whitespace-pre-wrap">
                                    {transcript}
                                </div>
                            </details>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default YouTubeApp;
