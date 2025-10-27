import { Agent } from '../types';

export const agents: Agent[] = [
  { 
    id: 'luna',
    name: 'Luna', 
    role: 'Trip Planner', 
    icon: '🌟', 
    tasks: 45, 
    color: 'from-blue-500 to-cyan-400',
    hologram: { 
        color: 'text-primary-cyan', 
        glow: '#06B6D4', 
        task: 'Analyzing Paris flights...',
        aberrationColors: ['#06B6D4', '#8B5CF6']
    },
    skillIDs: ['gemini-pro-text', 'flight-search', 'maps-search'],
  },
  { 
    id: 'karim',
    name: 'Karim', 
    role: 'Budget Optimizer', 
    icon: '💰', 
    tasks: 32, 
    color: 'from-yellow-500 to-orange-400',
    hologram: { 
        color: 'text-yellow-400', 
        glow: '#FBBF24', 
        task: 'Optimizing Tokyo budget...',
        aberrationColors: ['#FBBF24', '#EF4444']
    },
    skillIDs: ['gemini-pro-text', 'web-search'],
  },
  { 
    id: 'scout',
    name: 'Scout', 
    role: 'Deal Finder', 
    icon: '🔍', 
    tasks: 28, 
    color: 'from-purple-500 to-indigo-400',
    hologram: { 
        color: 'text-primary-purple', 
        glow: '#8B5CF6', 
        task: 'Scanning for Hawaii deals...',
        aberrationColors: ['#8B5CF6', '#EC4899']
    },
    skillIDs: ['web-search', 'flight-search'],
  },
  { 
    id: 'maya',
    name: 'Maya', 
    role: 'Customer Support', 
    icon: '💬', 
    tasks: 51, 
    color: 'from-pink-500 to-rose-400',
    hologram: { 
        color: 'text-primary-pink', 
        glow: '#EC4899', 
        task: 'Resolving booking issue...',
        aberrationColors: ['#EC4899', '#8B5CF6']
    },
    skillIDs: ['gemini-pro-text', 'fast-text', 'text-to-speech'],
  },
  {
    id: 'jules',
    name: 'Jules', 
    role: 'System Debug & Self-Healing Agent', 
    icon: '⚙️', 
    tasks: 18, 
    color: 'from-green-500 to-emerald-400',
    hologram: { 
        color: 'text-green-400', 
        glow: '#34D399', 
        task: 'Running system diagnostics...',
        aberrationColors: ['#34D399', '#06B6D4']
    },
    skillIDs: ['gemini-pro-text'],
  },
  {
    id: 'cortex',
    name: 'Cortex',
    role: 'Collaborative Ideation Agent',
    icon: '💡',
    tasks: 12,
    color: 'from-orange-500 to-amber-400',
    hologram: {
        color: 'text-orange-400',
        glow: '#FB923C',
        task: 'Synthesizing team ideas...',
        aberrationColors: ['#FB923C', '#06B6D4']
    },
    skillIDs: ['gemini-pro-text', 'youtube-search'],
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Business & Monetization Strategist',
    icon: '📈',
    tasks: 8,
    color: 'from-stone-500 to-gray-500',
    hologram: {
        color: 'text-gray-300',
        glow: '#A8A29E',
        task: 'Analyzing market trends...',
        aberrationColors: ['#A8A29E', '#3B82F6']
    },
    skillIDs: ['gemini-pro-text', 'web-search'],
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Master Control Agent',
    icon: '🌐',
    tasks: 99,
    color: 'from-gray-200 to-slate-400',
    hologram: {
        color: 'text-white',
        glow: '#FFFFFF',
        task: 'Orchestrating A2A Communication Bus...',
        aberrationColors: ['#3B82F6', '#EC4899']
    },
    skillIDs: ['gemini-pro-text', 'image-generation', 'video-generation', 'web-search', 'maps-search', 'flight-search', 'youtube-search', 'fast-text', 'text-to-speech', 'music-generation'],
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Personalization & Intelligence Engine',
    icon: '🧠',
    tasks: 100, // Always active
    color: 'from-slate-400 to-gray-500',
     hologram: {
        color: 'text-gray-300',
        glow: '#9CA3AF',
        task: 'Observing user patterns...',
        aberrationColors: ['#9CA3AF', '#60A5FA']
    },
    skillIDs: ['gemini-pro-text'],
  }
];