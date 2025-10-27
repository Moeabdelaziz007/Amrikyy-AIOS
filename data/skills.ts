import { Skill } from '../types';
import { ChatIcon, ImageIcon, VideoIcon, SearchIcon, MapIcon, FlightsIcon, YouTubeIcon, SparklesIcon, SpeakerIcon } from '../components/Icons';

export const skills: Skill[] = [
    { 
        id: 'gemini-pro-text', 
        name: 'Advanced Text', 
        description: 'Complex reasoning, understanding, and generation of text using Gemini Pro.',
        category: 'Language',
        icon: ChatIcon 
    },
    { 
        id: 'image-generation', 
        name: 'Image Generation', 
        description: 'Creates and edits images from text prompts.',
        category: 'Vision',
        icon: ImageIcon 
    },
    { 
        id: 'video-generation', 
        name: 'Video Generation', 
        description: 'Generates high-quality video content.',
        category: 'Vision',
        icon: VideoIcon
    },
    { 
        id: 'web-search', 
        name: 'Web Search', 
        description: 'Accesses real-time information from Google Search.',
        category: 'Knowledge',
        icon: SearchIcon 
    },
    { 
        id: 'maps-search', 
        name: 'Maps Search', 
        description: 'Provides location-based information and directions.',
        category: 'Knowledge',
        icon: MapIcon 
    },
    { 
        id: 'flight-search', 
        name: 'Flight Search', 
        description: 'Finds and analyzes flight data and prices.',
        category: 'Knowledge',
        icon: FlightsIcon 
    },
    { 
        id: 'youtube-search', 
        name: 'YouTube Search', 
        description: 'Searches and interacts with the YouTube platform.',
        category: 'Knowledge',
        icon: YouTubeIcon 
    },
    { 
        id: 'fast-text', 
        name: 'Fast Text', 
        description: 'Low-latency conversational text generation.',
        category: 'Language',
        icon: SparklesIcon
    },
    { 
        id: 'text-to-speech', 
        name: 'Text-to-Speech', 
        description: 'Converts text into natural-sounding audio.',
        category: 'Audio',
        icon: SpeakerIcon
    },
    { 
        id: 'music-generation', 
        name: 'Music Generation', 
        description: 'Generates original music based on prompts.',
        category: 'Audio',
        icon: SpeakerIcon
    }
];