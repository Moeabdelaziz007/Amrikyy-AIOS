import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useGoogleAuth } from './contexts/GoogleAuthContext.tsx';
import { useNotification } from './contexts/NotificationContext.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx';
import { useUserBehavior } from './contexts/UserBehaviorContext.tsx';
import {
  CreatorStudioIcon,
  BrowserIcon,
  ChatIcon,
  TripIcon,
  WorkflowIcon,
  SkillForgeIcon,
  ChronoVaultIcon,
  WorkspaceIcon,
  SmartWatchIcon,
  EventLogIcon,
  ImageIcon,
  LunaIcon,
  FileIcon,
  SettingsIcon,
  TerminalIcon,
  VoiceAssistantIcon,
  MarketingIcon,
  AgentForgeIcon,
  JulesIcon,
  StoreIcon,
  LiveConversationIcon,
  ImageAnalyzerIcon,
  NotificationCenterIcon,
  AgoraIcon,
  NexusChatIcon,
  DevConsoleIcon,
  ApiIcon,
  DevToolkitIcon,
  GrowthHubIcon,
  ResourceHubIcon,
  NewsIcon,
  ControlPanelIcon,
  FinanceIcon,
  CognitiveCanvasIcon,
  VeridianIdIcon,
  TranslateIcon,
  NexusGoIcon,
  NexusProfileIcon,
  AvatarStudioIcon,
  TravelServicesIcon,
  DocsIcon,
  WeatherIcon,
  MapsIcon,
  VideoAnalyzerIcon,
  TranscriberIcon
} from './components/Icons.tsx';
import CreatePostModal from './components/SharePreview.tsx';
import { bounties as mockBounties } from './data/bounties.ts';
import LoadingScreen from './components/LoadingScreen.tsx';
import { initialNexusPosts as mockNexusPosts } from './data/nexus.ts';
import { TranslationKey } from './i18n.ts';
import HolographicAI from './components/HolographicAI.tsx';

// Lazy load all application components for code-splitting and performance
const Window = lazy(() => import('./components/Window.tsx'));
const ProactiveSuggestionsWidget = lazy(() => import('./components/widgets/ProactiveSuggestionsWidget.tsx'));
const WorkspaceHubWidget = lazy(() => import('./components/widgets/WorkspaceHubWidget.tsx'));
const NexusFeedWidget = lazy(() => import('./components/widgets/NexusFeedWidget.tsx'));
const QuickActionsWidget = lazy(() => import('./components/widgets/QuickActionsWidget.tsx'));
const GeminiAiNewsWidget = lazy(() => import('./components/widgets/GeminiAiNewsWidget.tsx'));
const WorkflowDashboardWidget = lazy(() => import('./components/widgets/WorkflowDashboardWidget.tsx'));

/**
 * A mapping of AppIDs to their corresponding lazy-loaded React components.
 * This enables code-splitting for application components.
 */
const appComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  [AppID.creatorPipeline]: lazy(() => import('./components/apps/CreatorPipelineApp.tsx')),
  [AppID.nexusPortal]: lazy(() => import('./components/hubs/NexusPortal.tsx')),
  [AppID.chat]: lazy(() => import('./components/apps/ChatApp.tsx')),
  [AppID.terminal]: lazy(() => import('./components/apps/TerminalApp.tsx')),
  [AppID.files]: lazy(() => import('./components/apps/FilesApp.tsx')),
  [AppID.settings]: lazy(() => import('./components/apps/SettingsApp.tsx')),
  [AppID.luna]: lazy(() => import('./components/apps/LunaApp.tsx')),
  [AppID.karim]: lazy(() => import('./components/apps/KarimApp.tsx')),
  [AppID.scout]: lazy(() => import('./components/apps/ScoutApp.tsx')),
  [AppID.maya]: lazy(() => import('./components/apps/MayaApp.tsx')),
  [AppID.jules]: lazy(() => import('./components/apps/JulesApp.tsx')),
  [AppID.voice]: lazy(() => import('./components/apps/VoiceAssistantApp.tsx')),
  [AppID.workflow]: lazy(() => import('./components/apps/WorkflowStudioApp.tsx')),
  [AppID.travelAgent]: lazy(() => import('./components/apps/TravelAgentApp.tsx')),
  [AppID.marketing]: lazy(() => import('./components/apps/MarketingApp.tsx')),
  [AppID.travelPlanViewer]: lazy(() => import('./components/apps/TravelPlanViewerApp.tsx')),
  [AppID.search]: lazy(() => import('./components/apps/SearchApp.tsx')),
  [AppID.maps]: lazy(() => import('./components/apps/MapsApp.tsx')),
  [AppID.transcriber]: lazy(() => import('./components/apps/TranscriberApp.tsx')),
  [AppID.videoAnalyzer]: lazy(() => import('./components/apps/VideoAnalyzerApp.tsx')),
  [AppID.image]: lazy(() => import('./components/apps/ImageGeneratorApp.tsx')),
  [AppID.audio]: lazy(() => import('./components/apps/AudioStudioApp.tsx')),
  [AppID.video]: lazy(() => import('./components/apps/VideoGeneratorApp.tsx')),
  [AppID.smartwatch]: lazy(() => import('./components/apps/SmartWatchApp.tsx')),
  [AppID.workspace]: lazy(() => import('./components/apps/WorkspaceApp.tsx')),
  [AppID.eventLog]: lazy(() => import('./components/apps/EventLogApp.tsx')),
  [AppID.skillForge]: lazy(() => import('./components/apps/SkillForgeApp.tsx')),
  [AppID.chronoVault]: lazy(() => import('./components/apps/ChronoVaultApp.tsx')),
  [AppID.creatorStudio]: lazy(() => import('./components/apps/CreatorStudioApp.tsx')),
  [AppID.cognitoBrowser]: lazy(() => import('./components/apps/CognitoBrowserApp.tsx')),
  [AppID.analyticsHub]: lazy(() => import('./components/apps/AnalyticsHubApp.tsx')),
  [AppID.agentForge]: lazy(() => import('./components/apps/AgentForgeApp.tsx')),
  [AppID.avatarStudio]: lazy(() => import('./components/apps/AvatarStudioApp.tsx')),
  [AppID.agentProfile]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.store]: lazy(() => import('./components/apps/StoreApp.tsx')),
  [AppID.notificationCenter]: lazy(() => import('./components/apps/NotificationCenterApp.tsx')),
  [AppID.liveConversation]: lazy(() => import('./components/apps/LiveConversationApp.tsx')),
  [AppID.imageAnalyzer]: lazy(() => import('./components/apps/ImageAnalyzerApp.tsx')),
  [AppID.agora]: lazy(() => import('./components/apps/AgoraApp.tsx')),
  [AppID.nexusChat]: lazy(() => import('./components/apps/NexusChatApp.tsx')),
  [AppID.devConsole]: lazy(() => import('./components/apps/DevConsoleApp.tsx')),
  [AppID.apiDocs]: lazy(() => import('./components/apps/ApiDocsApp.tsx')),
  [AppID.devToolkit]: lazy(() => import('./components/apps/DevToolkitApp.tsx')),
  [AppID.growthHub]: lazy(() => import('./components/apps/GrowthHubApp.tsx')),
  [AppID.resourceHub]: lazy(() => import('./components/apps/ResourceHubApp.tsx')),
  [AppID.geminiAiNews]: lazy(() => import('./components/apps/GeminiAiNewsApp.tsx')),
  [AppID.controlPanel]: lazy(() => import('./components/apps/ControlPanelApp.tsx')),
  [AppID.atlasFinance]: lazy(() => import('./components/apps/AtlasApp.tsx')),
  [AppID.cognitiveCanvas]: lazy(() => import('./components/apps/CognitiveCanvasApp.tsx')),
  [AppID.veridianId]: lazy(() => import('./components/apps/VeridianIdApp.tsx')),
  [AppID.translateHub]: lazy(() => import('./components/apps/TranslateHubApp.tsx')),
  [AppID.nexusGo]: lazy(() => import('./components/apps/NexusGoApp.tsx')),
  [AppID.nexusFeed]: lazy(() => import('./components/apps/NexusFeedApp.tsx')),
  [AppID.nexusProfile]: lazy(() => import('./components/apps/NexusProfileApp.tsx')),
  [AppID.travelServices]: lazy(() => import('./components/apps/TravelServicesApp.tsx')),
  [AppID.docsViewer]: lazy(() => import('./components/apps/DocsViewerApp.tsx')),
  // Existing agents (AgentProfileApp is a generic viewer for them)
  [AppID.atlas]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.cortex]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.orion]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.helios]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.leo]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.zara]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.rex]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.clio]: lazy(() => import('./components/apps/AgentProfileApp.tsx')),
  [AppID.pricing]: lazy(() => import('./components/apps/PricingApp.tsx')),
  [AppID.veo]: lazy(() => import('./components/apps/VeoApp.tsx')),
  [AppID.nanoBanana]: lazy(() => import('./components/apps/NanoBananaApp.tsx')),
  [AppID.agentFactory]: lazy(() => import('./components/apps/AgentFactoryApp.tsx')),
  [AppID.gmail]: lazy(() => import('./components/apps/GmailApp.tsx')),
  [AppID.weather]: lazy(() => import('./components/apps/WeatherApp.tsx')),
  [AppID.youtube]: lazy(() => import('./components/apps/YouTubeApp.tsx')),
  [AppID.tripPlanner]: lazy(() => import('./components/apps/TripPlannerApp.tsx')),
  [AppID.agentsDashboard]: lazy(() => import('./components/apps/AgentsDashboardApp.tsx')),
};

/**
 * Default settings for the operating system's appearance and behavior.
 */
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

/**
 * A simple loading spinner component to display while application components are lazy-loaded.
 * @returns {JSX.Element} The loading spinner.
 */
const AppLoadingSpinner: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

/**
 * The main application component representing the Amrikyy AI OS desktop.
 * Manages global state for windows, settings, user account, notifications, and app interactions.
 * @returns {JSX.Element} The rendered Amrikyy AI OS.
 */
const App: React.FC = () => {
  const [isOSLoaded, setIsOSLoaded] = useState(true);
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
  const [nexusPosts, setNexusPosts] = useState<NexusPost[]>(mockNexusPosts);
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition | null>(null);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);

  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: '1', time: '07:00', label: 'Good Morning!', enabled: true },
    { id: '2', time: '09:00', label: 'Team Standup', enabled: false },
  ]);
  const [automations, setAutomations] = useState<Automation[]>([
     { id: '1', trigger: 'Time is 08:00', action: { appId: AppID.chat, task: 'Open and say good morning' } }
  ]);
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] = useState(false);
  const [isLoadingCurrentWeather, setIsLoadingCurrentWeather] = useState(false);

  /**
   * Handles a credit transaction, updating the user's AI credits and transaction history.
   * @param {number} amount - The amount of credits for the transaction (can be negative for withdrawals).
   * @param {CreditTransactionType} type - The type of credit transaction.
   * @param {string} description - A description of the transaction.
   */
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

  /**
   * Handles a successful referral, granting bonus credits and updating user account.
   */
  const handleSuccessfulReferral = useCallback(() => {
    setUserAccount(prev => ({
        ...prev,
        referralsCount: (prev.referralsCount || 0) + 1,
        creditsEarnedFromReferrals: (prev.creditsEarnedFromReferrals || 0) + 500,
    }));
    handleCreditTransaction(500, 'bonus', 'Referral bonus');
    addNotification("Referral successful! 500 AI Credits added.", 'success');
  }, [addNotification, handleCreditTransaction]);
  
  /**
   * Awards bonus credits for completing a task.
   * @param {number} credits - The amount of bonus credits to award.
   */
  const handleBonusTask = useCallback((credits: number) => {
    handleCreditTransaction(credits, 'bonus', 'Task completion bonus');
    addNotification(`${credits} bonus AI Credits added!`, 'success');
  }, [addNotification, handleCreditTransaction]);

  /**
   * Adds a new payment method to the user's account.
   * @param {PaymentMethod} method - The payment method to add.
   */
  const handleAddPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
    addNotification(`Payment method ${method.type} added successfully.`, 'success');
  }, [addNotification]);

  /**
   * Adds a custom or community agent to the list of available agents.
   * Prevents adding duplicates.
   * @param {CustomAgent | CommunityAgent} agent - The agent to add.
   */
  const addCustomAgent = useCallback((agent: CustomAgent | CommunityAgent) => {
    setCustomAgents(prev => {
        if (prev.some(a => a.id === agent.id)) return prev;
        const newAgent = { ...agent, id: agent.id || `custom-${Date.now()}` };
        return [...prev, newAgent];
    });
    addNotification(t('notifications.agent_installed', { agentName: agent.name }), 'success');
  }, [addNotification, t]);

  /**
   * Handles the purchase of an item from the Agora Marketplace.
   * Deducts credits and installs the asset if successful.
   * @param {AgoraListing} listing - The listing to purchase.
   */
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

  /**
   * Lists an asset on the Agora Marketplace.
   * @param {Omit<AgoraListing, 'id' | 'author'>} listing - The listing details (excluding ID and author, which are generated).
   */
  const handleListOnAgora = useCallback((listing: Omit<AgoraListing, 'id' | 'author'>) => {
    const newListing: AgoraListing = {
        ...listing,
        id: `agora-${Date.now()}`,
        author: userAccount.name,
    };
    setAgoraListings(prev => [newListing, ...prev]);
    addNotification("Your asset has been listed on the Agora Marketplace!", 'success');
  }, [userAccount.name, addNotification]);
  
  /**
   * Marks a bounty as complete, awards credits and updates creator score.
   * @param {string} bountyId - The ID of the bounty to complete.
   */
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

  /**
   * Handles sharing content and posting it to the Nexus Feed.
   * @param {SharedContent} content - The content to be shared.
   * @param {SocialPost} socialPost - The social media post details.
   */
  const handleShareAndPost = (content: SharedContent, socialPost: SocialPost) => {
      const newPost: NexusPost = {
        id: `post-${Date.now()}`,
        author: userAccount.name,
        osId: userAccount.osId,
        content,
        socialPost,
        likes: 0,
        views: 0,
        comments: [],
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
  
   /**
    * Simulates Nexus feed activity (likes/views) to make the feed dynamic.
    * This effect runs every 5 seconds.
    */
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
                        }
                        
                        return { ...post, likes: newLikes, views: post.views + Math.floor(Math.random() * 200) };
                    }
                    return post;
                });
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [addNotification, completedBounties, handleCompleteBounty, handleCreditTransaction]);

  /**
   * Fetches Google Workspace data (Calendar events, Drive files, Gmail messages)
   * when the user signs in. Clears data on sign-out.
   * Displays loading state while fetching and sends notifications on errors.
   */
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setIsLoadingWorkspaceData(true);
      if (isSignedIn) {
        try {
          const [events, files, messages] = await Promise.all([
            getCalendarEvents(),
            getDriveFiles(),
            getGmailMessages(),
          ]);
          setCalendarEvents(events);
          setDriveFiles(files);
          setGmailMessages(messages);
        } catch (error: any) {
          addNotification(error.message || "Failed to sync Google Workspace.", 'error', 'System');
        }
      } else {
        setCalendarEvents([]);
        setDriveFiles([]);
        setGmailMessages([]);
      }
      setIsLoadingWorkspaceData(false);
    };
    fetchWorkspaceData();
  }, [isSignedIn, addNotification]);
  
  /**
   * Fetches ambient weather data using geolocation and updates it periodically.
   * Displays loading state while fetching and handles geolocation errors gracefully.
   */
  useEffect(() => {
    const fetchWeather = () => {
      setIsLoadingCurrentWeather(true);
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
          setIsLoadingCurrentWeather(false);
        },
        (error) => {
          console.error('Geolocation failed:', error);
          addNotification(`Could not get location: ${error.message}. Please check your browser's location permissions.`, 'error', 'System');
          // Provide default/fallback weather data on error
          setCurrentWeather({
            location: 'Unknown',
            temp: 20,
            condition: 'Clear',
            icon: 'sunny',
            high: 25,
            low: 15,
          });
          setIsLoadingCurrentWeather(false);
        }
      );
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, [addNotification]);

  /**
   * Populates `nexusProfile` related state with mock data if it exists and is not already set.
   * This ensures basic user account information is available for display purposes.
   */
  useEffect(() => {
    setUserAccount(prev => {
        if (!prev.osId) {
            return {
                ...prev,
                osId: 'AMRIYY-OS-USER-7890',
                name: 'User',
                avatar: '👩‍🚀',
                joinDate: new Date().toISOString().split('T')[0],
                trustScore: 75,
                // Other defaults if needed
            };
        }
        return prev;
    });
  }, []);

  /**
   * Memoized object containing localized titles for all applications.
   */
  const appTitles: Record<string, string> = useMemo(() => ({
    [AppID.chat]: t('app_titles.chat'),
    [AppID.terminal]: t('app_titles.terminal'),
    [AppID.files]: t('app_titles.files'),
    [AppID.settings]: t('app_titles.settings'),
    [AppID.luna]: t('app_titles.luna'),
    [AppID.karim]: t('app_titles.karim'),
    [AppID.scout]: t('app_titles.scout'),
    [AppID.maya]: t('app_titles.maya'),
    [AppID.jules]: t('app_titles.jules'),
    [AppID.voice]: t('app_titles.voice'),
    [AppID.workflow]: t('app_titles.workflow'),
    [AppID.travelAgent]: t('app_titles.travelAgent'),
    [AppID.marketing]: t('app_titles.marketing'),
    [AppID.travelPlanViewer]: t('app_titles.travelPlanViewer'),
    [AppID.search]: t('app_titles.search'),
    [AppID.maps]: t('app_titles.maps'),
    [AppID.transcriber]: t('app_titles.transcriber'),
    [AppID.videoAnalyzer]: t('app_titles.videoAnalyzer'),
    [AppID.image]: t('app_titles.image'),
    [AppID.audio]: t('app_titles.audio'),
    [AppID.video]: t('app_titles.video'),
    [AppID.smartwatch]: t('app_titles.smartwatch'),
    [AppID.workspace]: t('app_titles.workspace'),
    [AppID.eventLog]: t('app_titles.eventLog'),
    [AppID.skillForge]: t('app_titles.skillForge'),
    [AppID.chronoVault]: t('app_titles.chronoVault'),
    [AppID.creatorStudio]: t('app_titles.creatorStudio'),
    [AppID.cognitoBrowser]: t('app_titles.cognitoBrowser'),
    [AppID.analyticsHub]: t('app_titles.analyticsHub'),
    [AppID.agentForge]: t('app_titles.agentForge'),
    [AppID.avatarStudio]: t('app_titles.avatarStudio'),
    [AppID.agentProfile]: t('app_titles.agentProfile'),
    [AppID.store]: t('app_titles.store'),
    [AppID.notificationCenter]: t('app_titles.notificationCenter'),
    [AppID.liveConversation]: t('app_titles.liveConversation'),
    [AppID.imageAnalyzer]: t('app_titles.imageAnalyzer'),
    [AppID.agora]: t('app_titles.agora'),
    [AppID.nexusChat]: t('app_titles.nexusChat'),
    [AppID.devConsole]: t('app_titles.devConsole'),
    [AppID.apiDocs]: t('app_titles.apiDocs'),
    [AppID.devToolkit]: t('app_titles.devToolkit'),
    [AppID.growthHub]: t('app_titles.growthHub'),
    [AppID.resourceHub]: t('app_titles.resourceHub'),
    [AppID.geminiAiNews]: t('app_titles.geminiAiNews'),
    [AppID.controlPanel]: t('app_titles.controlPanel'),
    [AppID.atlasFinance]: t('app_titles.atlasFinance'),
    [AppID.cognitiveCanvas]: t('app_titles.cognitiveCanvas'),
    [AppID.veridianId]: t('app_titles.veridianId'),
    [AppID.translateHub]: t('app_titles.translateHub'),
    [AppID.nexusGo]: t('app_titles.nexusGo'),
    [AppID.nexusFeed]: t('app_titles.nexusFeed'),
    [AppID.nexusProfile]: t('app_titles.nexusProfile'),
    [AppID.travelServices]: t('app_titles.travelServices'),
    [AppID.pricing]: t('app_titles.pricing'),
    [AppID.docsViewer]: t('app_titles.docsViewer' as TranslationKey),
    // Agent aliases pointing to AgentProfileApp
    [AppID.atlas]: t('app_titles.atlas' as TranslationKey),
    [AppID.cortex]: t('app_titles.cortex' as TranslationKey),
    [AppID.orion]: t('app_titles.orion' as TranslationKey),
    [AppID.helios]: t('app_titles.helios' as TranslationKey),
    [AppID.leo]: t('app_titles.leo' as TranslationKey),
    [AppID.zara]: t('app_titles.zara' as TranslationKey),
    [AppID.rex]: t('app_titles.rex' as TranslationKey),
    [AppID.clio]: t('app_titles.clio' as TranslationKey),
  }), [t]);

  /**
   * Updates the global settings and applies theme/language changes to the document.
   */
  useEffect(() => {
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${settings.theme}`);
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    setLanguage(settings.language);
  }, [settings.theme, settings.accentColor, settings.language, setLanguage]);

  /**
   * Callback function to update specific settings.
   * @param {Partial<Settings>} newSettings - The partial new settings to merge.
   */
  const handleSettingsChange = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  /**
   * Callback function to update user account details.
   * @param {Partial<UserAccount>} newAccount - The partial new user account details to merge.
   */
  const handleUserAccountChange = useCallback((newAccount: Partial<UserAccount>) => {
    setUserAccount(prev => ({...prev, ...newAccount}));
  }, []);

  /**
   * Resets all settings to their default values.
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);
  
  /**
   * Handles the logic for upgrading the user's plan.
   */
  const handleUpgrade = useCallback(() => {
    handleCreditTransaction(4000, 'deposit', 'Pro plan upgrade'); // Assuming 1000 initial, +4000 for Pro
    addNotification(t('notifications.upgraded_to_pro'), 'success');
  }, [addNotification, t, handleCreditTransaction]);

  /**
   * Opens a new application window or focuses an existing one.
   * @param {AppID} appId - The ID of the application to open.
   * @param {any} [appProps={}] - Optional props to pass to the application component.
   */
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

      const windowAppId = customAgent ? AppID.agentProfile : appId;

      // Determine window size based on screen size for responsiveness
      const isSmallScreen = window.innerWidth < 768;
      const defaultWidth = isSmallScreen ? window.innerWidth * 0.95 : 800;
      const defaultHeight = isSmallScreen ? window.innerHeight * 0.95 : 600;

      const appSpecificWidth = [AppID.agentProfile, AppID.luna, AppID.karim, AppID.scout, AppID.maya, AppID.jules, AppID.liveConversation, AppID.veridianId, AppID.nexusProfile].includes(windowAppId) ? (isSmallScreen ? window.innerWidth * 0.9 : 500) : defaultWidth;
      const appSpecificHeight = [AppID.agentProfile, AppID.luna, AppID.karim, AppID.jules, AppID.maya, AppID.scout, AppID.liveConversation, AppID.veridianId, AppID.nexusProfile].includes(windowAppId) ? (isSmallScreen ? window.innerHeight * 0.9 : 700) : defaultHeight;

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

  /**
   * Executes a command string, typically from a terminal or voice input.
   * @param {string} command - The command string (e.g., "open chat").
   */
  const executeCommand = useCallback((command: string) => {
    const [action, target] = command.split(' ');
    if (action === 'open' && target) {
      const appId = target.toLowerCase() as AppID;
      if(Object.values(AppID).includes(appId)) { // Ensure target is a valid AppID
        openWindow(appId);
      }
    } else if(action === 'close' && target === 'all') {
      setWindows([]);
    }
  }, [openWindow]);

  /**
   * Callback for when a workflow completes, potentially opening a new app with the result.
   * @param {any} result - The result of the completed workflow.
   */
  const handleWorkflowComplete = useCallback((result: any) => {
    if (result && 'destination' in result) { // Check if it's a TravelPlan
        openWindow(AppID.travelPlanViewer, { plan: result });
    }
  }, [openWindow]);

  /**
   * Initiates the execution of a workflow by opening the Workflow Studio app.
   * @param {Workflow} workflow - The workflow to execute.
   * @param {any} [details] - Additional details for the executing workflow.
   */
  const executeWorkflow = useCallback((workflow: Workflow, details?: any) => {
      openWindow(AppID.workflow, { workflow, isExecuting: true, executingDetails: details });
  }, [openWindow]);

  /**
   * Starts a travel planning workflow with provided details.
   * @param {object} details - The travel plan details.
   * @param {string} details.destination - The travel destination.
   * @param {string} details.startDate - The start date of the trip.
   * @param {string} details.endDate - The end date of the trip.
   * @param {string} details.budget - The budget for the trip.
   */
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

  /**
   * Handles adding a generated travel plan to the calendar.
   * @param {TravelPlan} plan - The travel plan to add.
   */
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
  
  /**
   * Closes a specific window.
   * @param {number} id - The ID of the window to close.
   */
  const closeWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  /**
   * Minimizes a specific window.
   * @param {number} id - The ID of the window to minimize.
   */
  const minimizeWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  /**
   * Restores a minimized window.
   * @param {number} id - The ID of the window to restore.
   */
  const restoreWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };

  /**
   * Brings a window to the front by updating its z-index.
   * @param {number} id - The ID of the window to focus.
   */
  const focusWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };
  
  /** The ID of the currently active (focused) window. */
  const activeWindowId = useMemo(() => {
    return windows.length > 0 ? windows.filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id : null;
  }, [windows]);
  
  /**
   * Memoized list of applications displayed on the desktop grid.
   */
  const desktopApps = useMemo(() => [
    { id: AppID.creatorPipeline, name: 'Creator Pipeline', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🎬</span> },
    { id: AppID.agentFactory, name: 'Agent Factory', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🤖</span> },
    { id: AppID.nexusPortal, name: 'Nexus Portal', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🜚</span> },
    { id: AppID.creatorStudio, name: t('desktop_apps.creatorStudio'), icon: CreatorStudioIcon },
    { id: AppID.cognitoBrowser, name: t('desktop_apps.cognitoBrowser'), icon: BrowserIcon },
    { id: AppID.travelAgent, name: t('desktop_apps.travelAgent'), icon: TripIcon },
    { id: AppID.travelServices, name: t('app_titles.travelServices'), icon: TravelServicesIcon },
    { id: AppID.workflow, name: t('desktop_apps.workflow'), icon: WorkflowIcon },
    { id: AppID.atlasFinance, name: t('app_titles.atlasFinance'), icon: FinanceIcon },
    { id: AppID.cognitiveCanvas, name: t('app_titles.cognitiveCanvas'), icon: CognitiveCanvasIcon },
    { id: AppID.geminiAiNews, name: t('app_titles.geminiAiNews'), icon: NewsIcon },
    { id: AppID.veridianId, name: t('app_titles.veridianId'), icon: VeridianIdIcon },
    { id: AppID.nexusProfile, name: t('app_titles.nexusProfile'), icon: NexusProfileIcon },
    { id: AppID.nexusGo, name: t('app_titles.nexusGo'), icon: NexusGoIcon },
    { id: AppID.translateHub, name: t('app_titles.translateHub'), icon: TranslateIcon },
    { id: AppID.controlPanel, name: t('app_titles.controlPanel'), icon: ControlPanelIcon },
    { id: AppID.agentForge, name: t('desktop_apps.agentForge'), icon: AgentForgeIcon },
    { id: AppID.docsViewer, name: t('desktop_apps.docsViewer' as TranslationKey), icon: DocsIcon },
    ...customAgents.map(agent => ({
        id: agent.id as AppID,
        name: agent.name,
        icon: agent.avatarVisual ? ({ className }: {className?: string}) => <img src={`/avatars/${agent.avatarVisual}.png`} alt={agent.name} className={`w-full h-full object-cover ${className ?? ''}`} /> : ({ className }: {className?: string}) => <span className={`text-4xl ${className ?? ''}`}>{agent.icon}</span>
    }))
  ], [customAgents, t]);

  /**
   * Memoized list of all applications available in the app launcher.
   */
  const allAppsForLauncher = useMemo(() => [
    { id: AppID.creatorPipeline, name: 'Creator Pipeline', description: 'Automated content pipeline (NanoBanana, Veo, Music -> YouTube)', category: 'creative', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🎬</span> },
    { id: AppID.agentFactory, name: 'Agent Factory', description: 'Create sub-agents for Creator and Travel workflows', category: 'developer', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🤖</span> },
    { id: AppID.nexusPortal, name: 'Nexus Portal', description: 'Unified launchpad for all Komabi Hubs', category: 'portal', icon: ({className}:{className?:string}) => <span className={`text-2xl ${className||''}`}>🜚</span> },

    // AI & Communication
    { id: AppID.chat, name: t('app_launcher.chat'), description: 'Chat with AI assistant for questions and tasks', category: 'ai', icon: ChatIcon },
    { id: AppID.voice, name: t('app_launcher.voice'), description: 'Voice-powered AI assistant', category: 'ai', icon: VoiceAssistantIcon },
    { id: AppID.nexusChat, name: t('app_titles.nexusChat'), description: 'Real-time collaborative chat', category: 'communication', icon: NexusChatIcon },
    { id: AppID.liveConversation, name: t('app_launcher.liveConversation'), description: 'Live AI conversation sessions', category: 'ai', icon: LiveConversationIcon },

    // Travel & Lifestyle
    { id: AppID.travelAgent, name: t('app_launcher.travelAgent'), description: 'AI-powered travel planning and booking', category: 'travel', icon: TripIcon },
    { id: AppID.travelServices, name: t('app_titles.travelServices'), description: 'Travel services and utilities', category: 'travel', icon: TravelServicesIcon },
    { id: AppID.maps, name: t('app_titles.maps'), description: 'Interactive maps and navigation', category: 'travel', icon: MapsIcon },
    { id: AppID.weather, name: t('app_titles.weather'), description: 'Weather forecasts and alerts', category: 'lifestyle', icon: WeatherIcon },

    // Productivity & Work
    { id: AppID.workspace, name: t('app_launcher.workspace'), description: 'Collaborative workspace for teams', category: 'productivity', icon: WorkspaceIcon },
    { id: AppID.workflow, name: t('app_launcher.workflow'), description: 'Automate and manage workflows', category: 'productivity', icon: WorkflowIcon },
    { id: AppID.files, name: t('app_launcher.files'), description: 'File management and storage', category: 'productivity', icon: FileIcon },
    { id: AppID.docsViewer, name: t('app_launcher.docsViewer' as TranslationKey), description: 'View and edit documents', category: 'productivity', icon: DocsIcon },

    // Creative & Media
    { id: AppID.creatorStudio, name: t('app_launcher.creatorStudio'), description: 'Content creation and editing suite', category: 'creative', icon: CreatorStudioIcon },
    { id: AppID.image, name: t('app_titles.image'), description: 'Generate and edit images with AI', category: 'creative', icon: ImageGeneratorIcon },
    { id: AppID.video, name: t('app_titles.video'), description: 'Create videos with AI assistance', category: 'creative', icon: VideoGeneratorIcon },
    { id: AppID.audio, name: t('app_titles.audio'), description: 'Audio production and music creation', category: 'creative', icon: AudioStudioIcon },
    { id: AppID.avatarStudio, name: t('app_launcher.avatarStudio'), description: 'Create and customize avatars', category: 'creative', icon: AvatarStudioIcon },

    // Business & Finance
    { id: AppID.marketing, name: t('app_launcher.marketing'), description: 'Marketing tools and analytics', category: 'business', icon: MarketingIcon },
    { id: AppID.atlasFinance, name: t('app_launcher.atlasFinance'), description: 'Financial planning and analysis', category: 'business', icon: FinanceIcon },
    { id: AppID.growthHub, name: t('app_launcher.growthHub'), description: 'Business growth and analytics', category: 'business', icon: GrowthHubIcon },
    { id: AppID.store, name: t('app_launcher.store'), description: 'Browse and purchase AI tools', category: 'business', icon: StoreIcon },

    // Development & Tools
    { id: AppID.devToolkit, name: t('app_launcher.devToolkit'), description: 'Developer tools and utilities', category: 'development', icon: DevToolkitIcon },
    { id: AppID.terminal, name: t('app_launcher.terminal'), description: 'Command line interface', category: 'development', icon: TerminalIcon },
    { id: AppID.devConsole, name: t('app_titles.devConsole'), description: 'Developer console and debugging', category: 'development', icon: DevConsoleIcon },
    { id: AppID.apiDocs, name: t('app_titles.apiDocs'), description: 'API documentation and reference', category: 'development', icon: ApiDocsIcon },

    // Analysis & Intelligence
    { id: AppID.analyticsHub, name: t('app_launcher.analyticsHub'), description: 'Data analytics and insights', category: 'analytics', icon: AnalyticsHubIcon },
    { id: AppID.cognitiveCanvas, name: t('app_launcher.cognitiveCanvas'), description: 'AI-powered data visualization', category: 'analytics', icon: CognitiveCanvasIcon },
    { id: AppID.imageAnalyzer, name: t('app_launcher.imageAnalyzer'), description: 'Analyze images with AI vision', category: 'analytics', icon: ImageAnalyzerIcon },
    { id: AppID.videoAnalyzer, name: t('app_titles.videoAnalyzer'), description: 'Analyze videos with AI', category: 'analytics', icon: VideoAnalyzerIcon },

    // Agents & AI
    { id: AppID.agentForge, name: t('app_launcher.agentForge'), description: 'Create and customize AI agents', category: 'ai', icon: AgentForgeIcon },
    { id: AppID.skillForge, name: t('app_launcher.skillForge'), description: 'Train and manage AI skills', category: 'ai', icon: SkillForgeIcon },
    { id: AppID.chronoVault, name: t('app_launcher.chronoVault'), description: 'AI memory and knowledge base', category: 'ai', icon: ChronoVaultIcon },

    // Social & Community
    { id: AppID.nexusFeed, name: t('app_titles.nexusFeed'), description: 'Social feed and community updates', category: 'social', icon: NexusChatIcon },
    { id: AppID.nexusProfile, name: t('app_titles.nexusProfile'), description: 'Manage your social profile', category: 'social', icon: NexusProfileIcon },
    { id: AppID.nexusGo, name: t('app_titles.nexusGo'), description: 'Social networking and connections', category: 'social', icon: NexusGoIcon },

    // Utilities & System
    { id: AppID.cognitoBrowser, name: t('app_launcher.cognitoBrowser'), description: 'AI-enhanced web browser', category: 'utilities', icon: BrowserIcon },
    { id: AppID.smartwatch, name: t('app_launcher.smartwatch'), description: 'Smart watch companion app', category: 'utilities', icon: SmartWatchIcon },
    { id: AppID.notificationCenter, name: t('app_launcher.notificationCenter'), description: 'Manage notifications and alerts', category: 'utilities', icon: NotificationCenterIcon },
    { id: AppID.eventLog, name: t('app_launcher.eventLog'), description: 'System event logs and monitoring', category: 'utilities', icon: EventLogIcon },
    { id: AppID.controlPanel, name: t('app_launcher.controlPanel'), description: 'System control and settings', category: 'utilities', icon: ControlPanelIcon },
    { id: AppID.settings, name: t('app_launcher.settings'), description: 'Application and system settings', category: 'utilities', icon: SettingsIcon },

    // Translation & Language
    { id: AppID.translateHub, name: t('app_titles.translateHub'), description: 'Translate text and documents', category: 'language', icon: TranslateIcon },
    { id: AppID.transcriber, name: t('app_titles.transcriber'), description: 'Convert speech to text', category: 'language', icon: TranscriberIcon },

    // News & Information
    { id: AppID.geminiAiNews, name: t('app_launcher.geminiAiNews'), description: 'Latest AI news and updates', category: 'news', icon: NewsIcon },
    { id: AppID.resourceHub, name: t('app_launcher.resourceHub'), description: 'Educational resources and guides', category: 'news', icon: ResourceHubIcon },

    // Identity & Security
    { id: AppID.veridianId, name: t('app_titles.veridianId'), description: 'Digital identity management', category: 'security', icon: VeridianIdIcon },

    // Agents (custom)
    ...customAgents.map(agent => ({
        id: agent.id as AppID,
        name: agent.name,
        description: `${agent.role} - Custom AI agent`,
        category: 'agents',
        icon: ({ className }: { className?: string }) => <span className={`text-2xl ${className ?? ''}`}>{agent.icon}</span>
    }))
  ], [customAgents, t]);

  /**
   * Handles liking a Nexus post.
   * @param {string} postId - The ID of the post to like.
   */
  const handleLikePost = useCallback((postId: string) => {
    setNexusPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  }, []);

  /**
   * Adds a new comment to a Nexus post.
   * @param {string} postId - The ID of the post to comment on.
   * @param {NexusComment} comment - The comment object to add.
   */
  const handleAddComment = useCallback((postId: string, comment: NexusComment) => {
    setNexusPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
    ));
  }, []);

  /**
   * Boosts a Nexus post, deducting credits and simulating increased views.
   * @param {string} postId - The ID of the post to boost.
   * @param {number} cost - The credit cost to boost the post.
   * @returns {boolean} True if the boost was successful, false otherwise (e.g., insufficient credits).
   */
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

  /**
   * Renders the appropriate dashboard widgets based on the selected layout.
   * @param {DashboardLayout} layout - The current dashboard layout.
   * @returns {JSX.Element} The set of dashboard widgets.
   */
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
            <Suspense fallback={null}><WorkflowDashboardWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><CryptoDashboardWidget /></Suspense>
          </>
        );
      case 'default':
      default:
        return (
          <>
            <Suspense fallback={null}><QuickActionsWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><GeminiAiNewsWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><WorkflowDashboardWidget onOpenApp={openWindow} /></Suspense>
            <Suspense fallback={null}><NexusFeedWidget posts={nexusPosts} /></Suspense>
            <Suspense fallback={null}><CryptoDashboardWidget /></Suspense>
          </>
        );
    }
  }

  if (!isOSLoaded) {
    return <LoadingScreen userAccountName={userAccount.name} />;
  }

  return (
    <AuthProvider>
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

                          if (window.appId === AppID.settings) {
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
                              props.creditTransactions = creditTransactions;
                          } else if (window.appId === AppID.travelAgent) {
                              props.startTravelWorkflow = startTravelWorkflow;
                          } else if (window.appId === AppID.workflow) {
                              props.onComplete = handleWorkflowComplete;
                          } else if (window.appId === AppID.voice) {
                              props.onExecuteWorkflow = executeWorkflow;
                          } else if (window.appId === AppID.travelPlanViewer) {
                              props.onAddToCalendar = handleAddToCalendar;
                              props.onShare = setShareContent;
                          } else if (window.appId === AppID.smartwatch) {
                              props.alarms = alarms;
                              props.setAlarms = setAlarms;
                              props.automations = automations;
                              props.setAutomations = setAutomations;
                          } else if ([AppID.chat, AppID.audio, AppID.translateHub, AppID.liveConversation].includes(window.appId)) {
                              props.speechSettings = { 
                                voice: settings.voice, 
                                rate: settings.speechRate,
                                pitch: settings.speechPitch,
                              };
                          } else if (window.appId === AppID.agentForge || window.appId === AppID.avatarStudio) {
                              props.onAddAgent = addCustomAgent;
                              props.onClose = () => closeWindow(window.id);
                          } else if (window.appId === AppID.agentFactory) {
                              props.onAddAgent = addCustomAgent;
                              props.onOpenApp = (appId: any, p?: any) => openWindow(appId, p);
                          } else if (window.appId === AppID.store) {
                              props.onAddAgent = addCustomAgent;
                              props.installedAgents = customAgents;
                              props.userAccount = userAccount;
                              props.onOpenApp = openWindow;
                          } else if (window.appId === AppID.agora) {
                              props.userAccount = userAccount;
                              props.customAgents = customAgents;
                              props.listings = agoraListings;
                              props.onList = handleListOnAgora;
                              props.onPurchase = handlePurchase;
                          } else if (window.appId === AppID.creatorStudio) {
                                props.projects = projects;
                                props.tasks = tasks;
                                props.setTasks = setTasks;
                                props.onAddProject = (p: Project) => { setProjects(prev => [p, ...prev]); logAction(AppID.creatorStudio, { event: 'project_created', projectName: p.name }); };
                                props.onAddTask = (t: Task) => setTasks(prev => [t, ...prev]);
                                props.onShare = setShareContent;
                                props.onOpenApp = openWindow;
                          } else if (window.appId === AppID.growthHub) {
                                props.userAccount = userAccount;
                                props.bounties = bounties;
                                props.completedBounties = completedBounties;
                                props.onCompleteBounty = handleCompleteBounty;
                          } else if (window.appId === AppID.veridianId) {
                                props.userAccount = userAccount;
                          } else if (window.appId === AppID.video) {
                                props.userAccount = userAccount;
                                props.setUserAccount = setUserAccount;
                          } else if (window.appId === AppID.nexusGo) {
                                props.onOpenApp = openWindow;
                                props.userAccount = userAccount;
                          } else if (window.appId === AppID.nexusFeed) {
                                props.userAccount = userAccount;
                                props.nexusPosts = nexusPosts;
                                props.onLikePost = handleLikePost;
                                props.onAddComment = handleAddComment;
                                props.onBoostPost = handleBoostPost;
                                props.onCreatePost = setShareContent;
                          } else if (window.appId === AppID.nexusProfile) {
                                props.userAccount = userAccount;
                                props.nexusPosts = nexusPosts.filter(p => p.osId === userAccount.osId);
                                props.onOpenApp = openWindow;
                                props.creditTransactions = creditTransactions;
                          } else if (window.appId === AppID.travelServices) {
                                props.userAccount = userAccount;
                                props.onOpenApp = openWindow;
                          }
                          else if (window.appId === AppID.cognitiveCanvas) {
                                props.speechSettings = { 
                                    voice: settings.voice, 
                                    rate: settings.speechRate,
                                    pitch: settings.speechPitch,
                                };
                          } else if (window.appId === AppID.cognitoBrowser) {
                                props.onOpenApp = openWindow;
                          }
                          
                          return <AppComponent {...props} />;
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

         {/* Always-on Holographic AI assistant */}
         <HolographicAI />
      </div>
    </main>
    </AuthProvider>
  );
};

export default App;

