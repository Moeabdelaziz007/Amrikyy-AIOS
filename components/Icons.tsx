import React from 'react';

/**
 * A generic component to render Material Symbols.
 * @param {object} props - The component props.
 * @param {string} [props.className] - Optional CSS class names.
 * @param {string} props.children - The name of the Material Symbol icon.
 * @returns {JSX.Element} The Material Symbols icon.
 */
const MaterialIcon: React.FC<{ className?: string; children: string }> = ({ className, children }) => (
    <span className={`material-symbols-outlined ${className}`}>{children}</span>
);

/** Chat bubble icon. */
export const ChatIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>chat_bubble</MaterialIcon>);
/** Flight takeoff icon, used for travel. */
export const TripIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>flight_takeoff</MaterialIcon>);
/** Terminal icon. */
export const TerminalIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>terminal</MaterialIcon>);
/** Send icon. */
export const SendIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>send</MaterialIcon>);
/** Sparkles/stars icon, often used for AI-related features. */
export const SparklesIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>auto_awesome</MaterialIcon>);
/** Apps grid icon. */
export const GridIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>apps</MaterialIcon>);
/** Folder/file icon. */
export const FileIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>folder</MaterialIcon>);
/** Settings icon. */
export const SettingsIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>settings</MaterialIcon>);
/** Image/photo icon. */
export const ImageIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>image</MaterialIcon>);
/** Video/movie icon. */
export const VideoIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>movie</MaterialIcon>);
/** Search icon. */
export const SearchIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>search</MaterialIcon>);
/** Map icon. */
export const MapIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>map</MaterialIcon>);
/** Auto fix/magic wand icon, used for agent creation. */
export const AgentForgeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>auto_fix</MaterialIcon>);
/** Storefront icon. */
export const StoreIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>storefront</MaterialIcon>);
/** Psychology/brain icon, used for cognitive canvas. */
export const CognitiveCanvasIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>psychology_alt</MaterialIcon>);
/** Person celebrate icon, used for avatar studio. */
export const AvatarStudioIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>person_celebrate</MaterialIcon>);
/** Graphic equalizer icon, used for audio studio. */
export const AudioStudioIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>graphic_eq</MaterialIcon>);
/** Notifications icon. */
export const NotificationCenterIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>notifications</MaterialIcon>);
/** Lightbulb icon. */
export const LightbulbIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>lightbulb</MaterialIcon>);
/** Calendar month icon. */
export const CalendarIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>calendar_month</MaterialIcon>);
/** Database icon, used for drive. */
export const DriveIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>database</MaterialIcon>);
/** Sell/price tag icon. */
export const PricingIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>sell</MaterialIcon>);
/** Store icon, used for Agora marketplace. */
export const AgoraIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>store</MaterialIcon>);
/** Forum/chat icon, used for Nexus Chat/Feed. */
export const NexusChatIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>forum</MaterialIcon>);
/** Developer mode icon, used for dev console. */
export const DevConsoleIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>developer_mode</MaterialIcon>);
/** API icon. */
export const ApiIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>api</MaterialIcon>);
/** Code blocks icon, used for dev toolkit. */
export const DevToolkitIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>code_blocks</MaterialIcon>);
/** Group/referral icon. */
export const ReferralIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>group</MaterialIcon>);
/** Rocket launch icon, used for growth hub. */
export const GrowthHubIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>rocket_launch</MaterialIcon>);
/** Source environment icon, used for resource hub. */
export const ResourceHubIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>source_environment</MaterialIcon>);
/** Newspaper icon, used for news. */
export const NewsIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>newspaper</MaterialIcon>);
/** Partly cloudy day icon, used for weather. */
export const WeatherIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>partly_cloudy_day</MaterialIcon>);
/** Toggle on icon, used for control panel. */
export const ControlPanelIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>toggle_on</MaterialIcon>);
/** SSID chart icon, used for finance. */
export const FinanceIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>ssid_chart</MaterialIcon>);
/** Badge icon, used for Veridian ID. */
export const VeridianIdIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>badge</MaterialIcon>);
/** Translate icon, used for translate hub. */
export const TranslateIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>translate</MaterialIcon>);
/** Local taxi icon, used for Nexus Go. */
export const NexusGoIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>local_taxi</MaterialIcon>);
/** Account circle icon, used for Nexus Profile. */
export const NexusProfileIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>account_circle</MaterialIcon>);
/** Room service icon, used for Travel Services. */
export const TravelServicesIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>room_service</MaterialIcon>);
/** Heartbeat icon. */
export const HeartbeatIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>favorite</MaterialIcon>);
/** Memory/CPU icon. */
export const CpuIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>memory</MaterialIcon>);
/** Network check icon. */
export const NetworkIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>network_check</MaterialIcon>);
/** Hard drive icon, used for storage. */
export const StorageIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>hard_drive</MaterialIcon>);
/** Robot icon, used for bots. */
export const BotsIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>robot</MaterialIcon>);
/** Speed/load icon. */
export const LoadIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>speed</MaterialIcon>);
/** Hourglass empty icon, used for uptime. */
export const UpTimeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>hourglass_empty</MaterialIcon>);
/** Error icon. */
export const ErrorIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>error</MaterialIcon>);
/** Globe/language icon. */
export const GlobeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>language</MaterialIcon>);
/** Book icon for documentation. */
export const DocsIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>menu_book</MaterialIcon>);


// Agent Icons (using generic smart_toy for most)
/** Smart toy icon, used for Luna agent. */
export const LunaIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Karim agent. */
export const KarimIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Scout agent. */
export const ScoutIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Maya agent. */
export const MayaIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Jules agent. */
export const JulesIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Atlas agent. */
export const AtlasIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Cortex agent. */
export const CortexIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Orion agent. */
export const OrionIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);
/** Smart toy icon, used for Helios agent. */
export const HeliosIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>smart_toy</MaterialIcon>);

/** Account tree icon, used for workflow. */
export const WorkflowIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>account_tree</MaterialIcon>);
/** Flight icon. */
export const FlightsIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>flight</MaterialIcon>);
/** Play circle icon, used for YouTube. */
export const YouTubeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>play_circle</MaterialIcon>);
/** Volume up icon, used for speaker. */
export const SpeakerIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>volume_up</MaterialIcon>);
/** Microphone icon. */
export const MicrophoneIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>mic</MaterialIcon>);
/** Video search icon, used for video analysis. */
export const VideoAnalyzeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>video_search</MaterialIcon>);
/** Upload icon. */
export const UploadIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>upload</MaterialIcon>);
/** Settings voice icon, used for voice assistant. */
export const VoiceAssistantIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>settings_voice</MaterialIcon>);
/** Videocam icon, used for Veo. */
export const VeoIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>videocam</MaterialIcon>);
/** Palette icon, used for Nano Banana. */
export const NanoBananaIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>palette</MaterialIcon>);
/** Mail icon, used for Gmail. */
export const GmailIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>mail</MaterialIcon>);
/** Watch icon, used for Smart Watch. */
export const SmartWatchIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>watch</MaterialIcon>);
/** Group work icon, used for Workspace. */
export const WorkspaceIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>group_work</MaterialIcon>);
/** List alt icon, used for Event Log. */
export const EventLogIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>list_alt</MaterialIcon>);
/** Workspaces icon, used for Creator Studio. */
export const CreatorStudioIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>workspaces</MaterialIcon>);
/** Construction icon, used for Skill Forge. */
export const SkillForgeIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>construction</MaterialIcon>);
/** History toggle off icon, used for Chrono Vault. */
export const ChronoVaultIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>history_toggle_off</MaterialIcon>);
/** Public/globe icon, used for Cognito Browser. */
export const BrowserIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>public</MaterialIcon>);
/** Insights icon, used for Analytics Hub. */
export const AnalyticsHubIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>insights</MaterialIcon>);
/** Corporate fare icon, used for Marketing. */
export const MarketingIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>corporate_fare</MaterialIcon>);
/** Record voice over icon, used for Live Conversation. */
export const LiveConversationIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>record_voice_over</MaterialIcon>);
/** Image search icon, used for Image Analyzer. */
export const ImageAnalyzerIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>image_search</MaterialIcon>);
/** Check/checkmark icon. */
export const CheckIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>check</MaterialIcon>);
/** Close/X icon. */
export const CloseIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>close</MaterialIcon>);
/** Menu icon. */
export const MenuIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>menu</MaterialIcon>);
/** Trending up icon. */
export const TrendingUpIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>trending_up</MaterialIcon>);
/** Thumbs up icon. */
export const ThumbsUpIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>thumb_up</MaterialIcon>);
/** Thumbs down icon. */
export const ThumbsDownIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>thumb_down</MaterialIcon>);

/** Play icon. */
export const PlayIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>play_arrow</MaterialIcon>);

/** Stop icon. */
export const StopIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>stop</MaterialIcon>);

/** Trash icon. */
export const TrashIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>delete</MaterialIcon>);

/** Edit icon. */
export const EditIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>edit</MaterialIcon>);

/** Add/Plus icon. */
export const AddIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>add_circle</MaterialIcon>);

/** Sun icon. */
export const SunIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>wb_sunny</MaterialIcon>);

/** Users icon. */
export const UsersIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>group</MaterialIcon>);

/** Tag icon. */
export const TagIcon: React.FC<{className?: string}> = ({className}) => (<MaterialIcon className={className}>tag</MaterialIcon>);
