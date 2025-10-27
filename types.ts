import React from 'react';

// A "Skill" is a discrete capability the AI system can have.
export type SkillID =
  'gemini-pro-text' | 'image-generation' | 'video-generation' | 'web-search' |
  'maps-search' | 'flight-search' | 'youtube-search' | 'fast-text' | 'text-to-speech' | 'music-generation' | 'text-translation' | 'live-translation';

export type SkillCategory = 'Language' | 'Vision' | 'Audio' | 'Logic' | 'Knowledge';

export interface Skill {
  id: SkillID;
  name: string;
  description: string;
  category: SkillCategory;
  icon: React.FC<{className: string}>;
}

export type AppID = 
  'chat' | 'terminal' | 'files' | 'settings' | 
  'luna' | 'karim' | 'scout' | 'maya' | 'jules' |
  'voice' | 'workflow' | 'travelAgent' | 'marketing' | 'travelPlanViewer' |
  'search' | 'maps' | 'transcriber' | 'videoAnalyzer' | 'image' | 'audio' | 'video' |
  'smartwatch' | 'workspace' | 'eventLog' |
  'skillForge' | 'chronoVault' | 'creatorStudio' | 'cognitoBrowser' | 'analyticsHub' |
  'agentForge' | 'avatarStudio' | 'agentProfile' | 'store' | 'notificationCenter' | 'liveConversation' | 'imageAnalyzer' |
  'devToolkit' | 'agora' | 'nexusChat' | 
  'devConsole' | 'apiDocs' | 'growthHub' | 'resourceHub' |
  'geminiAiNews' | 'controlPanel' | 
  'atlasFinance' | 'cognitiveCanvas' |
  'veridianId' | 'translateHub' | 'nexusGo' | 'nexusFeed' | 'nexusProfile' | // New AppIDs
  'travelServices' | // New AppID
  'atlas' | 'cortex' | 'orion' | 'helios' | 'leo' | 'zara' | 'rex' | 'clio' |
  'pricing';

export interface TravelPlan {
  destination: string;
  tripTitle: string;
  itinerary: {
    day: number;
    title: string;
    activities: string[];
  }[];
  budget: {
    category: string;
    cost: number;
  }[];
  dealsAndLinks: {
    title: string;
    url: string;
  }[];
}

export interface WindowInstance {
  id: number;
  appId: AppID;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  appProps: any;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  sources?: {title: string, uri: string}[];
}

export type AgentID = 'luna' | 'karim' | 'scout' | 'maya' | 'jules' | 
 'leo' | 'zara' | 'rex' | 'clio' |
 'echo' | string;

export interface Agent {
  id: AgentID;
  name: string;
  role: string;
  icon: string;
  tasks: number;
  color: string;
  hologram: {
    color: string;
    glow: string;
    task: string;
    aberrationColors: [string, string];
  };
  skillIDs: SkillID[]; 
}

export interface CustomAgent {
    id: AgentID;
    name: string;
    role: string;
    icon: string; // emoji
    avatarVisual?: string;
    voice?: string;
    skillIDs: SkillID[];
}

export interface CommunityAgent extends CustomAgent {
    description: string;
    author: string;
    rating: number; // e.g., 4.8
    category: 'Productivity' | 'Creative' | 'System' | 'Utility';
    price?: number;
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error' | 'system';
    category: 'System' | 'Agent' | 'App';
    cta?: { label: string; };
    onClick?: () => void;
}


export interface LogEntry {
    id: number;
    timestamp: string;
    from: AgentID;
    to?: AgentID;
    message: string;
    type?: 'insight' | 'proactive-offer' | 'standard'; // Added new field
}

export interface ExecutionLogEntry {
    step: number;
    thought: string;
    action: string;
    result: string;
}

export interface Engram {
    id: string;
    label: string;
    type: 'travel_plan' | 'conversation' | 'seo_strategy' | 'user_preference' | 'synthesized_insight' | 'project_creation' | 'campaign_launch';
    content: string; // A summary of the memory
    timestamp: number;
    color: string;
    potentiality?: number; // 0 = superposition, 1 = collapsed/stable
    authorAgentId?: AgentID;
}

export interface EngramConnection {
    from: string; // engram id
    to: string; // engram id
}

export interface ReasoningPath {
    from: string; // engram id
    to: string; // engram id
}

export interface SubAgent {
  name: string;
  icon: React.FC<{className: string}>;
}

export type Theme = 'obsidian' | 'neon-noir' | 'synthwave-sunset' | 'deep-space' | 'zen' | 'playful' | 'professional';
export type WallpaperID = '/wallpaper.svg' | '/wallpaper2.svg' | '/wallpaper3.svg' | '/wallpaper-obsidian.svg' | 'cityscape-night.jpg' | 'quantum-cascade.jpg' | 'topological-grid.jpg';
export type TaskbarTheme = 'glass' | 'solid' | 'transparent';
export type WindowStyle = 'gemini' | 'macos' | 'futuristic' | 'cyberpunk';
export type SystemVoice = string;
export type DashboardLayout = 'default' | 'work' | 'developer';
export type VoiceCommandAction = 'open' | 'close';
export interface VoiceCommand {
  action: VoiceCommandAction;
  target: AppID | 'all';
}


export interface Settings {
  theme: Theme;
  wallpaper: WallpaperID | string;
  accentColor: string;
  taskbarTheme: TaskbarTheme;
  windowStyle: WindowStyle;
  voice: SystemVoice;
  speechRate: number;
  speechPitch: number;
  dashboardLayout: DashboardLayout;
  language: 'en' | 'ar';
}

export interface SettingsAppProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  userAccount: UserAccount;
  onUserAccountChange: (newAccount: Partial<UserAccount>) => void;
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (method: PaymentMethod) => void;
  onUpgrade: () => void;
}

export interface TrendingItem {
  rank: number;
  name: string;
  category: 'Tool' | 'Model' | 'News';
  change: number;
}

export interface WorkflowNode {
    id: string;
    agentId: AgentID;
    description: string;
}

export interface WorkflowConnection {
    from: string;
    to: string;
}

export interface Workflow {
    title: string;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
}

export interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface Automation {
  id: string;
  trigger: string;
  action: {
    appId: AppID;
    task: string;
  };
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Workspace {
  id: string;
  title: string;
  activeTab: 'notes' | 'music' | 'youtube' | 'whiteboard';
  notes?: string;
  youtubeUrl?: string;
  musicPlaylist?: { title: string; artist: string; }[];
  members: User[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Paused' | 'Completed';
    earnings: number;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    projectId?: string;
}

export interface SystemEntity {
  id: AppID | AgentID;
  name: string;
  icon: string;
  goal: string;
  description: string;
  workflow: {
    icon: string;
    label: string;
  }[];
}

export interface CryptoData {
    id: string;
    name: string;
    ticker: string;
    icon: string;
    price: number;
    change: number;
    history: number[];
}

export interface UserAccount {
    osId: string; // New: Unique OS identifier for the user
    name: string;
    avatar: string;
    tier: 'Free' | 'Pro';
    aiCredits: number;
    referralCode?: string;
    referralsCount?: number;
    creditsEarnedFromReferrals?: number;
    creatorScore?: number;
    joinDate: string; // New: Date when the user joined the OS
    trustScore: number; // New: Dynamic score based on activity
}

export interface UserAction {
    appId: AppID;
    timestamp: number;
    details?: Record<string, any>;
}

export interface VisualizationData {
    type: 'bar' | 'pie' | 'summary';
    title: string;
    data: any;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
    }[];
}

export interface VoiceOption {
    id: string;
    name: string;
    language: string;
    accent: string;
    gender: 'Male' | 'Female';
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // ISO string for datetime
  end: string;   // ISO string for datetime
}

export interface DriveFile {
  id: string;
  name: string;
  link: string;
}

export interface GmailMessage {
  id: string;
  snippet: string;
}

export interface SharedContent {
    type: 'project' | 'travel_plan' | 'image' | 'video' | 'text'; // Added 'text' for generic posts
    title: string;
    subtitle: string;
    cta: string;
    imageUrl?: string;
}

export interface SocialPost {
    caption: string;
    hashtags: string[];
}

export interface NexusComment {
    id: string;
    authorName: string;
    osId: string;
    text: string;
    timestamp: number;
}

// Renamed from ViralPost to NexusPost
export interface NexusPost {
    id: string;
    author: string; // User's display name
    osId: string; // User's OS ID
    content: SharedContent;
    socialPost: SocialPost;
    likes: number;
    views: number;
    comments: NexusComment[]; // New: Array of comments
    boosted?: boolean;
}

export interface AgoraListing {
    id: string;
    type: 'agent' | 'workflow';
    asset: CustomAgent | Workflow;
    author: string;
    price: number;
    description: string;
}

export interface LiveChatMessage {
    id: string;
    user: { id: string; name: string; avatar: string; };
    text: string;
    timestamp: number;
}

export interface PaymentMethod {
    id: string;
    type: 'paypal' | 'stripe' | 'googlepay';
    identifier: string; // e.g., email for paypal, last 4 digits for card
}

export interface CreatorBounty {
    id: string;
    title: string;
    description: string;
    creditReward: number;
    action: {
        type: 'open_app' | 'create_agent' | 'share_content';
        appId?: AppID;
        contentType?: SharedContent['type'];
    };
}

export interface ResourceItem {
    id: string;
    title: string;
    description: string;
    url: string;
    category: 'AI/ML' | 'Frontend' | 'Developer Tools' | 'Design';
    tags: string[];
}

export type WeatherCondition = 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Clear';

export interface CurrentWeather {
    location: string;
    temp: number;
    condition: WeatherCondition;
    icon: string; // Material Symbols icon name
    high: number;
    low: number;
}

export interface ForecastDay {
    day: string; // e.g., 'Mon', 'Tue'
    high: number;
    low: number;
    icon: string; // Material Symbols icon name
    condition: WeatherCondition;
}

export interface WeatherData {
    current: CurrentWeather;
    forecast: ForecastDay[];
}

export interface DeliveryOption {
    name: string;
    description: string;
    deliveryTime: string;
    priceRange: string;
    rating: number;
    cuisine?: string;
    tags: string[];
    url: string;
    isTrending?: boolean; // New: For smart delivery
}

export interface FastFoodRestaurant {
    name: string;
    cuisine: string;
    rating: number;
    deliveryTime: string;
    priceLevel: '$' | '$$' | '$$$' | '$$$$';
    isTrending: boolean;
    imageUrl: string;
    address: string; // Added for more detail
    website: string; // Added for more detail
    reason: string; // AI-generated reason for recommendation
}

export interface RideOption {
    service: string;
    estimatedCost: string;
    estimatedTime: string;
    currency: string;
    surgePricing: boolean;
    eta?: string; // New: Estimated time of arrival
    providerLogo?: string; // New: Logo for the ride service (e.g., Uber, Lyft)
}

export interface CleaningService {
    name: string;
    type: string; // e.g., "Deep Clean", "Standard Clean"
    priceRange: string;
    rating: number;
    availability: string; // e.g., "Next Day", "Same Week"
    contact: string; // e.g., phone number or website
    imageUrl?: string;
    reason: string; // AI-generated reason for recommendation
}

export interface NightlifeEvent {
    name: string;
    type: string; // e.g., "Nightclub", "Bar", "Live Music", "VIP Event"
    description: string;
    location: string;
    date: string;
    time: string;
    ticketsUrl?: string;
    vipOptions?: boolean;
    imageUrl?: string;
    reason: string; // AI-generated reason for recommendation
}