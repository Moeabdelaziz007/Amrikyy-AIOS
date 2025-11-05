// Templates for Creator and Travel sub-agents
import { CustomAgent } from '../types';

export const creatorTeamTemplates: CustomAgent[] = [
  {
    id: 'prompt-engineer',
    name: 'Prompt Engineer',
    role: 'Crafts high-quality prompts for image/video/music generation',
    icon: '🛠️',
    skillIDs: ['gemini-pro-text', 'image-generation']
  },
  {
    id: 'script-writer',
    name: 'Script Writer',
    role: 'Generates concise, engaging video scripts and on-camera copy',
    icon: '✍️',
    skillIDs: ['gemini-pro-text', 'fast-text']
  },
  {
    id: 'content-searcher',
    name: 'Content Researcher',
    role: 'Finds references, trends, and supporting materials for topics',
    icon: '🔎',
    skillIDs: ['web-search', 'youtube-search']
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    role: 'Applies editing rules, timestamps, and selects B-roll',
    icon: '🎞️',
    skillIDs: ['video-generation', 'image-generation']
  },
  {
    id: 'music-composer',
    name: 'Music Composer',
    role: 'Creates background music and sonic branding for videos',
    icon: '🎵',
    skillIDs: ['music-generation']
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    role: 'Creates publishing schedules and calendar events',
    icon: '📆',
    skillIDs: ['fast-text']
  }
];

export const travelTeamTemplates: CustomAgent[] = [
  {
    id: 'itinerary-planner',
    name: 'Itinerary Planner',
    role: 'Creates day-by-day travel itineraries',
    icon: '🗺️',
    skillIDs: ['maps-search', 'flight-search']
  },
  {
    id: 'deals-finder',
    name: 'Deals Finder',
    role: 'Searches for best prices for flights/hotels',
    icon: '💸',
    skillIDs: ['flight-search', 'web-search']
  },
  {
    id: 'local-expert',
    name: 'Local Expert',
    role: 'Recommends restaurants, nightlife, and local events',
    icon: '🍽️',
    skillIDs: ['web-search', 'maps-search']
  },
  {
    id: 'logistics',
    name: 'Logistics',
    role: 'Handles transfers, tickets and time optimization',
    icon: '🚕',
    skillIDs: ['maps-search']
  }
];

