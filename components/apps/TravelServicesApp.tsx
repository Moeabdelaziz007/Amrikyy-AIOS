import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TravelServicesIcon, SparklesIcon, SendIcon } from '../Icons';
import { findCleaningServices, findNightlifeEvents, findDeliveryOptions as fetchDeliveryOptions } from '../../services/geminiAdvancedService';
import { CleaningService, NightlifeEvent, FastFoodRestaurant, UserAccount } from '../../types';

type Tab = 'cleaning' | 'food_delivery' | 'nightlife';

interface TravelServicesAppProps {
    onOpenApp: (appId: string) => void;
    userAccount: UserAccount;
}

const TravelServicesApp: React.FC<TravelServicesAppProps> = ({ onOpenApp, userAccount }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('cleaning');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <TravelServicesIcon className="w-8 h-8 text-teal-400"/>
                    <h1 className="font-display text-2xl font-bold">{t('travel_services.title')}</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="cleaning" activeTab={activeTab} setActiveTab={setActiveTab} label={t('travel_services.cleaning_tab')} />
                    <TabButton id="food_delivery" activeTab={activeTab} setActiveTab={setActiveTab} label={t('travel_services.food_delivery_tab')} />
                    <TabButton id="nightlife" activeTab={activeTab} setActiveTab={setActiveTab} label={t('travel_services.nightlife_tab')} />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'cleaning' && <CleaningView />}
                {activeTab === 'food_delivery' && <FoodDeliveryView />}
                {activeTab === 'nightlife' && <NightlifeView />}
            </main>
        </div>
    );
};

const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

interface GeolocationState {
    latitude: number;
    longitude: number;
}

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
                setError(t('travel_services.error_location'));
                setLocation(null);
                console.error("Geolocation error:", err);
            }
        );
    }, [t]);

    return { location, error };
};

const CleaningView: React.FC = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const [results, setResults] = useState<{aiSummary: string, services: CleaningService[] } | null>(null);

    const handleFindServices = async () => {
        if (!query || isLoading || !location) return;
        setIsLoading(true);
        setResults(null);
        setError(null);

        try {
            const data = await findCleaningServices(query, location);
            setResults(data);
        } catch (e: any) {
            setError(e.message || "Failed to find cleaning services.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const [error, setError] = useState<string | null>(null); // Local error state for API calls

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6 h-full">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <TravelServicesIcon className="w-16 h-16 mx-auto mb-2 text-teal-400" />
                    <h2 className="text-xl font-bold font-display">{t('travel_services.cleaning_tab')}</h2>
                    <p className="text-text-muted">{t('travel_services.current_location')}</p>
                    {(locationError || error) && <p className="text-sm text-red-400 mt-2">{locationError || error}</p>}
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-teal-400">
                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                        <p>{t('travel_services.loading_cleaning')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-accent"/> {t('nexus_go.delivery_ai_summary')}</h3>
                            <p className="text-xs text-text-secondary">{results.aiSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.services.map(service => (
                                <div key={service.name} className="bg-black/20 p-3 rounded-lg border border-border-color flex flex-col">
                                    {service.imageUrl && <img src={service.imageUrl} alt={service.name} className="w-full h-32 object-cover rounded-md mb-2"/>}
                                    <div>
                                        <h4 className="font-bold text-sm">{service.name}</h4>
                                    </div>
                                    <p className="text-xs text-text-muted">{service.type} &bull; {service.priceRange}</p>
                                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                                        <span className="material-symbols-outlined text-sm">star</span>
                                        <span>{service.rating}</span>
                                        <span className="text-text-muted ml-2">Availability: {service.availability}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-2 italic border-t border-white/5 pt-2">AI insight: {service.reason}</p>
                                    <a href={service.contact} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-blue hover:underline mt-2">Contact</a>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <TravelServicesIcon className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-xl font-bold">{t('travel_services.no_cleaning_results')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFindServices()}
                        placeholder={t('travel_services.cleaning_input_placeholder')}
                        disabled={isLoading || !location}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleFindServices}
                        disabled={isLoading || !query || !location}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-teal-500 to-green-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('travel_services.find_services')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FoodDeliveryView: React.FC = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const [results, setResults] = useState<{aiSummary: string, options: FastFoodRestaurant[] } | null>(null);

    const handleFindFoodOptions = async () => {
        if (!query || isLoading || !location) return;
        setIsLoading(true);
        setResults(null);
        setError(null);

        try {
            const data = await fetchDeliveryOptions(query, location); // Using the general findDeliveryOptions
            setResults(data);
        } catch (e: any) {
            setError(e.message || "Failed to find food delivery options.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const [error, setError] = useState<string | null>(null); // Local error state for API calls

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6 h-full">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <TravelServicesIcon className="w-16 h-16 mx-auto mb-2 text-orange-400" />
                    <h2 className="text-xl font-bold font-display">{t('travel_services.food_delivery_tab')}</h2>
                    <p className="text-text-muted">{t('travel_services.current_location')}</p>
                    {(locationError || error) && <p className="text-sm text-red-400 mt-2">{locationError || error}</p>}
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-orange-400">
                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                        <p>{t('travel_services.loading_food')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4">
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
                                        <span className="material-symbols-outlined text-sm">star</span>
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
                        <TravelServicesIcon className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-xl font-bold">{t('travel_services.no_food_results')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFindFoodOptions()}
                        placeholder={t('travel_services.food_delivery_input_placeholder')}
                        disabled={isLoading || !location}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleFindFoodOptions}
                        disabled={isLoading || !query || !location}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('travel_services.find_food')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NightlifeView: React.FC = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { location, error: locationError } = useGeolocation();
    const [results, setResults] = useState<{aiSummary: string, events: NightlifeEvent[] } | null>(null);

    const handleFindEvents = async () => {
        if (!query || isLoading || !location) return;
        setIsLoading(true);
        setResults(null);
        setError(null);

        try {
            const data = await findNightlifeEvents(query, location);
            setResults(data);
        } catch (e: any) {
            setError(e.message || "Failed to find nightlife events.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const [error, setError] = useState<string | null>(null); // Local error state for API calls

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6 h-full">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <TravelServicesIcon className="w-16 h-16 mx-auto mb-2 text-purple-400" />
                    <h2 className="text-xl font-bold font-display">{t('travel_services.nightlife_tab')}</h2>
                    <p className="text-text-muted">{t('travel_services.current_location')}</p>
                    {(locationError || error) && <p className="text-sm text-red-400 mt-2">{locationError || error}</p>}
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-purple-400">
                        <SparklesIcon className="w-8 h-8 animate-pulse" />
                        <p>{t('travel_services.loading_nightlife')}</p>
                    </div>
                ) : results ? (
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-accent"/> {t('nexus_go.delivery_ai_summary')}</h3>
                            <p className="text-xs text-text-secondary">{results.aiSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.events.map(event => (
                                <div key={event.name} className="bg-black/20 p-3 rounded-lg border border-border-color flex flex-col">
                                    {event.imageUrl && <img src={event.imageUrl} alt={event.name} className="w-full h-32 object-cover rounded-md mb-2"/>}
                                    <div>
                                        <h4 className="font-bold text-sm">{event.name}</h4>
                                    </div>
                                    <p className="text-xs text-text-muted">{event.type} &bull; {event.location}</p>
                                    <p className="text-xs text-text-secondary mt-1">{event.date} at {event.time}</p>
                                    {event.vipOptions && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 self-start mt-1">VIP Available</span>}
                                    <p className="text-xs text-text-secondary mt-2 italic border-t border-white/5 pt-2">AI insight: {event.reason}</p>
                                    {event.ticketsUrl && <a href={event.ticketsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-blue hover:underline mt-2">Get Tickets</a>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <TravelServicesIcon className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-xl font-bold">{t('travel_services.no_nightlife_results')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleFindEvents()}
                        placeholder={t('travel_services.nightlife_input_placeholder')}
                        disabled={isLoading || !location}
                        className="flex-grow h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleFindEvents}
                        disabled={isLoading || !query || !location}
                        className="h-12 px-6 font-bold rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('travel_services.find_events')}
                    </button>
                </div>
            </div>
        </div>
    );
};