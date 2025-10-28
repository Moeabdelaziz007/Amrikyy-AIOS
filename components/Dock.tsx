import React from 'react';
import { AppID, WindowInstance, TaskbarTheme } from '../types';
import { AnalyticsHubIcon, CreatorStudioIcon, BrowserIcon, ChatIcon, TripIcon, WorkspaceIcon, WorkflowIcon, SkillForgeIcon, SettingsIcon, AgentForgeIcon, StoreIcon, NotificationCenterIcon, AvatarStudioIcon, AudioStudioIcon, DevToolkitIcon, AgoraIcon, NexusChatIcon, DevConsoleIcon, ApiIcon, GrowthHubIcon, ResourceHubIcon, NewsIcon, FinanceIcon, CognitiveCanvasIcon, VeridianIdIcon, TranslateIcon, NexusGoIcon, NexusProfileIcon, TravelServicesIcon, MarketingIcon, FlightsIcon, ImageIcon, VideoIcon, SearchIcon, MapIcon, MicrophoneIcon, VideoAnalyzeIcon, SmartWatchIcon, EventLogIcon, ChronoVaultIcon, LiveConversationIcon, ImageAnalyzerIcon, ControlPanelIcon, PricingIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Props for the Dock component.
 */
interface DockProps {
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
  /** Callback function to toggle the visibility of the App Launcher. */
  onToggleLauncher: () => void;
  /** The theme applied to the taskbar. */
  taskbarTheme: TaskbarTheme;
  /** An array of AppIDs representing frequently used applications. */
  frequentApps: AppID[];
}

/**
 * A mapping of AppIDs to their corresponding React Icon components.
 */
const appIcons: Record<string, React.FC<{className?: string}>> = {
  [AppID.analyticsHub]: AnalyticsHubIcon,
  [AppID.creatorStudio]: CreatorStudioIcon,
  [AppID.cognitoBrowser]: BrowserIcon,
  [AppID.chat]: ChatIcon,
  [AppID.travelAgent]: TripIcon,
  [AppID.travelServices]: TravelServicesIcon,
  [AppID.workspace]: WorkspaceIcon,
  [AppID.workflow]: WorkflowIcon,
  [AppID.skillForge]: SkillForgeIcon,
  [AppID.agentForge]: AgentForgeIcon,
  [AppID.avatarStudio]: AvatarStudioIcon,
  [AppID.audio]: AudioStudioIcon,
  [AppID.settings]: SettingsIcon,
  [AppID.store]: StoreIcon,
  [AppID.notificationCenter]: NotificationCenterIcon,
  [AppID.agora]: AgoraIcon,
  [AppID.nexusChat]: NexusChatIcon,
  [AppID.marketing]: MarketingIcon,
  [AppID.devConsole]: DevConsoleIcon,
  [AppID.apiDocs]: ApiIcon,
  [AppID.devToolkit]: DevToolkitIcon,
  [AppID.growthHub]: GrowthHubIcon,
  [AppID.resourceHub]: ResourceHubIcon,
  [AppID.geminiAiNews]: NewsIcon,
  [AppID.atlasFinance]: FinanceIcon,
  [AppID.cognitiveCanvas]: CognitiveCanvasIcon,
  [AppID.veridianId]: VeridianIdIcon,
  [AppID.translateHub]: TranslateIcon,
  [AppID.nexusGo]: NexusGoIcon,
  [AppID.nexusFeed]: NexusChatIcon, // Corrected to NexusChatIcon for feed
  [AppID.nexusProfile]: NexusProfileIcon,
  // Ensure all AppIDs that might appear in the dock have a corresponding icon here.
  // Add more specific agent icons if needed, e.g., LunaIcon, KarimIcon
  [AppID.image]: ImageIcon,
  [AppID.video]: VideoIcon,
  [AppID.search]: SearchIcon,
  [AppID.maps]: MapIcon,
  [AppID.transcriber]: MicrophoneIcon,
  [AppID.videoAnalyzer]: VideoAnalyzeIcon,
  [AppID.smartwatch]: SmartWatchIcon,
  [AppID.eventLog]: EventLogIcon,
  [AppID.chronoVault]: ChronoVaultIcon,
  [AppID.liveConversation]: LiveConversationIcon,
  [AppID.imageAnalyzer]: ImageAnalyzerIcon,
  [AppID.controlPanel]: ControlPanelIcon,
  [AppID.pricing]: PricingIcon,
  [AppID.atlas]: AnalyticsHubIcon, // Placeholder, usually AgentProfileApp handles
  [AppID.cortex]: CognitiveCanvasIcon, // Placeholder
  [AppID.orion]: AnalyticsHubIcon, // Placeholder
  [AppID.helios]: NewsIcon, // Placeholder
  [AppID.leo]: MarketingIcon, // Placeholder
  [AppID.zara]: MarketingIcon, // Placeholder
  [AppID.rex]: MarketingIcon, // Placeholder
  [AppID.clio]: MarketingIcon, // Placeholder
  [AppID.jules]: AnalyticsHubIcon, // Placeholder
  [AppID.luna]: TripIcon, // Placeholder
  [AppID.karim]: FinanceIcon, // Placeholder
  [AppID.scout]: SearchIcon, // Placeholder
  [AppID.maya]: ChatIcon, // Placeholder
};

/**
 * The Dock component displays a row of application icons at the bottom of the screen.
 * It allows users to launch apps, switch between open windows, and access the app launcher.
 * @param {DockProps} props - The component props.
 * @returns {JSX.Element} The rendered Dock component.
 */
const Dock: React.FC<DockProps> = ({ openWindows, onOpen, onRestore, onFocus, activeWindowId, onToggleLauncher, frequentApps }) => {
  const { t } = useLanguage();

  /**
   * Handles clicking an app icon in the dock.
   * Opens a new window, restores a minimized one, or focuses an existing one.
   * @param {AppID} appId - The ID of the application clicked.
   */
  const handleAppClick = (appId: AppID) => {
    const window = openWindows.find(w => w.appId === appId);
    if (window) {
        if(window.isMinimized) {
            onRestore(window.id);
        } else {
            onFocus(window.id);
        }
    } else {
        onOpen(appId);
    }
  };

  /**
   * Defines the primary applications displayed in the dock.
   */
  const apps: { id: AppID; name: string; }[] = [
      { id: AppID.creatorStudio, name: t('dock.creatorStudio') },
      { id: AppID.store, name: t('dock.store') },
      { id: AppID.cognitoBrowser, name: t('dock.cognitoBrowser') },
      { id: AppID.atlasFinance, name: t('dock.atlasFinance') },
      { id: AppID.cognitiveCanvas, name: t('dock.cognitiveCanvas') },
      { id: AppID.geminiAiNews, name: t('dock.geminiAiNews') },
      { id: AppID.veridianId, name: t('app_titles.veridianId') },
      { id: AppID.nexusProfile, name: t('app_titles.nexusProfile') },
      { id: AppID.nexusFeed, name: t('app_titles.nexusFeed') },
      { id: AppID.translateHub, name: t('app_titles.translateHub') },
      { id: AppID.nexusGo, name: t('app_titles.nexusGo') },
      { id: AppID.travelAgent, name: t('dock.travelAgent') },
      { id: AppID.travelServices, name: t('app_titles.travelServices') },
      { id: AppID.workflow, name: t('dock.workflow')},
      { id: AppID.agentForge, name: t('dock.agentForge') },
      { id: AppID.growthHub, name: t('dock.growthHub') },
      { id: AppID.resourceHub, name: t('dock.resourceHub') },
      { id: AppID.notificationCenter, name: t('dock.notificationCenter') },
      { id: AppID.settings, name: t('dock.settings') },
  ];
  
  /**
   * Filters and maps frequent applications for display with a "Suggested" label.
   */
  const frequentAppDefs = frequentApps
    .map(appId => {
      const appDef = apps.find(a => a.id === appId);
      return appDef ? { ...appDef, name: t('dock.suggested', { appName: appDef.name }) } : null;
    })
    .filter(Boolean) as { id: AppID; name: string; }[];


  return (
    <footer className="fixed bottom-0 inset-x-0 z-20 flex justify-center p-2 animate-slide-up" style={{animationDelay: '400ms'}}>
        <div role="navigation" aria-label="Application Dock" className="flex items-center gap-2 glass-effect rounded-xl px-3 py-2 overflow-x-auto">
            <button
                onClick={onToggleLauncher}
                aria-label={t('dock.app_launcher')}
                className="group relative flex items-center justify-center size-12 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-2xl text-neon-cyan">apps</span>
                <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap">{t('dock.app_launcher')}</span>
            </button>
            <div className="w-px h-8 bg-white/10 flex-shrink-0"></div>
            
            {apps.map(app => {
                const Icon = appIcons[app.id];
                const openWindow = openWindows.find(w => w.appId === app.id);
                const isOpen = !!openWindow;
                const isActive = isOpen && !openWindow.isMinimized && openWindow.id === activeWindowId;

                return (
                    <button 
                      key={app.id} 
                      onClick={() => handleAppClick(app.id)} 
                      aria-label={app.name}
                      className="group relative flex items-center justify-center size-12 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
                        {Icon && <Icon className="text-2xl text-white/90" />}
                        {isOpen && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-neon-cyan' : 'bg-white/50'}`} />}
                        <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap">{app.name}</span>
                    </button>
                )
            })}
            
            {frequentAppDefs.length > 0 && <div className="w-px h-8 bg-white/10 flex-shrink-0"></div>}

            {frequentAppDefs.map(app => {
                 const Icon = appIcons[app.id];
                 const openWindow = openWindows.find(w => w.appId === app.id);
                 const isOpen = !!openWindow;
                 const isActive = isOpen && !openWindow.isMinimized && openWindow.id === activeWindowId;
                 return (
                    <button
                        key={`freq-${app.id}`}
                        onClick={() => handleAppClick(app.id)}
                        aria-label={app.name}
                        className="group relative flex items-center justify-center size-12 bg-transparent rounded-lg flex-shrink-0"
                    >
                        {Icon && <Icon className="text-2xl text-amber-300/80 group-hover:text-amber-300 transition-colors" />}
                        {isOpen && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-amber-400/50'}`} />}
                        <span className="absolute -top-1 -right-1 text-xs material-symbols-outlined text-amber-300">spark</span>
                        <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap">{app.name}</span>
                    </button>
                 )
            })}
            
        </div>
    </footer>
  );
};

export default React.memo(Dock);