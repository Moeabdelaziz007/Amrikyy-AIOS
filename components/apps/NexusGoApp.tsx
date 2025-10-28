import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NexusGoIcon, SparklesIcon, SendIcon } from '../Icons';
import { findDeliveryOptions, getRideOptions } from '../../services/geminiAdvancedService';
import { DeliveryOption, RideOption, FastFoodRestaurant } from '../../types';

/**
 * Defines the available tabs within the NexusGo application.
 */
type Tab = 'delivery' | 'rides';

/**
 * Props for the NexusGoApp component.
 */
interface NexusGoAppProps {
    /**
     * Callback function to open an application by its ID.
     * @param {string} appId - The ID of the application to open.
     */
    onOpenApp: (appId: string) => void;
}

/**
 * The NexusGoApp component provides AI-powered services for local needs,
 * specifically for food delivery and ride-sharing options.
 * It uses geolocation and integrates with AI services to provide recommendations.
 * @param {NexusGoAppProps} props - The component props.
 * @returns {JSX.Element} The NexusGoApp component.
 */
export const NexusGoApp: React.FC<NexusGoAppProps> = ({ onOpenApp }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('delivery');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <NexusGoIcon className="w-8 h-8 text-lime-400"/>
                    <h1 className="font-display text-2xl font-bold">{t('nexus_go.title')}</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="delivery" activeTab={activeTab} setActiveTab={setActiveTab} label={t('nexus_go.delivery_tab')} />
                    <TabButton id="rides" activeTab={activeTab} setActiveTab={setActiveTab} label={t('nexus_go.rides_tab')} />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'delivery' && <DeliveryView />}
                {activeTab === 'rides' && <RidesView />}
            </main>
        </div>
    );
};

/**
 * Reusable button component for switching between tabs.
 * @param {object} props - The component props.
 * @param {Tab} props.id - The unique ID of the tab.
 * @param {Tab} props.activeTab - The currently active tab.
 * @param {(tab: Tab) => void} props.setActiveTab - Callback to set the active tab.
 * @param {string} props.label - The display label for the tab button.
 * @returns {JSX.Element} The tab button component.
 */
const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

/**
 * Defines the state structure for geolocation coordinates.
 */
interface GeolocationState {
    latitude: number;
    longitude: number;
}

/**
 * Custom hook to fetch and manage the user's current geolocation.
 * It requests geolocation permission and updates the `location` and `error` states accordingly.
 * @returns {object} An object containing:
 *   - `location`: `GeolocationState | null` - The current geographical coordinates, or null if not available.
 *   - `error`: `string | null` - An error message if geolocation fails, or null otherwise.
 */
const useGeolocation = () => {
    const { t } = useLanguage();
    const [location, setLocation] = useState<GeolocationState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setError(null);
            },
            (err) => {
                setError(t('nexus_go.error_location'));
                setLocation(null);
                console.error("Geolocation error:", err);
            }
        );
    }, [t]);

    return { location, error };
};

/**
 * The DeliveryView component provides an interface for finding food delivery options.
 * It uses geolocation and an AI service to recommend fast food restaurants.
 * @returns {JSX.Element} The DeliveryView component.
 */
const DeliveryView: React.FC = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const [results, setResults] = useState<{aiSummary: string, options: FastFoodRestaurant[] } | null>(null);
    const [error, setError] = useState<string | null>(null); // Local error state for API calls

    /**
     * Handles initiating the search for food delivery options.
     */
    const handleFindOptions = async () => {
        if (!query || isLoading || !location) return;
        setIsLoading(true);
        setResults(null);
        setError(null); // Clear previous API-specific errors

        try {
            const data = await findDeliveryOptions(query, location);
            setResults(data);
        } catch (e: any) {
            setError(e.message || "Failed to find delivery options.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6 h-full">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <NexusGoIcon className="w-16 h-16 mx-auto mb-2 text-lime-400" />
                    <h2 className="text-xl font-bold font-display">Fast Food Delivery</h2>
                    <p className="text-text-muted">{t('nexus_go.current_location')}</p>
                    {(locationError || error) && <p className="text-sm text-red-400 mt-2" role="alert">{locationError || error}</p>}
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-lime-400">
                        <SparklesIcon className="w-8 h-8 animate-pulse" role="status"><span className="sr-only">Loading...</span></SparklesIcon>
                        <p>{t('nexus_go.loading_delivery')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4" aria-live="polite">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-accent"/> {t('nexus_go.delivery_ai_summary')}</h3>
                            <p className="text-xs text-text-secondary">{results.aiSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.options.map(option => (
                                <div key={option.name} className="bg-black/20 p-3 rounded-lg border border-border-color flex flex-col">
                                    {option.imageUrl && <img src={option.imageUrl} alt={option.name} className="w-full h-32 object-cover rounded-md mb-2"/>}
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-sm">{option.name}</h4>
                                        {option.isTrending && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">Trending</span>}
                                    </div>
                                    <p className="text-xs text-text-muted">{option.cuisine} &bull; {option.priceLevel}</p>
                                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                                        <span className="material-symbols-outlined text-sm" aria-hidden="true">star</span>
                                        <span>{option.rating}</span>
                                        <span className="text-text-muted ml-2">Delivery: {option.deliveryTime}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-2 italic border-t border-white/5 pt-2">AI insight: {option.reason}</p>
                                    <a href={option.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-blue hover:underline mt-2">Visit Website</a>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <NexusGoIcon className="w-20 h-20 mb-4 opacity-30" aria-hidden="true" />
                        <p className="text-xl font-bold">{t('nexus_go.delivery_no_results')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFindOptions()}
                        placeholder={t('nexus_go.delivery_input_placeholder')}
                        disabled={isLoading || !location}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-lime-500 focus:outline-none"
                        aria-label={t('nexus_go.delivery_input_placeholder')}
                    />
                    <button 
                        onClick={handleFindOptions}
                        disabled={isLoading || !query || !location}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-lime-500 to-green-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('nexus_go.find_options')}
                    >
                        {t('nexus_go.find_options')}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * The RidesView component provides an interface for finding ride-sharing options.
 * It uses geolocation and an AI service to recommend ride services.
 * @returns {JSX.Element} The RidesView component.
 */
const RidesView: React.FC = () => {
    const { t } = useLanguage();
    const [destination, setDestination] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const [results, setResults] = useState<{aiSummary: string, options: RideOption[] } | null>(null);
    const [error, setError] = useState<string | null>(null); // Local error state for API calls

    /**
     * Handles initiating the search for ride-sharing options.
     */
    const handleFindOptions = async () => {
        if (!destination || isLoading || !location) return;
        setIsLoading(true);
        setResults(null);
        setError(null);

        try {
            const data = await getRideOptions(destination, location);
            setResults(data);
        } catch (e: any) {
            setError(e.message || "Failed to find ride options.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6 h-full">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <NexusGoIcon className="w-16 h-16 mx-auto mb-2 text-primary-blue" />
                    <h2 className="text-xl font-bold font-display">Ride-Sharing</h2>
                    <p className="text-text-muted">{t('nexus_go.current_location')}</p>
                    {(locationError || error) && <p className="text-sm text-red-400 mt-2" role="alert">{locationError || error}</p>}
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-primary-blue">
                        <SparklesIcon className="w-8 h-8 animate-pulse" role="status"><span className="sr-only">Loading...</span></SparklesIcon>
                        <p>{t('nexus_go.loading_rides')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4" aria-live="polite">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-accent"/> {t('nexus_go.delivery_ai_summary')}</h3>
                            <p className="text-xs text-text-secondary">{results.aiSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.options.map(option => (
                                <div key={option.service} className="bg-black/20 p-3 rounded-lg border border-border-color flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        {option.providerLogo && <img src={option.providerLogo} alt={option.service} className="w-6 h-6 object-contain rounded-full" />}
                                        <h4 className="font-bold text-sm">{option.service}</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-primary-blue">{option.estimatedCost}</p>
                                    <p className="text-xs text-text-muted">Est. Time: {option.estimatedTime}</p>
                                    {option.surgePricing && <p className="text-xs text-red-400 mt-1">Surge pricing active</p>}
                                    {option.eta && <p className="text-xs text-text-secondary mt-1">ETA: {option.eta}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <NexusGoIcon className="w-20 h-20 mb-4 opacity-30" aria-hidden="true" />
                        <p className="text-xl font-bold">{t('nexus_go.rides_no_results')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFindOptions()}
                        placeholder={t('nexus_go.rides_input_placeholder')}
                        disabled={isLoading || !location}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-primary-blue focus:outline-none"
                        aria-label={t('nexus_go.rides_input_placeholder')}
                    />
                    <button 
                        onClick={handleFindOptions}
                        disabled={isLoading || !destination || !location}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('nexus_go.find_options')}
                    >
                        {t('nexus_go.find_options')}
                    </button>
                </div>
            </div>
        </div>
    );
};