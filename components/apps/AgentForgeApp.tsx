import React, { useState, useEffect, useCallback } from 'react';
import { CustomAgent, SkillID } from '../../types';
import { skills } from '../../data/skills';
import { AgentForgeIcon, SparklesIcon, Trash2Icon } from '../Icons';
import { suggestAgentPersona } from '../../services/geminiAdvancedService';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToAllChanges } from '../../packages/supabase/src';
import { 
  AgentConfig, 
  getUserAgents, 
  createAgent, 
  deleteAgent 
} from '../../services/agentService';
import ConfirmationDialog from '../ConfirmationDialog';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface AgentForgeAppProps {
    onClose: () => void;
}

const AgentForgeApp: React.FC<AgentForgeAppProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [agents, setAgents] = useState<CustomAgent[]>([]);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [icon, setIcon] = useState('🤖');
    const [selectedSkills, setSelectedSkills] = useState<Set<SkillID>>(new Set());
    const [isDeployed, setIsDeployed] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isConfirmingDeploy, setIsConfirmingDeploy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const listAgents = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('config')
                .eq('user_id', user.id);

            if (error) throw error;
            setAgents(data.map((d: any) => d.config) || []);
        } catch (err: any) {
            setError(err.message);
        }
    }, [user]);

    useEffect(() => {
        listAgents();
    }, [listAgents]);

    const handleSkillToggle = (skillId: SkillID) => {
        setSelectedSkills(prev => {
            const newSet = new Set(prev);
            if (newSet.has(skillId)) {
                newSet.delete(skillId);
            } else {
                newSet.add(skillId);
            }
            return newSet;
        });
    };

    const saveAgent = async () => {
        if (!name || !role || !user) {
            alert("Please provide a name and a role for your agent.");
            return;
        }
        const newAgent: CustomAgent = {
            id: `custom-${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            name,
            role,
            icon,
            skillIDs: Array.from(selectedSkills),
        };

        try {
            const { error } = await supabase.from('agents').insert([
                { user_id: user.id, name: newAgent.name, config: newAgent }
            ]);
            if (error) throw error;
            setAgents([...agents, newAgent]);
            setIsDeployed(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteAgent = async (agentId: string) => {
        try {
            const { error } = await supabase.from('agents').delete().eq('config->>id', agentId);
            if (error) throw error;
            setAgents(agents.filter(a => a.id !== agentId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSuggestPersona = async () => {
        if (!role || isSuggesting) return;
        setIsSuggesting(true);
        try {
            const suggestion = await suggestAgentPersona(role);
            setName(suggestion.name);
            setIcon(suggestion.icon);
            setSelectedSkills(new Set(suggestion.skillIDs));
        } catch (error) {
            console.error("Failed to get agent suggestions:", error);
            alert("Sorry, I couldn't generate suggestions. Please try again.");
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const requestDeploy = () => {
        if (!name || !role) return;
        setIsConfirmingDeploy(true);
    };

    const resetForm = () => {
        setName('');
        setRole('');
        setIcon('🤖');
        setSelectedSkills(new Set());
        setIsDeployed(false);
    };

    if (!user) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-bg-tertiary rounded-b-md text-white">
                <p className="text-text-secondary">Please sign in to access Agent Forge</p>
            </div>
        );
    }

    if (isDeployed) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 text-center animate-fade-in">
                 <SparklesIcon className="w-20 h-20 text-green-400 mb-4" />
                 <h1 className="font-display text-3xl font-bold">Deployment Successful!</h1>
                 <p className="text-text-secondary max-w-sm mt-2">
                     Your new agent, <span className="font-bold text-white">{name}</span>, has been saved to your collection.
                 </p>
                 <button onClick={() => setIsDeployed(false)} className="mt-6 px-6 py-3 font-bold rounded-lg bg-primary-blue hover:brightness-110 transition-all">
                    Forge Another Agent
                </button>
                 <button onClick={onClose} className="mt-2 px-6 py-2 text-sm rounded-lg hover:bg-white/10 transition-all">
                    Close
                </button>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <AgentForgeIcon className="w-8 h-8 text-amber-400"/>
                <h1 className="font-display text-2xl font-bold">Agent Forge</h1>
            </header>
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar: Agent List */}
                <aside className="w-full lg:w-64 flex-shrink-0 p-4 border-r border-border-color overflow-y-auto">
                    <h2 className="text-lg font-bold mb-3">Your Agents</h2>
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : agents.length === 0 ? (
                        <p className="text-sm text-text-secondary">No agents yet</p>
                    ) : (
                        <div className="space-y-2">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="p-3 bg-black/20 rounded-lg border border-border-color hover:border-primary-blue/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-grow min-w-0">
                                            <span className="text-2xl flex-shrink-0">{agent.icon}</span>
                                            <div className="min-w-0 flex-grow">
                                                <p className="font-semibold text-sm truncate">{agent.name}</p>
                                                <p className="text-xs text-text-secondary truncate">{agent.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAgent(agent.id)}
                                            className="p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                                            title="Delete agent"
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
                
                {/* Sidebar: Preview & Deploy */}
                <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                    <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                        <h2 className="text-xl font-bold font-display">Live Preview</h2>
                        <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white/5">
                            <div className="flex items-center justify-center size-14 bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 rounded-xl">
                                <span className="text-3xl">{icon}</span>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color flex-grow">
                        <h2 className="text-xl font-bold font-display">My Agents</h2>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="space-y-2">
                            {agents.map(agent => (
                                <div key={agent.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <span>{agent.icon}</span>
                                        <span className="text-sm">{agent.name}</span>
                                    </div>
                                    <button onClick={() => deleteAgent(agent.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2Icon size={16}/>
                                    </button>
                                </div>
                            ))}
                            {agents.length === 0 && <p className="text-sm text-text-secondary">No agents deployed yet.</p>}
                        </div>
                    </div>
                    <div className="mt-auto">
                        <button onClick={requestDeploy} className="w-full px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50" disabled={!name || !role}>
                            Deploy Agent
                        </button>
                    </div>
                </aside>
            </div>
            <ConfirmationDialog
                isOpen={isConfirmingDeploy}
                onClose={() => setIsConfirmingDeploy(false)}
                onConfirm={saveAgent}
                title="Confirm Agent Deployment"
                message={`Are you sure you want to deploy agent "${name}"? It will be saved to your collection.`}
                confirmText="Deploy"
            />
        </div>
    );
};

export default AgentForgeApp;