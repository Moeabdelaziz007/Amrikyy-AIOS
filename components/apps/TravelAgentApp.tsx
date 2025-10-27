import React, { useState } from 'react';
import { TravelPlan } from '../../types';
import { SparklesIcon, SearchIcon, MapIcon, TripIcon } from '../Icons';

type Tab = 'plan' | 'explore' | 'deals' | 'my-plans';

interface TravelAgentAppProps {
    startTravelWorkflow: (details: { destination: string, startDate: string, endDate: string, budget: string }) => void;
}

const TravelAgentApp: React.FC<TravelAgentAppProps> = ({ startTravelWorkflow }) => {
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
                    <TabButton id="explore" activeTab={activeTab} setActiveTab={setActiveTab} label="Explore Places" />
                    <TabButton id="deals" activeTab={activeTab} setActiveTab={setActiveTab} label="Find Deals" />
                    <TabButton id="my-plans" activeTab={activeTab} setActiveTab={setActiveTab} label="My Plans" />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'plan' && <PlanTripView startTravelWorkflow={startTravelWorkflow} />}
                {activeTab === 'explore' && <ExplorePlacesView />}
                {activeTab === 'deals' && <FindDealsView />}
                {activeTab === 'my-plans' && <MyPlansView />}
            </main>
        </div>
    );
};

const TabButton: React.FC<{id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void, label: string}> = ({ id, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === id ? 'bg-accent text-white' : 'hover:bg-white/10'}`}
    >
        {label}
    </button>
);

const PlanTripView: React.FC<{startTravelWorkflow: TravelAgentAppProps['startTravelWorkflow']}> = ({ startTravelWorkflow }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('2500');

    const handleCreateTrip = () => {
        if (destination && startDate && endDate && budget) {
            startTravelWorkflow({ destination, startDate, endDate, budget });
        } else {
            alert("Please fill out all fields before creating a trip.");
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="font-display text-3xl font-bold mb-6 text-center">Plan Your Next Adventure</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
                    <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-text-secondary mb-2">Destination</label>
                        <input type="text" id="destination" placeholder="e.g., Paris, France" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1"><label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-2">Start Date</label><input type="date" id="start-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
                        <div className="flex-1"><label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-2">End Date</label><input type="date" id="end-date" className="w-full bg-black/20 border border-white/10 rounded-md p-3 focus:ring-2 focus:ring-primary-blue focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
                    </div>
                    <div><label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-2">Budget: ${budget}</label><input type="range" id="budget" min="500" max="10000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-primary-blue" /></div>
                    <button type="submit" className="w-full font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 active:scale-95 transition-all duration-200">Create Trip with AI ✨</button>
                </form>
            </div>
        </div>
    )
};

const ExplorePlacesView = () => (
    <div className="h-full w-full p-6 text-center flex flex-col items-center justify-center">
        <MapIcon className="w-20 h-20 mb-4 text-emerald-400" />
        <h2 className="text-2xl font-bold font-display">Explore Places</h2>
        <p className="text-text-muted">This feature is under construction. Soon you'll be able to search for locations and get AI-powered insights.</p>
    </div>
);
const FindDealsView = () => (
    <div className="h-full w-full p-6 text-center flex flex-col items-center justify-center">
        <SearchIcon className="w-20 h-20 mb-4 text-sky-400" />
        <h2 className="text-2xl font-bold font-display">Find Deals</h2>
        <p className="text-text-muted">This feature is under construction. Get ready to find the best travel deals with the help of AI search.</p>
    </div>
);
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