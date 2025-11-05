import React, { useState } from 'react';
import { TravelPlan, FlightOption, FlightSearchDetails } from '../../types.ts';
import { SparklesIcon, SearchIcon, MapIcon, TripIcon, FlightsIcon } from '../Icons.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import { searchFlights } from '../../services/geminiAdvancedService.ts';
import { TranslationKey } from '../../i18n.ts'; // Import TranslationKey

/**
 * Defines the available tabs within the Travel Agent application.
 */
type Tab = 'plan' | 'explore' | 'deals' | 'flights' | 'my-plans';

/**
 * Props for the TravelAgentApp component.
 */
interface TravelAgentAppProps {
    /** Callback function to start a travel planning workflow. */
    startTravelWorkflow: (details: { destination: string, startDate: string, endDate: string, budget: string }) => void;
}

/**
 * The TravelAgentApp component provides an AI-powered interface for planning trips,
 * exploring places, finding deals, searching flights, and managing saved plans.
 * @param {TravelAgentAppProps} props - The component props.
 * @returns {JSX.Element} The TravelAgentApp component.
 */
const TravelAgentApp: React.FC<TravelAgentAppProps> = ({ startTravelWorkflow }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('plan');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TripIcon className="w-8 h-8 text-primary-cyan"/>
                    <h1 className="font-display text-2xl font-bold">Travel Agent Pro</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <TabButton id="plan" activeTab={activeTab} setActiveTab={setActiveTab} label="Plan Trip" />
                    <TabButton id="flights" activeTab={activeTab} setActiveTab={setActiveTab} label={t('travel_agent.flights_tab' as TranslationKey)} />
                    <TabButton id="explore" activeTab={activeTab} setActiveTab={setActiveTab} label="Explore Places" />
                    <TabButton id="deals" activeTab={activeTab} setActiveTab={setActiveTab} label="Find Deals" />
                    <TabButton id="my-plans" activeTab={activeTab} setActiveTab={setActiveTab} label="My Plans" />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'plan' && <PlanTripView startTravelWorkflow={startTravelWorkflow} />}
                {activeTab === 'flights' && <FlightsView />}
                {activeTab === 'explore' && <ExplorePlacesView />}
                {activeTab === 'deals' && <FindDealsView />}
                {activeTab === 'my-plans' && <MyPlansView />}
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
        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

/**
 * The PlanTripView component provides a form for users to input trip details
 * and initiate an AI-powered travel planning workflow.
 * @param {object} props - The component props.
 * @param {TravelAgentAppProps['startTravelWorkflow']} props.startTravelWorkflow - Callback to start the travel workflow.
 * @returns {JSX.Element} The PlanTripView component.
 */
const PlanTripView: React.FC<{startTravelWorkflow: TravelAgentAppProps['startTravelWorkflow']}> = ({ startTravelWorkflow }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('2500');
    const [interests, setInterests] = useState<string>('sightseeing, food, nightlife');
    const [hotelPreference, setHotelPreference] = useState<'budget'|'mid'|'luxury'>('mid');
    const [includeNightlife, setIncludeNightlife] = useState(true);
    const [includeRestaurants, setIncludeRestaurants] = useState(true);
    const [includeTours, setIncludeTours] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<TravelPlan | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * Handles the creation of a new trip by validating input and starting the workflow.
     */
    const handleCreateTrip = async () => {
        setErrorMessage(null);
        if (!destination || !startDate || !endDate || !budget) {
            setErrorMessage('Please fill out all required fields.');
            return;
        }

        setIsGenerating(true);
        setGeneratedPlan(null);

        // Build a rich request object for the workflow / AI planner
        const request = {
            destination,
            startDate,
            endDate,
            budget: Number(budget),
            preferences: {
                interests: interests.split(',').map(s => s.trim()),
                hotelPreference,
                includeNightlife,
                includeRestaurants,
                includeTours
            }
        };

        try {
            // Use the existing startTravelWorkflow to open the workflow UI; also call backend AI planner if available
            startTravelWorkflow({ destination, startDate, endDate, budget });

            // Try to call backend planner for an immediate plan (best-effort; backend may not be implemented)
            const resp = await fetch('/api/ai/travel-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });
            if (resp.ok) {
                const plan = await resp.json();
                setGeneratedPlan(plan as TravelPlan);
            } else {
                // Backend missing: fall back to a lightweight client-side skeleton plan
                const skeleton: TravelPlan = buildSkeletonPlan(destination, startDate, endDate, request.preferences);
                setGeneratedPlan(skeleton);
            }
        } catch (err: any) {
            console.error('Failed to generate plan', err);
            setErrorMessage(err?.message || 'Failed to generate plan. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full w-full flex items-start justify-center p-6">
            <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                <h2 className="font-display text-3xl font-bold mb-4 text-center">Plan Your Next Adventure</h2>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label htmlFor="destination" className="block text-sm font-medium text-text-secondary mb-2">Destination</label>
                            <input type="text" id="destination" placeholder="e.g., Paris, France" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Budget: ${budget}</label>
                            <input type="range" min="500" max="10000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-2 bg-black/20 rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-2">Start Date</label>
                            <input type="date" id="start-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-2">End Date</label>
                            <input type="date" id="end-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label htmlFor="interests" className="block text-sm font-medium text-text-secondary mb-2">Interests (comma-separated)</label>
                            <input id="interests" type="text" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-md p-3" placeholder="e.g., museums, food, nightlife, hiking" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Hotel Preference</label>
                            <select value={hotelPreference} onChange={(e) => setHotelPreference(e.target.value as any)} className="w-full bg-black/20 border border-white/10 rounded-md p-3">
                                <option value="budget">Budget</option>
                                <option value="mid">Comfort / Mid</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeRestaurants} onChange={(e) => setIncludeRestaurants(e.target.checked)} /> Include restaurants</label>
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeNightlife} onChange={(e) => setIncludeNightlife(e.target.checked)} /> Include nightlife</label>
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeTours} onChange={(e) => setIncludeTours(e.target.checked)} /> Include tours & activities</label>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={isGenerating} className="flex-1 font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 active:scale-95 transition-all duration-200">{isGenerating ? 'Generating plan…' : 'Create Detailed Plan ✨'}</button>
                        <button type="button" onClick={() => { setDestination(''); setStartDate(''); setEndDate(''); setBudget('2500'); setInterests(''); setGeneratedPlan(null); }} className="px-4 py-3 rounded-lg bg-black/20">Reset</button>
                    </div>

                    {errorMessage && <p className="text-sm text-red-400 mt-2">{errorMessage}</p>}
                </form>

                {/* Generated itinerary preview */}
                {generatedPlan && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                        <ItineraryPreview plan={generatedPlan} />
                    </div>
                )}
            </div>
        </div>
    )
};

/**
 * Utility to build a simple skeleton itinerary when backend isn't available
 */
const buildSkeletonPlan = (destination: string, start: string, end: string, prefs: any): TravelPlan => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000*60*60*24)) + 1);
    const itinerary = [] as any[];
    for (let i = 0; i < days; i++) {
        itinerary.push({ day: i+1, title: `Day ${i+1} in ${destination}`, activities: [
            { time: '09:00', title: `Morning: Explore local sights`, details: '' },
            { time: '13:00', title: `Lunch at recommended restaurant`, details: '' },
            { time: '15:00', title: `Afternoon: Museum / Tour`, details: '' },
            { time: '20:00', title: `Evening: Nightlife or show`, details: '' }
        ]});
    }
    return {
        tripTitle: `Trip to ${destination}`,
        destination,
        startDate: start,
        endDate: end,
        budget: Number(prefs?.budget || 0),
        itinerary,
        notes: 'Skeleton plan generated locally. For richer results, connect backend AI planner.'
    } as TravelPlan;
};

/**
 * Simple itinerary preview with export
 */
const ItineraryPreview: React.FC<{plan: TravelPlan}> = ({ plan }) => {
    const exportJson = () => {
        const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${(plan.tripTitle || 'itinerary').replace(/\s+/g,'_')}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-black/20 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-display text-xl font-bold">{plan.tripTitle}</h3>
                    <p className="text-sm text-text-secondary">{plan.destination} • {plan.startDate} - {plan.endDate}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportJson} className="px-3 py-1 bg-white/5 rounded">Export JSON</button>
                    <button onClick={() => window.print()} className="px-3 py-1 bg-white/5 rounded">Print</button>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {plan.itinerary?.map((day: any) => (
                    <div key={day.day} className="bg-black/10 p-3 rounded-lg">
                        <h4 className="font-semibold">{day.title}</h4>
                        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                            {day.activities.map((act: any, idx: number) => (
                                <li key={idx}><strong>{act.time}</strong> — {act.title} {act.details ? `· ${act.details}` : ''}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * The FlightsView component provides an interface for searching flight options.
 * Users can input origin, destination, dates, and other criteria to find flights using AI.
 * @returns {JSX.Element} The FlightsView component.
 */
const FlightsView: React.FC = () => {
    const { t } = useLanguage();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [isRoundTrip, setIsRoundTrip] = useState(true);
    const [passengers, setPassengers] = useState(1);
    const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');
    const [isLoading, setIsLoading] = useState(false);
    const [flightResults, setFlightResults] = useState<FlightOption[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles the flight search process.
     * Validates input, sets loading state, calls the AI service, and displays results or errors.
     */
    const handleSearchFlights = async () => {
        if (!origin || !destination || !departureDate || (isRoundTrip && !returnDate) || isLoading) {
            setError(t('travel_agent.flight_input_error_fill_all' as TranslationKey)); // Ensure this translation key exists or use a default string.
            return;
        }

        setIsLoading(true);
        setFlightResults(null);
        setError(null);

        try {
            const results = await searchFlights({
                origin,
                destination,
                departureDate,
                returnDate: isRoundTrip ? returnDate : undefined,
                passengers,
                cabinClass,
            });
            setFlightResults(results);
        } catch (err: any) {
            setError(err.message || t('travel_agent.flight_search_failed' as TranslationKey)); // Ensure this translation key exists or use a default string.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col p-6">
            <div className="flex-grow w-full max-w-2xl mx-auto space-y-4">
                <div className="text-center">
                    <FlightsIcon className="w-16 h-16 mx-auto mb-2 text-primary-cyan" />
                    <h2 className="text-xl font-bold font-display">{t('travel_agent.flights_tab' as TranslationKey)}</h2>
                    <p className="text-text-muted">Find the best flight deals with AI.</p>
                    {error && <p className="text-sm text-red-400 mt-2" role="alert">{error}</p>}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setIsRoundTrip(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isRoundTrip ? 'bg-primary-blue text-white' : 'bg-black/20 hover:bg-white/10'}`}
                        >
                            {t('travel_agent.round_trip' as TranslationKey)}
                        </button>
                        <button
                            onClick={() => setIsRoundTrip(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!isRoundTrip ? 'bg-primary-blue text-white' : 'bg-black/20 hover:bg-white/10'}`}
                        >
                            {t('travel_agent.one_way' as TranslationKey)}
                        </button>
                    </div>

                    <div>
                        <label htmlFor="origin-input" className="block text-sm font-medium text-text-secondary mb-1">Origin</label>
                        <input type="text" id="origin-input" placeholder={t('travel_agent.flight_input_placeholder' as TranslationKey)} className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="destination-input" className="block text-sm font-medium text-text-secondary mb-1">Destination</label>
                        <input type="text" id="destination-input" placeholder={t('travel_agent.flight_input_placeholder' as TranslationKey)} className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="departure-date" className="block text-sm font-medium text-text-secondary mb-1">Departure Date</label>
                            <input type="date" id="departure-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
                        </div>
                        {isRoundTrip && (
                            <div className="flex-1">
                                <label htmlFor="return-date" className="block text-sm font-medium text-text-secondary mb-1">Return Date</label>
                                <input type="date" id="return-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required={isRoundTrip} />
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="passengers-input" className="block text-sm font-medium text-text-secondary mb-1">{t('travel_agent.passengers' as TranslationKey)}</label>
                            <input type="number" id="passengers-input" min="1" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))} />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="cabin-class-select" className="block text-sm font-medium text-text-secondary mb-1">{t('travel_agent.cabin_class' as TranslationKey)}</label>
                            <select id="cabin-class-select" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={cabinClass} onChange={(e) => setCabinClass(e.target.value as 'Economy' | 'Premium Economy' | 'Business' | 'First')}>
                                <option value="Economy">{t('travel_agent.economy' as TranslationKey)}</option>
                                <option value="Premium Economy">{t('travel_agent.premium_economy' as TranslationKey)}</option>
                                <option value="Business">{t('travel_agent.business' as TranslationKey)}</option>
                                <option value="First">{t('travel_agent.first_class' as TranslationKey)}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-primary-cyan">
                        <SparklesIcon className="w-8 h-8 animate-pulse" role="status"><span className="sr-only">Loading...</span></SparklesIcon>
                        <p>{t('travel_agent.loading_flights' as TranslationKey)}</p>
                    </div>
                ) : flightResults && flightResults.length > 0 ? (
                    <div className="mt-6 space-y-4" aria-live="polite">
                        <h3 className="font-display text-xl font-bold">Available Flights</h3>
                        {flightResults.map((flight, index) => (
                            <a href={flight.url} target="_blank" rel="noopener noreferrer" key={index} className="block bg-black/20 p-4 rounded-lg border border-border-color hover:border-primary-cyan transition-colors cursor-pointer">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-lg">{flight.carrier}</h4>
                                    <span className="text-xl font-bold text-primary-cyan">${flight.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-text-secondary">
                                    <span>{flight.departureTime} - {flight.arrivalTime}</span>
                                    <span>{flight.duration}</span>
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                    <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</span> &bull; <span>{cabinClass}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted mt-8">
                        <FlightsIcon className="w-20 h-20 mb-4 opacity-30" aria-hidden="true" />
                        <p className="text-xl font-bold">{t('travel_agent.no_flights_results' as TranslationKey)}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <button
                    onClick={handleSearchFlights}
                    disabled={isLoading || !origin || !destination || !departureDate || (isRoundTrip && !returnDate)}
                    className="w-full font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-primary-cyan to-primary-blue hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('travel_agent.find_flights' as TranslationKey)}
                </button>
            </div>
        </div>
    );
};

/**
 * The ExplorePlacesView component provides a placeholder for future AI-powered
 * exploration of destinations.
 * @returns {JSX.Element} The ExplorePlacesView component.
 */
const ExplorePlacesView = () => {
    const { t } = useLanguage();
    return (
        <div className="h-full w-full p-6 text-center flex flex-col items-center justify-center">
            <MapIcon className="w-20 h-20 mb-4 text-emerald-400" />
            <h2 className="text-2xl font-bold font-display">Explore Places</h2>
            <p className="text-text-muted">{t('travel_agent.explore_desc' as TranslationKey) || "This feature is under construction. Soon you'll be able to search for locations and get AI-powered insights."}</p>
        </div>
    );
};

/**
 * The FindDealsView component provides a placeholder for future AI-powered
 * searching for travel deals.
 * @returns {JSX.Element} The FindDealsView component.
 */
const FindDealsView = () => {
    const { t } = useLanguage();
    return (
        <div className="h-full w-full p-6 text-center flex flex-col items-center justify-center">
            <SearchIcon className="w-20 h-20 mb-4 text-sky-400" />
            <h2 className="text-2xl font-bold font-display">Find Deals</h2>
            <p className="text-text-muted">{t('travel_agent.deals_desc' as TranslationKey) || "This feature is under construction. Get ready to find the best travel deals with the help of AI search."}</p>
        </div>
    );
};

/**
 * The MyPlansView component displays a list of mock travel plans.
 * In a real application, this would show user-saved travel plans.
 * @returns {JSX.Element} The MyPlansView component.
 */
const MyPlansView = () => {
    const mockPlans: Partial<TravelPlan>[] = [
        { tripTitle: 'Cyberpunk Adventure in Tokyo', destination: 'Tokyo, Japan', itinerary: [{day: 1, title: 'Shibuya Crossing & Neon Nights', activities:[]}] },
        { tripTitle: 'Ancient Wonders of Rome', destination: 'Rome, Italy', itinerary: [{day: 1, title: 'Colosseum & Roman Forum', activities:[]}] },
        { tripTitle: 'Relaxing Beach Getaway in Bali', destination: 'Bali, Indonesia', itinerary: [{day: 1, title: 'Uluwatu Temple Sunset', activities:[]}] },
    ];
    return (
        <div className="h-full w-full p-6">
            <h2 className="text-2xl font-bold font-display mb-4">My Saved Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPlans.map(plan => (
                    <div key={plan.tripTitle} className="bg-black/20 border border-border-color rounded-lg p-4 hover:border-accent transition-colors cursor-pointer">
                        <h3 className="font-bold text-lg">{plan.tripTitle}</h3>
                        <p className="text-sm text-text-secondary">{plan.destination}</p>
                    </div>
                ))}
                <div className="bg-black/10 border-2 border-dashed border-border-color rounded-lg p-4 flex items-center justify-center text-text-muted">
                    <p>Your future plans will appear here.</p>
                </div>
            </div>
        </div>
    );
};


export default TravelAgentApp;