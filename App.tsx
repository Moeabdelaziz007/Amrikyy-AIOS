import React, { useState, useCallback, Suspense, lazy, useEffect, useMemo } from 'react';
import { WindowInstance, AppID, Settings, TravelPlan, Workflow, Alarm, Automation, Theme, CustomAgent, CommunityAgent, UserAccount, DashboardLayout, CalendarEvent, DriveFile, GmailMessage, Project, Task, PaymentMethod, AgoraListing, SharedContent, CreatorBounty, NexusPost, SocialPost, WeatherCondition, NexusComment, CreditTransaction, CreditTransactionType } from './types';
import Dock from './components/Dock';
import AppLauncher from './components/AppLauncher';
import PoweredByGemini from './components/PoweredByGemini';
import WorkflowDashboardWidget from './components/widgets/WorkflowDashboardWidget'; // Explicit relative import
import { getCalendarEvents, getDriveFiles, getGmailMessages } from './services/googleWorkspaceService';
import { createCalendarEventFromPlan } from './services/geminiAdvancedService';
import DesktopAppsGrid from './components/DesktopAppsGrid';
import { CreatorStudioIcon, BrowserIcon, ChatIcon, TripIcon, WorkflowIcon, SkillForgeIcon, ChronoVaultIcon, WorkspaceIcon, SmartWatchIcon, EventLogIcon, ImageIcon, LunaIcon, FileIcon, SettingsIcon, TerminalIcon, VoiceAssistantIcon, MarketingIcon, AgentForgeIcon, JulesIcon, StoreIcon, LiveConversationIcon, ImageAnalyzerIcon, NotificationCenterIcon, AgoraIcon, NexusChatIcon, DevConsoleIcon, ApiIcon, DevToolkitIcon, GrowthHubIcon, ResourceHubIcon, NewsIcon, ControlPanelIcon, FinanceIcon, CognitiveCanvasIcon, VeridianIdIcon, TranslateIcon, NexusGoIcon, NexusProfileIcon, AvatarStudioIcon, TravelServicesIcon } from './components/Icons';
import { useLanguage } from './contexts/LanguageContext';
import AnimatedBackground from './components/AnimatedBackground';
import SystemOverviewWidget from './components/widgets/SystemOverviewWidget'; // Explicit relative import
import { NotificationCenter } from './components/NotificationCenter';
import { useNotification } from './contexts/NotificationContext';
import CryptoDashboardWidget from './components/widgets/CryptoDashboardWidget'; // Explicit relative import
import { useUserBehavior } from './contexts/UserBehaviorContext';
import GlobalVoiceControl from './components/GlobalVoiceControl';
import { useGoogleAuth } from './contexts/GoogleAuthContext';
import ProjectsWidget from './components/widgets/ProjectsWidget'; // Explicit relative import
import TasksWidget from './components/widgets/TasksWidget'; // Explicit relative import
import CreatePostModal from './components/CreatePostModal';
import { bounties as mockBounties } from './data/bounties';
import LoadingScreen from './components/LoadingScreen'; // Re-added LoadingScreen import
import { initialNexusPosts as mockNexusPosts } from './data/nexus'; // Import initial mock Nexus posts

// Lazy load all application components for code-splitting and performance
const Window = lazy(() => import('./components/Window'));
const ProactiveSuggestionsWidget = lazy(() => import('./components/widgets/ProactiveSuggestionsWidget')); // Explicit relative import
const WorkspaceHubWidget = lazy(() => import('./components/widgets/WorkspaceHubWidget')); // Explicit relative import
const NexusFeedWidget = lazy(() => import('./components/widgets/NexusFeedWidget')); // Explicit relative import // Replaced ViralFeedWidget
const QuickActionsWidget = lazy(() => import('./components/widgets/QuickActionsWidget')); // Explicit relative import
const GeminiAiNewsWidget = lazy(() => import('./components/widgets/GeminiAiNewsWidget')); // Explicit relative import

const appComponents: Record<AppID, React.LazyExoticComponent<React.ComponentType<any>>> = {
  chat: lazy(() => import('./components/apps/ChatApp')),
  terminal: lazy(() => import('./components/apps/TerminalApp')),
  files: lazy(() => import('./components/apps/FilesApp')),
  settings: lazy(() => import('./components/apps/SettingsApp')),
  luna: lazy(() => import('./components/apps/LunaApp')),
  karim: lazy(() => import('./components/apps/KarimApp')),
  scout: lazy(() => import('./components/apps/ScoutApp')),
  maya: lazy(() => import('./components/apps/MayaApp')),
  jules: lazy(() => import('./components/apps/JulesApp')),
  voice: lazy(() => import('./components/apps/VoiceAssistantApp')),
  workflow: lazy(() => import('./components/apps/WorkflowStudioApp')),
  travelAgent: lazy(() => import('./components/apps/TravelAgentApp')),
  marketing: lazy(() => import('./components/apps/MarketingApp')),
  travelPlanViewer: lazy(() => import('./components/apps/TravelPlanViewerApp')),
  search: lazy(() => import('./components/apps/SearchApp')),
  maps: lazy(() => import('./components/apps/MapsApp')),
  transcriber: lazy(() => import('./components/apps/TranscriberApp')),
  videoAnalyzer: lazy(() => import('./components/apps/VideoAnalyzerApp')),
  image: lazy(() => import('./components/apps/ImageGeneratorApp')),
  audio: lazy(() => import('./components/apps/AudioStudioApp')),
  video: lazy(() => import('./components/apps/VideoGeneratorApp')),
  smartwatch: lazy(() => import('./components/apps/SmartWatchApp')),
  workspace: lazy(() => import('./components/apps/WorkspaceApp')),
  eventLog: lazy(() => import('./components/apps/EventLogApp')),
  skillForge: lazy(() => import('./components/apps/SkillForgeApp')),
  chronoVault: lazy(() => import('./components/apps/ChronoVaultApp')),
  creatorStudio: lazy(() => import('./components/apps/CreatorStudioApp')),
  cognitoBrowser: lazy(() => import('./components/apps/CognitoBrowserApp')),
  analyticsHub: lazy(() => import('./components/apps/AnalyticsHubApp')),
  agentForge: lazy(() => import('./components/apps/AgentForgeApp')),
  avatarStudio: lazy(() => import('./components/apps/AvatarStudioApp')),
  agentProfile: lazy(() => import('./components/apps/AgentProfileApp')),
  store: lazy(() => import('./components/apps/StoreApp')),
  notificationCenter: lazy(() => import('./components/apps/NotificationCenterApp')),
  liveConversation: lazy(() => import('./components/apps/LiveConversationApp')),
  imageAnalyzer: lazy(() => import('./components/apps/ImageAnalyzerApp')),
  agora: lazy(() => import('./components/apps/AgoraApp')),
  nexusChat: lazy(() => import('./components/apps/NexusChatApp')),
  devConsole: lazy(() => import('./components/apps/DevConsoleApp')),
  apiDocs: lazy(() => import('./components/apps/ApiDocsApp')),
  devToolkit: lazy(() => import('./components/apps/DevToolkitApp')),
  growthHub: lazy(() => import('./components/apps/GrowthHubApp')),
  resourceHub: lazy(() => import('./components/apps/ResourceHubApp')),
  geminiAiNews: lazy(() => import('./components/apps/GeminiAiNewsApp')),
  controlPanel: lazy(() => import('./components/apps/ControlPanelApp')),
  atlasFinance: lazy(() => import('./components/apps/AtlasApp')),
  cognitiveCanvas: lazy(() => import('./components/apps/CognitiveCanvasApp')),
  veridianId: lazy(() => import('./components/apps/VeridianIdApp')),
  translateHub: lazy(() => import('./components/apps/TranslateHubApp')),
  nexusGo: lazy(() => import('./components/apps/NexusGoApp')),
  nexusFeed: lazy(() => import('./components/apps/NexusFeedApp')), // New
  nexusProfile: lazy(() => import('./components/apps/NexusProfileApp')), // New
  travelServices: lazy(() => import('./components/apps/TravelServicesApp')), // New
  // Existing agents
  atlas: lazy(() => import('./components/apps/AgentProfileApp')),
  cortex: lazy(() => import('./components/apps/AgentProfileApp')),
  orion: lazy(() => import('./components/apps/AgentProfileApp')),
  helios: lazy(() => import('./components/apps/AgentProfileApp')),
  leo: lazy(() => import('./components/apps/AgentProfileApp')),
  zara: lazy(() => import('./components/apps/AgentProfileApp')),
  rex: lazy(() => import('./components/apps/AgentProfileApp')),
  clio: lazy(() => import('./components/apps/AgentProfileApp')),
  pricing: lazy(() => import('./components/apps/SettingsApp')),
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'obsidian',
  wallpaper: '/wallpaper-obsidian.svg',
  accentColor: '#38BDF8',
  taskbarTheme: 'glass',
  windowStyle: 'cyberpunk',
  voice: 'Kore',
  speechRate: 1.0,
  speechPitch: 0,
  dashboardLayout: 'default',
  language: 'en',
};

const AppLoadingSpinner: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
  // Removed isOSLoaded state and useEffect that simulated initial loading
  const [isOSLoaded, setIsOSLoaded] = useState(false); // Re-added isOSLoaded state
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [nextId, setNextId] = useState(1);
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
  
  const { t, setLanguage } = useLanguage();
  const { addNotification } = useNotification();
  const { logAction, getFrequentApps } = useUserBehavior();
  const { isSignedIn } = useGoogleAuth();
  
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount>({ 
    osId: 'AMRIYY-OS-USER-7890',
    joinDate: new Date().toISOString().split('T')[0],
    trustScore: 75,
    name: 'User', 
    avatar: '👩‍🚀', 
    tier: 'Free', 
    aiCredits: 1000, 
    referralCode: 'REF123', 
    referralsCount: 0, 
    creditsEarnedFromReferrals: 0, 
    creatorScore: 0 
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [agoraListings, setAgoraListings] = useState<AgoraListing[]>([]);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [bounties, setBounties] = useState<CreatorBounty[]>(mockBounties);
  const [completedBounties, setCompletedBounties] = useState<Set<string>>(new Set());
  const [nexusPosts, setNexusPosts] = useState<NexusPost[]>(mockNexusPosts); // Renamed from viralPosts
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition | null>(null);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]); // New: credit transaction history

  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: '1', time: '07:00', label: 'Good Morning!', enabled: true },
    { id: '2', time: '09:00', label: 'Team Standup', enabled: false },
  ]);
  const [automations, setAutomations] = useState<Automation[]>([
     { id: '1', trigger: 'Time is 08:00', action: { appId: 'chat', task: 'Open and say good morning' } }
  ]);
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);

  // New: Centralized credit transaction handler
  const handleCreditTransaction = useCallback((amount: number, type: CreditTransactionType, description: string) => {
    setUserAccount(prev => ({
      ...prev,
      aiCredits: prev.aiCredits + amount, // amount can be negative for withdrawals
    }));
    const newTransaction: CreditTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      amount,
      timestamp: new Date().toISOString(),
      description,
    };
    setCreditTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const handleSuccessfulReferral = useCallback(() => {
    setUserAccount(prev => ({
        ...prev,
        referralsCount: (prev.referralsCount || 0) + 1,
        creditsEarnedFromReferrals: (prev.creditsEarnedFromReferrals || 0) + 500,
    }));
    handleCreditTransaction(500, 'bonus', 'Referral bonus');
    addNotification("Referral successful! 500 AI Credits added.", 'success');
  }, [addNotification, handleCreditTransaction]);
  
  const handleBonusTask = useCallback((credits: number) => {
    handleCreditTransaction(credits, 'bonus', 'Task completion bonus');
    addNotification(`${credits} bonus AI Credits added!`, 'success');
  }, [addNotification, handleCreditTransaction]);

  const handleAddPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
    addNotification(`Payment method ${method.type} added successfully.`, 'success');
  }, [addNotification]);

  const addCustomAgent = useCallback((agent: CustomAgent | CommunityAgent) => {
    setCustomAgents(prev => {
        if (prev.some(a => a.id === agent.id)) return prev;
        const newAgent = { ...agent, id: agent.id || `custom-${Date.now()}` };
        return [...prev, newAgent];
    });
    addNotification(t('notifications.agent_installed', { agentName: agent.name }), 'success');
  }, [addNotification, t]);

  const handlePurchase = useCallback((listing: AgoraListing) => {
    if (userAccount.aiCredits < listing.price) {
        addNotification("Insufficient AI Credits to purchase.", 'error');
        return;
    }
    handleCreditTransaction(-listing.price, 'purchase', `Purchased ${listing.type === 'agent' ? (listing.asset as CustomAgent).name : (listing.asset as Workflow).title}`);
    if (listing.type === 'agent') {
        addCustomAgent(listing.asset as CustomAgent);
    }
    // TODO: Handle workflow installation
    addNotification(`${listing.type === 'agent' ? (listing.asset as CustomAgent).name : (listing.asset as Workflow).title} purchased and installed!`, 'success');
  }, [userAccount.aiCredits, addNotification, addCustomAgent, handleCreditTransaction]);

  const handleListOnAgora = useCallback((listing: Omit<AgoraListing, 'id' | 'author'>) => {
    const newListing: AgoraListing = {
        ...listing,
        id: `agora-${Date.now()}`,
        author: userAccount.name,
    };
    setAgoraListings(prev => [newListing, ...prev]);
    addNotification("Your asset has been listed on the Agora Marketplace!", 'success');
  }, [userAccount.name, addNotification]);
  
  const handleCompleteBounty = useCallback((bountyId: string) => {
    setCompletedBounties(prev => new Set(prev).add(bountyId));
    const bounty = bounties.find(b => b.id === bountyId);
    if(bounty) {
        handleCreditTransaction(bounty.creditReward, 'bonus', `Completed bounty: ${bounty.title}`);
        setUserAccount(prev => ({
            ...prev,
            creatorScore: (prev.creatorScore || 0) + bounty.creditReward,
        }));
        addNotification(`Bounty complete! +${bounty.creditReward} AI Credits & Creator Score!`, 'success');
    }
  }, [bounties, addNotification, handleCreditTransaction]);

  const handleShareAndPost = (content: SharedContent, socialPost: SocialPost) => {
      const newPost: NexusPost = {
        id: `post-${Date.now()}`,
        author: userAccount.name,
        osId: userAccount.osId, // Include OS ID for NexusProfile
        content,
        socialPost,
        likes: 0,
        views: 0,
        comments: [], // Initialize with no comments
      };
      setNexusPosts(prev => [newPost, ...prev]);
      setShareContent(null);
      addNotification("Your content has been shared to the Creator Spotlight!", 'success');
      // Check for related bounty
      const shareBounty = bounties.find(b => b.action.type === 'share_content' && b.action.contentType === content.type && !completedBounties.has(b.id));
      if(shareBounty) {
        handleCompleteBounty(shareBounty.id);
      }
  };
  
   // Simulate Nexus feed activity (likes/views)
    useEffect(() => {
        const interval = setInterval(() => {
            setNexusPosts(prevPosts => {
                if (prevPosts.length === 0) return prevPosts;
                const postToUpdateIndex = Math.floor(Math.random() * prevPosts.length);
                return prevPosts.map((post, index) => {
                    if (index === postToUpdateIndex) {
                        const wasViral = post.likes >= 1000;
                        const newLikes = post.likes + Math.floor(Math.random() * 50);
                        const becomesViral = newLikes >= 1000;

                        if (becomesViral && !wasViral) {
                             handleCreditTransaction(500, 'bonus', `Post "${post.content.title}" went viral!`);
                             // No need to update userAccount directly here, handleCreditTransaction does it.
                        }
                        
                        return { ...post, likes: newLikes, views: post.views + Math.floor(Math.random() * 200) };
                    }
                    return post;
                });
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [addNotification, completedBounties, handleCompleteBounty, handleCreditTransaction]);

  // Simulate OS loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsOSLoaded(true);
    }, 5000); // Adjust based on desired loading time
    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (isSignedIn) {
        const results = await Promise.allSettled([
          getCalendarEvents(),
          getDriveFiles(),
          getGmailMessages(),
        ]);

        if (results[0].status === 'fulfilled') setCalendarEvents(results[0].value);
        else addNotification(results[0].reason.message, 'error');
        
        if (results[1].status === 'fulfilled') setDriveFiles(results[1].value);
        else addNotification(results[1].reason.message, 'error');

        if (results[2].status === 'fulfilled') setGmailMessages(results[2].value);
        else addNotification(results[2].reason.message, 'error');

      } else {
        setCalendarEvents([]);
        setDriveFiles([]);
        setGmailMessages([]);
      }
    };
    fetchWorkspaceData();
  }, [isSignedIn, addNotification]);
  
  // Ambient weather data fetching and setting
  useEffect(() => {
    const fetchWeather = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock weather data based on location (simplified)
          const conditions: WeatherCondition[] = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
          const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
          setCurrentWeather({
            location: 'Local Area',
            temp: Math.floor(Math.random() * 15) + 15, // 15-30 deg C
            condition: randomCondition,
            icon: randomCondition === 'Sunny' ? 'sunny' : randomCondition === 'Partly Cloudy' ? 'partly_cloudy_day' : randomCondition === 'Rainy' ? 'rainy' : 'cloudy',
            high: Math.floor(Math.random() * 5) + 25,
            low: Math.floor(Math.random() * 5) + 15,
          });
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          setCurrentWeather({
            location: 'Unknown',
            temp: 20,
            condition: 'Clear',
            icon: 'sunny',
            high: 25,
            low: 15,
          });
        }
      );
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const appTitles: Record<string, string> = useMemo(() => ({
    chat: t('app_titles.chat'),
    terminal: t('app_titles.terminal'),
    files: t('app_titles.files'),
    settings: t('app_titles.settings'),
    luna: t('app_titles.luna'),
    karim: t('app_titles.karim'),
    scout: t('app_titles.scout'),
    maya: t('app_titles.maya'),
    jules: t('app_titles.jules'),
    voice: t('app_titles.voice'),
    workflow: t('app_titles.workflow'),
    travelAgent: t('app_titles.travelAgent'),
    marketing: t('app_titles.marketing'),
    travelPlanViewer: t('app_titles.travelPlanViewer'),
    search: t('app_titles.search'),
    maps: t('app_titles.maps'),
    transcriber: t('app_titles.transcriber'),
    videoAnalyzer: t('app_titles.videoAnalyzer'),
    image: t('app_titles.image'),
    audio: t('app_titles.audio'),
    video: t('app_titles.video'),
    smartwatch: t('app_titles.smartwatch'),
    workspace: t('app_titles.workspace'),
    eventLog: t('app_titles.eventLog'),
    skillForge: t('app_titles.skillForge'),
    chronoVault: t('app_titles.chronoVault'),
    creatorStudio: t('app_titles.creatorStudio'),
    cognitoBrowser: t('app_titles.cognitoBrowser'),
    analyticsHub: t('app_titles.analyticsHub'),
    agentForge: t('app_titles.agentForge'),
    avatarStudio: t('app_titles.avatarStudio'),
    agentProfile: t('app_titles.agentProfile'),
    store: t('app_titles.store'),
    notificationCenter: t('app_titles.notificationCenter'),
    liveConversation: t('app_titles.liveConversation'),
    imageAnalyzer: t('app_titles.imageAnalyzer'),
    agora: t('app_titles.agora'),
    nexusChat: t('app_titles.nexusChat'),
    devConsole: t('app_titles.devConsole'),
    apiDocs: t('app_titles.apiDocs'),
    devToolkit: t('app_titles.devToolkit'),
    growthHub: t('app_titles.growthHub'),
    resourceHub: t('app_titles.resourceHub'),
    geminiAiNews: t('app_titles.geminiAiNews'),
    controlPanel: t('app_titles.controlPanel'),
    atlasFinance: t('app_titles.atlasFinance'),
    cognitiveCanvas: t('app_titles.cognitiveCanvas'),
    veridianId: t('app_titles.veridianId'),
    translateHub: t('app_titles.translateHub'),
    nexusGo: t('app_titles.nexusGo'),
    nexusFeed: t('app_titles.nexusFeed'), // New
    nexusProfile: t('app_titles.nexusProfile'), // New
    travelServices: t('app_titles.travelServices'), // New
    'pricing': t('app_titles.pricing'),
  }), [t]);

  useEffect(() => {
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${settings.theme}`);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    setLanguage(settings.language);
  }, [settings.theme, settings.accentColor, settings.language, setLanguage]);

  const handleSettingsChange = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  const handleUserAccountChange = useCallback((newAccount: Partial<UserAccount>) => {
    setUserAccount(prev => ({...prev, ...newAccount}));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);
  
  const handleUpgrade = useCallback(() => {
    handleCreditTransaction(4000, 'deposit', 'Pro plan upgrade'); // Assuming 1000 initial, +4000 for Pro
    addNotification(t('notifications.upgraded_to_pro'), 'success');
  }, [addNotification, t, handleCreditTransaction]);

  const openWindow = useCallback((appId: AppID, appProps: any = {}) => {
    logAction(appId, appProps);
    setIsAppLauncherOpen(false);
    const customAgent = customAgents.find(a => a.id === appId);

    setWindows(prevWindows => {
      const existingWindow = prevWindows.find(w => w.appId === appId && !Object.keys(w.appProps).length && !customAgent);
      if (existingWindow) {
        return prevWindows.map(w =>
          w.id === existingWindow.id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
        );
      }

      const windowAppId = customAgent ? 'agentProfile' : appId;

      // Determine window size based on screen size for responsiveness
      const isSmallScreen = window.innerWidth < 768;
      const defaultWidth = isSmallScreen ? window.innerWidth * 0.95 : 800;
      const defaultHeight = isSmallScreen ? window.innerHeight * 0.95 : 600;

      const appSpecificWidth = ['agentProfile', 'luna', 'karim', 'scout', 'maya', 'jules', 'liveConversation', 'veridianId', 'nexusProfile'].includes(windowAppId) ? (isSmallScreen ? window.innerWidth * 0.9 : 500) : defaultWidth;
      const appSpecificHeight = ['agentProfile', 'luna', 'karim', 'scout', 'maya', 'jules', 'liveConversation', 'veridianId', 'nexusProfile'].includes(windowAppId) ? (isSmallScreen ? window.innerHeight * 0.9 : 700) : defaultHeight;

      const newWindow: WindowInstance = {
        id: nextId,
        appId: windowAppId,
        title: customAgent ? `${t('agent_prefix.agent')}: ${customAgent.name}` : appTitles[appId] || "Application",
        x: isSmallScreen ? (window.innerWidth - appSpecificWidth) / 2 : 100 + (prevWindows.length % 5) * 40,
        y: isSmallScreen ? (window.innerHeight - appSpecificHeight) / 2 : 100 + (prevWindows.length % 5) * 40,
        width: appSpecificWidth,
        height: appSpecificHeight,
        zIndex: nextZIndex,
        isMinimized: false,
        appProps: customAgent ? { agent: customAgent } : appProps,
      };
      setNextId(prev => prev + 1);
      setNextZIndex(prev => prev + 1);
      return [...prevWindows, newWindow];
    });
    setNextZIndex(prev => prev + 1);
  }, [nextId, nextZIndex, customAgents, t, appTitles, logAction]);

  const executeCommand = useCallback((command: string) => {
    const [action, target] = command.split(' ');
    if (action === 'open' && target) {
      const appId = target.toLowerCase() as AppID;
      if(Object.keys(appTitles).includes(appId)) {
        openWindow(appId);
      }
    } else if(action === 'close' && target === 'all') {
      setWindows([]);
    }
  }, [openWindow, appTitles]);

  const handleWorkflowComplete = useCallback((result: any) => {
    if (result && 'destination' in result) { // Check if it's a TravelPlan
        openWindow('travelPlanViewer', { plan: result });
    }
  }, [openWindow]);

  const executeWorkflow = useCallback((workflow: Workflow, details?: any) => {
      openWindow('workflow', { workflow, isExecuting: true, executingDetails: details });
  }, [openWindow]);

  const startTravelWorkflow = useCallback(async (details: { destination: string, startDate: string, endDate: string, budget: string }) => {
      const travelWorkflow: Workflow = {
        title: `Generating Travel Plan for ${details.destination}`,
        nodes: [
            { id: '1', agentId: 'luna', description: 'Plan Itinerary' },
            { id: '2', agentId: 'scout', description: 'Find Deals' },
            { id: '3', agentId: 'karim', description: 'Optimize Budget' },
        ],
        connections: [{from: '1', to: '2'}, {from: '2', to: '3'}]
      };
      executeWorkflow(travelWorkflow, details);
  }, [executeWorkflow]);

  const handleAddToCalendar = useCallback(async (plan: TravelPlan) => {
    try {
        const events = await createCalendarEventFromPlan(plan);
        addNotification(`Suggested ${events.length} events for your calendar.`, 'info');
        // In a real app, you'd open a modal to confirm adding events.
        // For this demo, we'll just log them.
        console.log("Generated Calendar Events:", events);
    } catch (e: any) {
        addNotification(e.message, 'error');
    }
  }, [addNotification]);
  
  const closeWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const restoreWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };

  const focusWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };
  
  const activeWindowId = windows.length > 0 ? windows.filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id : null;
  
  const desktopApps = useMemo(() => [
    { id: 'creatorStudio', name: t('desktop_apps.creatorStudio'), icon: CreatorStudioIcon },
    { id: 'cognitoBrowser', name: t('desktop_apps.cognitoBrowser'), icon: BrowserIcon },
    { id: 'travelAgent', name: t('desktop_apps.travelAgent'), icon: TripIcon },
    { id: 'travelServices', name: t('app_titles.travelServices'), icon: TravelServicesIcon }, // New
    { id: 'workflow', name: t('desktop_apps.workflow'), icon: WorkflowIcon },
    { id: 'atlasFinance', name: t('app_titles.atlasFinance'), icon: FinanceIcon },
    { id: 'cognitiveCanvas', name: t('app_titles.cognitiveCanvas'), icon: CognitiveCanvasIcon },
    { id: 'geminiAiNews', name: t('app_titles.geminiAiNews'), icon: NewsIcon },
    { id: 'veridianId', name: t('app_titles.veridianId'), icon: VeridianIdIcon },
    { id: 'nexusProfile', name: t('app_titles.nexusProfile'), icon: NexusProfileIcon }, // New
    { id: 'nexusGo', name: t('app_titles.nexusGo'), icon: NexusGoIcon },
    { id: 'translateHub', name: t('app_titles.translateHub'), icon: TranslateIcon },
    { id: 'controlPanel', name: t('app_titles.controlPanel'), icon: ControlPanelIcon },
    { id: 'agentForge', name: t('desktop_apps.agentForge'), icon: AgentForgeIcon },
    ...customAgents.map(agent => ({
        id: agent.id as AppID,
        name: agent.name,
        icon: agent.avatarVisual ? ({ className }: {className?: string}) => <img src={`/avatars/${agent.avatarVisual}.png`} alt={agent.name} className={`w-full h-full object-cover ${className ?? ''}`} /> : ({ className }: {className?: string}) => <span className={`text-4xl ${className ?? ''}`}>{agent.icon}</span>
    }))
  ], [customAgents, t]);

  const allAppsForLauncher = useMemo(() => [
    { id: 'store', name: t('app_launcher.store'), icon: StoreIcon },
    { id: 'creatorStudio', name: t('app_launcher.creatorStudio'), icon: CreatorStudioIcon },
    { id: 'cognitoBrowser', name: t('app_launcher.cognitoBrowser'), icon: BrowserIcon },
    { id: 'chat', name: t('app_launcher.chat'), icon: ChatIcon },
    { id: 'voice', name: t('app_launcher.voice'), icon: VoiceAssistantIcon },
    { id: 'travelAgent', name: t('app_launcher.travelAgent'), icon: TripIcon },
    { id: 'travelServices', name: t('app_titles.travelServices'), icon: TravelServicesIcon }, // New
    { id: 'workspace', name: t('app_launcher.workspace'), icon: WorkspaceIcon },
    { id: 'smartwatch', name: t('app_launcher.smartwatch'), icon: SmartWatchIcon },
    { id: 'marketing', name: t('app_launcher.marketing'), icon: MarketingIcon },
    { id: 'workflow', name: t('app_launcher.workflow'), icon: WorkflowIcon },
    { id: 'agentForge', name: t('app_launcher.agentForge'), icon: AgentForgeIcon },
    { id: 'atlasFinance', name: t('app_launcher.atlasFinance'), icon: FinanceIcon },
    { id: 'cognitiveCanvas', name: t('app_launcher.cognitiveCanvas'), icon: CognitiveCanvasIcon },
    { id: 'veridianId', name: t('app_titles.veridianId'), icon: VeridianIdIcon },
    { id: 'nexusProfile', name: t('app_titles.nexusProfile'), icon: NexusProfileIcon }, // New
    { id: 'translateHub', name: t('app_titles.translateHub'), icon: TranslateIcon },
    { id: 'nexusGo', name: t('app_titles.nexusGo'), icon: NexusGoIcon },
    { id: 'nexusFeed', name: t('app_titles.nexusFeed'), icon: NexusChatIcon }, // New
    { id: 'avatarStudio', name: t('app_launcher.avatarStudio'), icon: AvatarStudioIcon },
    { id: 'skillForge', name: t('app_launcher.skillForge'), icon: SkillForgeIcon },
    { id: 'chronoVault', name: t('app_launcher.chronoVault'), icon: ChronoVaultIcon },
    { id: 'eventLog', name: t('app_launcher.eventLog'), icon: EventLogIcon },
    { id: 'notificationCenter', name: t('app_launcher.notificationCenter'), icon: NotificationCenterIcon },
    { id: 'jules', name: t('app_launcher.jules'), icon: JulesIcon },
    { id: 'files', name: t('app_launcher.files'), icon: FileIcon },
    { id: 'settings', name: t('app_launcher.settings'), icon: SettingsIcon },
    { id: 'controlPanel', name: t('app_launcher.controlPanel'), icon: ControlPanelIcon },
    { id: 'terminal', name: t('app_launcher.terminal'), icon: TerminalIcon },
    { id: 'devToolkit', name: t('app_launcher.devToolkit'), icon: DevToolkitIcon },
    { id: 'growthHub', name: t('app_launcher.growthHub'), icon: GrowthHubIcon },
    { id: 'resourceHub', name: t('app_launcher.resourceHub'), icon: ResourceHubIcon },
    { id: 'geminiAiNews', name: t('app_launcher.geminiAiNews'), icon: NewsIcon },
    ...customAgents.map(agent => ({
        id: agent.id as AppID,
        name: agent.name,
        icon: ({ className }: { className?: string }) => <span className={`text-2xl ${className ?? ''}`}>{agent.icon}</span>
    }))
  ], [customAgents, t]);

  const renderDashboardWidgets = (layout: DashboardLayout) => {
    switch(layout) {
      case 'work':
        return (
          <>
            <Suspense fallback={null}><WorkspaceHubWidget isConnected={isSignedIn} events={calendarEvents} files={driveFiles} messages={gmailMessages} /></Suspense>
            <Suspense fallback={null}><ProactiveSuggestionsWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><ProjectsWidget projects={projects} /></Suspense>
            <Suspense fallback={null}><TasksWidget tasks={tasks.filter(t => !t.completed)} /></Suspense>
          </>
        );
      case 'developer':
        return (
          <>
            <Suspense fallback={null}><ProactiveSuggestionsWidget onOpenApp={openWindow} /></Suspense>
            <WorkflowDashboardWidget onOpenApp={openWindow} />
            <Suspense fallback={null}><CryptoDashboardWidget /></Suspense>
          </>
        );
      case 'default':
      default:
        return (
          <>
            <Suspense fallback={null}><QuickActionsWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><GeminiAiNewsWidget onOpenApp={openWindow} /></Suspense>
            <WorkflowDashboardWidget onOpenApp={openWindow} />
            <Suspense fallback={null}><NexusFeedWidget posts={nexusPosts} /></Suspense>
            <Suspense fallback={null}><CryptoDashboardWidget /></Suspense>
          </>
        );
    }
  }

  if (!isOSLoaded) {
    return <LoadingScreen userAccountName={userAccount.name} />;
  }

  const handleLikePost = useCallback((postId: string) => {
    setNexusPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  }, []);

  const handleAddComment = useCallback((postId: string, comment: NexusComment) => {
    setNexusPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
    ));
  }, []);

  const handleBoostPost = useCallback((postId: string, cost: number) => {
    if (userAccount.aiCredits < cost) {
        addNotification(t('*.insufficient_credits_text', { cost }), 'error');
        return false;
    }
    handleCreditTransaction(-cost, 'boost', `Boosted post "${nexusPosts.find(p => p.id === postId)?.content.title || 'Unknown Post'}"`);
    addNotification(`Post boosted successfully for ${cost} credits!`, 'success');
    // Simulate increased views immediately
    setNexusPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, views: post.views + 500 } : post
    ));
    return true;
  }, [userAccount.aiCredits, addNotification, t, handleCreditTransaction, nexusPosts]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black font-sans">
      <div className="animated-bg-container fixed inset-0 -z-10">
          <AnimatedBackground weatherCondition={currentWeather?.condition} />
      </div>
      <PoweredByGemini />
      <NotificationCenter />
      <GlobalVoiceControl onCommand={executeCommand} />
      
      {shareContent && <CreatePostModal content={shareContent} onClose={() => setShareContent(null)} onShare={handleShareAndPost} userAccount={userAccount} />}


      <div className="relative w-full h-full flex flex-col items-center p-4 @container">
        <header className="w-full flex-shrink-0 z-10">
            <SystemOverviewWidget userAccount={userAccount} currentWeather={currentWeather} />
        </header>

        <section className="flex-grow grid grid-cols-1 @[60rem]:grid-cols-3 gap-8 w-full mt-8">
            <div className="@[60rem]:col-span-2">
                <DesktopAppsGrid onOpen={openWindow} apps={desktopApps} />
            </div>
             <div className="@[60rem]:col-span-1 flex flex-col gap-4 animate-slide-in-right overflow-y-auto">
                 <div className="glass-effect rounded-xl p-1 sm:p-2 flex flex-col gap-4">
                    {renderDashboardWidgets(settings.dashboardLayout)}
                </div>
            </div>
        </section>

        {isAppLauncherOpen && <AppLauncher onOpen={openWindow} onClose={() => setIsAppLauncherOpen(false)} allApps={allAppsForLauncher} />}

        <Suspense fallback={null}>
            {windows.map(window => (
               <Window
                  key={window.id}
                  id={window.id}
                  initialX={window.x}
                  initialY={window.y}
                  initialWidth={window.width}
                  initialHeight={window.height}
                  title={window.title}
                  zIndex={window.zIndex}
                  isMinimized={window.isMinimized}
                  isActive={window.id === activeWindowId}
                  windowStyle={settings.windowStyle}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onFocus={() => focusWindow(window.id)}
                >
                  <Suspense fallback={<AppLoadingSpinner />}>
                    {
                      (() => {
                          const AppComponent = appComponents[window.appId as keyof typeof appComponents];
                          if (!AppComponent) return null;
                          const props: any = window.appProps || {};

                          if (window.appId === 'settings') {
                              props.settings = settings;
                              props.onSettingsChange = handleSettingsChange;
                              props.resetSettings = resetSettings;
                              props.userAccount = userAccount;
                              props.onUserAccountChange = handleUserAccountChange;
                              props.paymentMethods = paymentMethods;
                              props.onAddPaymentMethod = handleAddPaymentMethod;
                              props.onSuccessfulReferral = handleSuccessfulReferral;
                              props.onBonusTask = handleBonusTask;
                              props.onUpgrade = handleUpgrade;
                              props.creditTransactions = creditTransactions; // Pass transaction history
                          } else if (window.appId === 'travelAgent') {
                              props.startTravelWorkflow = startTravelWorkflow;
                          } else if (window.appId === 'workflow') {
                              props.onComplete = handleWorkflowComplete;
                          } else if (window.appId === 'voice') {
                              props.onExecuteWorkflow = executeWorkflow;
                          } else if (window.appId === 'travelPlanViewer') {
                              props.onAddToCalendar = handleAddToCalendar;
                              props.onShare = setShareContent;
                          } else if (window.appId === 'smartwatch') {
                              props.alarms = alarms;
                              props.setAlarms = setAlarms;
                              props.automations = automations;
                              props.setAutomations = setAutomations;
                          } else if (['chat', 'audio', 'translateHub', 'liveConversation'].includes(window.appId)) {
                              props.speechSettings = { 
                                voice: settings.voice, 
                                rate: settings.speechRate,
                                pitch: settings.speechPitch,
                              };
                          } else if (window.appId === 'agentForge' || window.appId === 'avatarStudio') {
                              props.onAddAgent = addCustomAgent;
                              props.onClose = () => closeWindow(window.id);
                          } else if (window.appId === 'store') {
                              props.onAddAgent = addCustomAgent;
                              props.installedAgents = customAgents;
                              props.userAccount = userAccount;
                              props.onOpenApp = openWindow;
                          } else if (window.appId === 'agora') {
                              props.userAccount = userAccount;
                              props.customAgents = customAgents;
                              props.listings = agoraListings;
                              props.onList = handleListOnAgora;
                              props.onPurchase = handlePurchase;
                          } else if (window.appId === 'creatorStudio') {
                                props.projects = projects;
                                props.tasks = tasks;
                                props.onAddProject = (p: Project) => { setProjects(prev => [p, ...prev]); logAction('creatorStudio', { event: 'project_created', projectName: p.name }); };
                                props.onAddTask = (t: Task) => setTasks(prev => [t, ...prev]);
                                props.onShare = setShareContent;
                          } else if (window.appId === 'growthHub') {
                                props.userAccount = userAccount;
                                props.bounties = bounties;
                                props.completedBounties = completedBounties;
                                props.onCompleteBounty = handleCompleteBounty;
                          } else if (window.appId === 'veridianId') {
                                props.userAccount = userAccount;
                          } else if (window.appId === 'video') {
                                props.userAccount = userAccount;
                                props.setUserAccount = setUserAccount;
                          } else if (window.appId === 'nexusGo') {
                                props.onOpenApp = openWindow;
                                props.userAccount = userAccount;
                          } else if (window.appId === 'nexusFeed') {
                                props.userAccount = userAccount;
                                props.nexusPosts = nexusPosts;
                                props.onLikePost = handleLikePost;
                                props.onAddComment = handleAddComment;
                                props.onBoostPost = handleBoostPost;
                                props.onCreatePost = setShareContent; // Open CreatePostModal
                          } else if (window.appId === 'nexusProfile') {
                                props.userAccount = userAccount;
                                props.nexusPosts = nexusPosts.filter(p => p.osId === userAccount.osId); // Filter for user's posts
                                props.onOpenApp = openWindow;
                                props.creditTransactions = creditTransactions; // Pass transaction history
                          } else if (window.appId === 'travelServices') {
                                props.userAccount = userAccount;
                                props.onOpenApp = openWindow;
                          }
                          else if (window.appId === 'cognitiveCanvas') {
                                props.speechSettings = { 
                                    voice: settings.voice, 
                                    rate: settings.speechRate,
                                    pitch: settings.speechPitch,
                                };
                          }
                          
                          return <AppComponent {...props} onOpenApp={openWindow} />;
                      })()
                    }
                  </Suspense>
                </Window>
            ))}
        </Suspense>

        <Dock 
            openWindows={windows} 
            onOpen={openWindow} 
            onRestore={restoreWindow} 
            onFocus={focusWindow} 
            activeWindowId={activeWindowId}
            onToggleLauncher={() => setIsAppLauncherOpen(prev => !prev)}
            taskbarTheme={settings.taskbarTheme}
            frequentApps={getFrequentApps(3)}
         />
      </div>
    </main>
  );
};

export default App;