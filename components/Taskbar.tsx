import React from 'react';
import { AppID, WindowInstance } from '../types';
import { ChatIcon, TripIcon, TerminalIcon, FileIcon, SettingsIcon, ImageIcon, VideoIcon, SearchIcon, MapIcon, LunaIcon, KarimIcon, ScoutIcon, MayaIcon, WorkflowIcon, MicrophoneIcon, VideoAnalyzeIcon, JulesIcon, VoiceAssistantIcon, SmartWatchIcon, WorkspaceIcon, EventLogIcon, CreatorStudioIcon, SkillForgeIcon, ChronoVaultIcon, BrowserIcon, AtlasIcon, CortexIcon, OrionIcon, AnalyticsHubIcon, AgentForgeIcon, StoreIcon, PricingIcon, LiveConversationIcon, ImageAnalyzerIcon, NotificationCenterIcon, AudioStudioIcon, AvatarStudioIcon, MarketingIcon, DevToolkitIcon, AgoraIcon, NexusChatIcon, HeliosIcon, DevConsoleIcon, ApiIcon, GrowthHubIcon, ResourceHubIcon, NewsIcon, ControlPanelIcon, FinanceIcon, CognitiveCanvasIcon, VeridianIdIcon, TranslateIcon, NexusGoIcon, NexusProfileIcon, TravelServicesIcon } from './Icons';

interface TaskbarProps {
  openWindows: WindowInstance[];
  onOpen: (appId: AppID) => void;
  onRestore: (id: number) => void;
  onFocus: (id: number) => void;
  activeWindowId: number | null;
}

const appIcons: Record<AppID, React.FC<{className: string}>> = {
  chat: ChatIcon,
  travelAgent: TripIcon,
  terminal: TerminalIcon,
  files: FileIcon,
  settings: SettingsIcon,
  image: ImageIcon,
  video: VideoIcon, 
  search: SearchIcon,
  maps: MapIcon,
  luna: LunaIcon,
  karim: KarimIcon,
  scout: ScoutIcon,
  maya: MayaIcon, // FIX: Changed MayaApp to MayaIcon
  workflow: WorkflowIcon,
  travelPlanViewer: TripIcon,
  transcriber: MicrophoneIcon,
  videoAnalyzer: VideoAnalyzeIcon,
  jules: JulesIcon,
  voice: VoiceAssistantIcon,
  marketing: MarketingIcon,
  smartwatch: SmartWatchIcon, // FIX: Changed SmartWatchApp to SmartWatchIcon
  workspace: WorkspaceIcon,
  eventLog: EventLogIcon,
  creatorStudio: CreatorStudioIcon, // FIX: Changed CreatorStudioApp to CreatorStudioIcon
  skillForge: SkillForgeIcon,
  chronoVault: ChronoVaultIcon,
  cognitoBrowser: BrowserIcon,
  atlas: AtlasIcon,
  cortex: CortexIcon,
  orion: OrionIcon,
  analyticsHub: AnalyticsHubIcon,
  agentForge: AgentForgeIcon,
  agentProfile: LunaIcon,
  store: StoreIcon,
  notificationCenter: NotificationCenterIcon,
  liveConversation: LiveConversationIcon,
  imageAnalyzer: ImageAnalyzerIcon,
  audio: AudioStudioIcon,
  avatarStudio: AvatarStudioIcon,
  devToolkit: DevToolkitIcon,
  agora: AgoraIcon,
  nexusChat: NexusChatIcon,
  helios: HeliosIcon,
  devConsole: DevConsoleIcon,
  apiDocs: ApiIcon,
  leo: MarketingIcon,
  zara: MarketingIcon,
  rex: MarketingIcon,
  clio: MarketingIcon,
  growthHub: GrowthHubIcon,
  resourceHub: ResourceHubIcon,
  geminiAiNews: NewsIcon,
  controlPanel: ControlPanelIcon,
  atlasFinance: FinanceIcon,
  cognitiveCanvas: CognitiveCanvasIcon,
  veridianId: VeridianIdIcon,
  translateHub: TranslateIcon,
  nexusGo: NexusGoIcon,
  nexusFeed: NexusChatIcon,
  nexusProfile: NexusProfileIcon,
  travelServices: TravelServicesIcon, // New
  pricing: PricingIcon,
};


const Taskbar: React.FC<TaskbarProps> = ({ openWindows, onOpen, onRestore, onFocus, activeWindowId }) => {
  return null; // This is a legacy component, replaced by Dock. Kept for type safety.
};

export default React.memo(Taskbar);