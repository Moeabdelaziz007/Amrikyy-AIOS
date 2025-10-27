import React, { useState, useMemo } from 'react';
import { CommunityAgent, CustomAgent, UserAccount, AppID } from '../../types';
import { communityAgents } from '../../data/communityAgents';
import { StoreIcon, SearchIcon, SparklesIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface StoreAppProps {
    onAddAgent: (agent: CommunityAgent) => void;
    installedAgents: CustomAgent[];
    userAccount: UserAccount;
    onOpenApp: (appId: AppID) => void;
}

type Category = 'All' | 'Productivity' | 'Creative' | 'System' | 'Utility';

const StoreApp: React.FC<StoreAppProps> = ({ onAddAgent, installedAgents, userAccount, onOpenApp }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [viewingAgent, setViewingAgent] = useState<CommunityAgent | null>(null);

    const installedAgentIds = useMemo(() => new Set(installedAgents.map(a => a.id)), [installedAgents]);

    const filteredAgents = useMemo(() => {
        return communityAgents.filter(agent => {
            const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    const categories: Category[] = ['All', 'Productivity', 'Creative', 'Utility'];

    const handleGetAgent = (agent: CommunityAgent) => {
        if (agent.price && userAccount.tier === 'Free') {
            alert(t('store.upgrade_prompt_text'));
            onOpenApp('pricing');
        } else {
            onAddAgent(agent);
        }
        setViewingAgent(null); // Close modal after action
    };
    
    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <StoreIcon className="w-8 h-8 text-primary-blue"/>
                    <h1 className="font-display text-2xl font-bold">Gemini Store</h1>
                </div>
                <div className="relative w-full sm:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input 
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-9 text-sm focus:ring-1 focus:ring-primary-blue focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
            </header>
             <nav className="flex-shrink-0 p-3 border-b border-border-color flex items-center gap-2 overflow-x-auto">
                {categories.map(category => (
                     <button 
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-primary-blue text-white' : 'bg-black/20 hover:bg-white/10'}`}
                    >
                        {category}
                    </button>
                ))}
            </nav>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-display mb-4">Featured</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {filteredAgents.slice(0, 2).map(agent => (
                            <div key={agent.id} onClick={() => setViewingAgent(agent)} className="bg-black/20 p-4 rounded-lg border border-border-color flex items-center gap-4 cursor-pointer hover:border-primary-blue transition-colors">
                                <div className="text-5xl flex-shrink-0">{agent.icon}</div>
                                <div>
                                    <h3 className="font-bold">{agent.name}</h3>
                                    <p className="text-xs text-text-secondary">{agent.role}</p>
                                    <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
                                        <SparklesIcon className="w-3 h-3" />
                                        <span>{agent.rating}</span>
                                    </div>
                                </div>
                                 <div className="ml-auto text-right">
                                    {agent.price ? (
                                        <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">${agent.price}</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-300 rounded-full">Free</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold font-display mb-4">Discover Agents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAgents.map(agent => (
                            <div key={agent.id} onClick={() => setViewingAgent(agent)} className="bg-black/20 p-4 rounded-lg border border-border-color flex flex-col items-center text-center gap-2 cursor-pointer hover:border-primary-blue transition-colors">
                                <div className="text-4xl">{agent.icon}</div>
                                <h3 className="font-semibold text-sm">{agent.name}</h3>
                                <p className="text-xs text-text-secondary line-clamp-2 h-8">{agent.role}</p>
                                 <button disabled={installedAgentIds.has(agent.id)} onClick={(e) => { e.stopPropagation(); handleGetAgent(agent); }} className="mt-2 w-full text-xs font-bold py-1.5 rounded-full bg-primary-blue/20 text-primary-blue hover:bg-primary-blue/40 disabled:bg-green-500/20 disabled:text-green-300 disabled:cursor-not-allowed">
                                    {installedAgentIds.has(agent.id) ? 'Installed' : agent.price ? `Get for $${agent.price}` : 'Get'}
                                 </button>
                            </div>
                        ))}
                    </div>
                     {filteredAgents.length === 0 && <p className="text-center text-text-muted py-8">No agents found matching your criteria.</p>}
                </div>
            </main>

            {/* Agent Detail Modal */}
            {viewingAgent && (
                 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setViewingAgent(null)}>
                    <div className="w-full max-w-lg bg-bg-secondary rounded-2xl border border-border-color shadow-2xl flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center border-b border-border-color">
                             <div className="text-6xl mx-auto mb-2">{viewingAgent.icon}</div>
                             <h2 className="text-2xl font-bold font-display">{viewingAgent.name}</h2>
                             <p className="text-sm text-text-secondary">{viewingAgent.author}</p>
                             <div className="flex items-center justify-center gap-1 mt-1 text-yellow-400">
                                <SparklesIcon className="w-4 h-4" />
                                <span>{viewingAgent.rating}</span>
                            </div>
                        </div>
                        <div className="p-6 text-sm text-text-secondary">
                            {viewingAgent.description}
                        </div>
                        <div className="p-6 border-t border-border-color flex justify-end items-center gap-4">
                            <span className="text-lg font-bold">
                                {viewingAgent.price ? `$${viewingAgent.price}` : 'Free'}
                            </span>
                            <button onClick={() => setViewingAgent(null)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10">Cancel</button>
                             <button disabled={installedAgentIds.has(viewingAgent.id)} onClick={() => handleGetAgent(viewingAgent)} className="px-6 py-2 text-sm font-bold rounded-lg bg-primary-blue text-white disabled:bg-green-500 disabled:cursor-not-allowed">
                                {installedAgentIds.has(viewingAgent.id) ? 'Installed' : 'Get'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreApp;