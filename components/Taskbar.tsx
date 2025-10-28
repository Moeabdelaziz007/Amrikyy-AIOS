import React from 'react';
import { AppID, WindowInstance } from '../types.ts';
import { ChatIcon, TripIcon, TerminalIcon, FileIcon, SettingsIcon, ImageIcon, VideoIcon, SearchIcon, MapIcon, LunaIcon, KarimIcon, ScoutIcon, MayaIcon, WorkflowIcon, MicrophoneIcon, VideoAnalyzeIcon, JulesIcon, VoiceAssistantIcon, SmartWatchIcon, WorkspaceIcon, EventLogIcon, CreatorStudioIcon, SkillForgeIcon, ChronoVaultIcon, BrowserIcon, AtlasIcon, CortexIcon, OrionIcon, AnalyticsHubIcon, AgentForgeIcon, StoreIcon, PricingIcon, LiveConversationIcon, ImageAnalyzerIcon, NotificationCenterIcon, AudioStudioIcon, AvatarStudioIcon, MarketingIcon, DevToolkitIcon, AgoraIcon, NexusChatIcon, HeliosIcon, DevConsoleIcon, ApiIcon, GrowthHubIcon, ResourceHubIcon, NewsIcon, ControlPanelIcon, FinanceIcon, CognitiveCanvasIcon, VeridianIdIcon, TranslateIcon, NexusGoIcon, NexusProfileIcon, TravelServicesIcon } from './Icons.tsx';

/**
 * Props for the Taskbar component.
 * @deprecated This component is deprecated and replaced by the `Dock` component.
 */
interface TaskbarProps {
  /** An array of currently open window instances. */
  openWindows: WindowInstance[];
  /** Callback function to open an application. */
  onOpen: (appId: AppID) => void;
  /** Callback function to restore a minimized window. */
  onRestore: (id: number) => void;
  /** Callback function to bring a window to focus. */
  onFocus: (id: number) => void;
  /** The ID of the currently active (focused) window. */
  activeWindowId: number | null;
}

/**
 * A mapping of AppIDs to their corresponding React Icon components for the Taskbar.
 * @deprecated This mapping is part of the deprecated Taskbar component.
 */
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
  maya: MayaIcon, 
  workflow: WorkflowIcon,
  travelPlanViewer: TripIcon,
  transcriber: MicrophoneIcon,
  videoAnalyzer: VideoAnalyzeIcon,
  jules: JulesIcon,
  voice: VoiceAssistantIcon,
  marketing: MarketingIcon,
  smartwatch: SmartWatchIcon, 
  workspace: WorkspaceIcon,
  eventLog: EventLogIcon,
  creatorStudio: CreatorStudioIcon, 
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
  travelServices: TravelServicesIcon, 
  pricing: PricingIcon,
};

/**
 * The Taskbar component is a legacy component that has been replaced by the `Dock` component.
 * It currently renders `null` to ensure it does not appear in the UI.
 * @deprecated Use `Dock` instead.
 * @param {TaskbarProps} props - The component props (not actively used as it renders null).
 * @returns {null} Renders nothing.
 */
const Taskbar: React.FC<TaskbarProps> = ({ openWindows, onOpen, onRestore, onFocus, activeWindowId }) => {
  return null; // This is a legacy component, replaced by Dock. Kept for type safety.
};

export default React.memo(Taskbar);