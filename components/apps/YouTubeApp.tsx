import React, { useState } from 'react';
import { getYouTubeVideoInfo, getYouTubeTranscript } from '../../services/youtubeService';
import { summarizeText } from '../../services/geminiAdvancedService';

interface VideoInfo {
    title: string;
    author: string;
    thumbnail: string;
}

const YouTubeApp: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSummarize = async () => {
        if (!videoUrl) return;
        setIsLoading(true);
        setError(null);
        setSummary('');
        setVideoInfo(null);

        try {
            const videoId = new URL(videoUrl).searchParams.get('v');
            if (!videoId) throw new Error('Invalid YouTube URL');

            const info = await getYouTubeVideoInfo(videoUrl);
            setVideoInfo(info);

            const transcript = await getYouTubeTranscript(videoId);
            if (!transcript) throw new Error('Could not fetch transcript.');

            const summarizedText = await summarizeText(`Summarize this transcript:\n\n${transcript}`);
            setSummary(summarizedText);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-bg-secondary rounded-b-md text-white p-6 overflow-y-auto">
            <header className="flex-shrink-0 mb-6">
                <h1 className="text-2xl font-bold font-display">YouTube Video Summarizer</h1>
                <p className="text-text-secondary">Enter a YouTube video URL to get an AI-powered summary.</p>
            </header>
            <main className="flex-grow flex flex-col items-center">
                <div className="w-full max-w-lg space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-grow h-12 bg-black/20 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        <button
                            onClick={handleSummarize}
                            disabled={isLoading || !videoUrl}
                            className="h-12 px-6 font-bold rounded-lg bg-accent text-white hover:brightness-110 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'Go'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {isLoading && <div className="text-center p-8">Fetching video and summarizing...</div>}

                    {videoInfo && (
                         <div className="mt-6 bg-black/20 border border-white/10 rounded-lg overflow-hidden">
                            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h2 className="font-bold text-lg">{videoInfo.title}</h2>
                                <p className="text-sm text-text-secondary">{videoInfo.author}</p>
                            </div>
                        </div>
                    )}
                    {summary && (
                        <div className="mt-4 p-4 bg-black/20 border border-white/10 rounded-lg">
                            <h3 className="font-bold mb-2">Summary:</h3>
                            <p className="whitespace-pre-wrap text-sm">{summary}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default YouTubeApp;
