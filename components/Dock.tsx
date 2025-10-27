import React from 'react';
import { AppID, WindowInstance, TaskbarTheme } from '../types';
import { AnalyticsHubIcon, CreatorStudioIcon, BrowserIcon, ChatIcon, TripIcon, WorkspaceIcon, WorkflowIcon, SkillForgeIcon, SettingsIcon, AgentForgeIcon, StoreIcon, NotificationCenterIcon, AvatarStudioIcon, AudioStudioIcon, DevToolkitIcon, AgoraIcon, NexusChatIcon, DevConsoleIcon, ApiIcon, GrowthHubIcon, ResourceHubIcon, NewsIcon, FinanceIcon, CognitiveCanvasIcon, VeridianIdIcon, TranslateIcon, NexusGoIcon, NexusProfileIcon, TravelServicesIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DockProps {
  openWindows: WindowInstance[];
  onOpen: (appId: AppID) => void;
  onRestore: (id: number) => void;
  onFocus: (id: number) => void;
  activeWindowId: number | null;
  onToggleLauncher: () => void;
  taskbarTheme: TaskbarTheme;
  frequentApps: AppID[];
}

const appIcons: Record<string, React.FC<{className?: string}>> = {
  analyticsHub: AnalyticsHubIcon,
  creatorStudio: CreatorStudioIcon,
  cognitoBrowser: BrowserIcon,
  chat: ChatIcon,
  travelAgent: TripIcon,
  travelServices: TravelServicesIcon, // New
  workspace: WorkspaceIcon,
  workflow: WorkflowIcon,
  skillForge: SkillForgeIcon,
  agentForge: AgentForgeIcon,
  avatarStudio: AvatarStudioIcon,
  audio: AudioStudioIcon,
  settings: SettingsIcon,
  store: StoreIcon,
  notificationCenter: NotificationCenterIcon,
  agora: AgoraIcon,
  nexusChat: NexusChatIcon,
  marketing: MarketingIcon,
  devConsole: DevConsoleIcon,
  apiDocs: ApiIcon,
  devToolkit: DevToolkitIcon,
  growthHub: GrowthHubIcon,
  resourceHub: ResourceHubIcon,
  geminiAiNews: NewsIcon,
  atlasFinance: FinanceIcon,
  cognitiveCanvas: CognitiveCanvasIcon,
  veridianId: VeridianIdIcon,
  translateHub: TranslateIcon,
  nexusGo: NexusGoIcon,
  nexusFeed: NexusChatIcon, // Use NexusChatIcon for NexusFeed
  nexusProfile: NexusProfileIcon, // New
};


const Dock: React.FC<DockProps> = ({ openWindows, onOpen, onRestore, onFocus, activeWindowId, onToggleLauncher, frequentApps }) => {
  const { t } = useLanguage();

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

  const apps: { id: AppID; name: string; }[] = [
      { id: 'creatorStudio', name: t('dock.creatorStudio') },
      { id: 'store', name: t('dock.store') },
      { id: 'cognitoBrowser', name: t('dock.cognitoBrowser') },
      { id: 'atlasFinance', name: t('dock.atlasFinance') },
      { id: 'cognitiveCanvas', name: t('dock.cognitiveCanvas') },
      { id: 'geminiAiNews', name: t('dock.geminiAiNews') },
      { id: 'veridianId', name: t('app_titles.veridianId') },
      { id: 'nexusProfile', name: t('app_titles.nexusProfile') }, // New
      { id: 'nexusFeed', name: t('app_titles.nexusFeed') }, // New
      { id: 'translateHub', name: t('app_titles.translateHub') },
      { id: 'nexusGo', name: t('app_titles.nexusGo') },
      { id: 'travelAgent', name: t('dock.travelAgent') },
      { id: 'travelServices', name: t('app_titles.travelServices') }, // New
      { id: 'workflow', name: t('dock.workflow')},
      { id: 'agentForge', name: t('dock.agentForge') },
      { id: 'growthHub', name: t('dock.growthHub') },
      { id: 'resourceHub', name: t('dock.resourceHub') },
      { id: 'notificationCenter', name: t('dock.notificationCenter') },
      { id: 'settings', name: t('dock.settings') },
  ];
  
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