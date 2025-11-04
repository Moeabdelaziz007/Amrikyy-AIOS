import ytdl from 'ytdl-core';

// A simple in-memory cache to avoid re-fetching the same data
const infoCache = new Map<string, ytdl.videoInfo>();

export const getYouTubeVideoInfo = async (url: string) => {
    if (infoCache.has(url)) {
        const info = infoCache.get(url)!;
         return {
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        };
    }
    const info = await ytdl.getInfo(url);
    infoCache.set(url, info);
    return {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url, // Get highest quality thumbnail
    };
};

export const getYouTubeTranscript = async (videoId: string): Promise<string | null> => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (!infoCache.has(url)) {
        await getYouTubeVideoInfo(url);
    }
    const info = infoCache.get(url)!;

    const tracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) {
        console.warn('No caption tracks found for this video.');
        return null;
    }

    // Try to find an English transcript
    let transcriptTrack = tracks.find(t => t.languageCode === 'en');
    // If no English, take the first available
    if (!transcriptTrack) {
        transcriptTrack = tracks[0];
    }

    try {
        const response = await fetch(transcriptTrack.baseUrl);
        const transcriptXml = await response.text();

        // Basic XML parsing to extract text content
        const lines = transcriptXml
            .replace(/<text start="[^"]+" dur="[^"]+">/g, '')
            .replace(/<\/text>/g, '\n')
            .replace(/&amp;#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/<[^>]+>/g, '') // Remove any other tags
            .trim();

        return lines;
    } catch (error) {
        console.error('Failed to fetch or parse transcript:', error);
        return null;
    }
};
