export interface AiNewsArticle {
  id: string;
  category: 'Top Story' | 'Market Watch' | 'Tool Spotlight' | 'Model Update' | 'Project Launch' | 'AI Milestone';
  title: string;
  source: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
}

export interface AiMarketCap {
    ticker: string;
    name: string;
    price: number;
    change: number;
    marketCap: string;
}

export const aiMarketData: AiMarketCap[] = [
    { ticker: 'NVDA', name: 'NVIDIA', price: 121.79, change: -2.46, marketCap: '$2.9T' },
    { ticker: 'GOOGL', name: 'Alphabet', price: 179.22, change: -1.21, marketCap: '$2.2T' },
    { ticker: 'MSFT', name: 'Microsoft', price: 447.67, change: -0.42, marketCap: '$3.3T' },
    { ticker: 'AI', name: 'C3.ai', price: 27.25, change: 3.55, marketCap: '$3.3B' },
];

export const aiNewsData: AiNewsArticle[] = [
    {
        id: '1',
        category: 'Top Story',
        title: 'Google Announces Gemini 2.5 with Enhanced Reasoning',
        source: 'Google AI Blog',
        timestamp: '2 hours ago',
        content: 'The new flagship model, Gemini 2.5 Pro, boasts significant improvements in logical reasoning, coding capabilities, and multi-modal understanding, setting a new benchmark for AI performance.',
        imageUrl: 'https://storage.googleapis.com/gweb-aip.appspot.com/v1/g-gemini-2.5-pro-v2.gif'
    },
    {
        id: '2',
        category: 'Model Update',
        title: 'Veo Video Generation Model Now Publicly Available',
        source: 'DeepMind',
        timestamp: '8 hours ago',
        content: 'Google DeepMind has released its state-of-the-art video generation model, Veo, allowing developers and creators to generate high-fidelity video content from simple text prompts.',
        imageUrl: 'https://storage.googleapis.com/gweb-aip.appspot.com/v1/g-veo-v2.gif'
    },
    {
        id: '3',
        category: 'Tool Spotlight',
        title: 'New "Prompt Weaver" Tool Simplifies Complex AI Instructions',
        source: 'Amrikyy OS Gazette',
        timestamp: '1 day ago',
        content: 'The latest update to the Amrikyy AI OS includes the Prompt Weaver, a visual tool that allows users to chain multiple prompts together, enabling more sophisticated and nuanced interactions with AI agents.',
    },
    {
        id: '4',
        category: 'Market Watch',
        title: 'AI Chipmaker Stocks Surge on Strong Earnings Reports',
        source: 'Financial Times',
        timestamp: '1 day ago',
        content: 'Companies specializing in AI hardware have reported record profits, driving a rally in the tech sector and highlighting the immense computational demand of modern AI systems.',
    },
    {
        id: '5',
        category: 'Project Launch',
        title: 'Open-Source "Echo" Project Aims to Create Personalized AI Tutors',
        source: 'GitHub',
        timestamp: '2 days ago',
        content: 'A new community-driven project, Echo, has been launched to develop an open-source framework for building personalized AI tutors that adapt to individual learning styles.',
    },
    {
        id: '6',
        category: 'AI Milestone',
        title: 'On This Day: AlphaGo Defeats Lee Sedol',
        source: 'AI History Archives',
        timestamp: 'March 15, 2016',
        content: 'Remembering the historic match where DeepMind\'s AlphaGo defeated world champion Lee Sedol in a 5-game Go match, a landmark moment for artificial intelligence.',
    }
];
