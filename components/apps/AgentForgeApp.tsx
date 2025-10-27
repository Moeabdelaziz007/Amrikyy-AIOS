import React, { useState } from 'react';
import { CustomAgent, SkillID } from '../../types';
import { skills } from '../../data/skills';
import { AgentForgeIcon, SparklesIcon } from '../Icons';
import { suggestAgentPersona } from '../../services/geminiAdvancedService';
import ConfirmationDialog from '../ConfirmationDialog';

interface AgentForgeAppProps {
    onAddAgent: (agent: CustomAgent) => void;
    onClose: () => void;
}

const AgentForgeApp: React.FC<AgentForgeAppProps> = ({ onAddAgent, onClose }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [icon, setIcon] = useState('🤖');
    const [selectedSkills, setSelectedSkills] = useState<Set<SkillID>>(new Set());
    const [isDeployed, setIsDeployed] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isConfirmingDeploy, setIsConfirmingDeploy] = useState(false);

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

    const handleDeploy = () => {
        if (!name || !role) {
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
        onAddAgent(newAgent);
        setIsDeployed(true);
    };

    const handleSuggestPersona = async () => {
        if (!role || isSuggesting) return;
        setIsSuggesting(true);
        try {
            const suggestion = await suggestAgentPersona(role);
            setName(suggestion.name);
            setIcon(suggestion.icon);
            setSelectedSkills(new Set(suggestion.skillIDs as SkillID[]));
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

    if (isDeployed) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 text-center animate-fade-in">
                 <SparklesIcon className="w-20 h-20 text-green-400 mb-4" />
                 <h1 className="font-display text-3xl font-bold">Deployment Successful!</h1>
                 <p className="text-text-secondary max-w-sm mt-2">
                     Your new agent, <span className="font-bold text-white">{name}</span>, is now active and available across the OS.
                 </p>
                 <button onClick={onClose} className="mt-6 px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 transition-all">
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
            <div className="flex-grow flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
                {/* Main Content Area: Persona & Skills */}
                <main className="flex-1 flex flex-col gap-6 overflow-y-auto lg:pr-3">
                    <section className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                        <h2 className="text-xl font-bold font-display">1. Define Persona</h2>
                        <div>
                            <label htmlFor="agent-name" className="text-sm font-medium">Name</label>
                            <input id="agent-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg-tertiary p-2 rounded-md border border-border-color mt-1" />
                        </div>
                        <div>
                            <label htmlFor="agent-role" className="text-sm font-medium">Role</label>
                             <div className="flex items-center gap-2 mt-1">
                                <input id="agent-role" type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., A helpful poetry assistant" className="w-full bg-bg-tertiary p-2 rounded-md border border-border-color" />
                                <button onClick={handleSuggestPersona} disabled={isSuggesting || !role} title="Suggest with AI" className="p-2.5 rounded-md bg-accent text-white disabled:opacity-50 flex-shrink-0">
                                    {isSuggesting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="agent-icon" className="text-sm font-medium">Icon (Emoji)</label>
                            <input id="agent-icon" type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-bg-tertiary p-2 rounded-md border border-border-color mt-1" />
                        </div>
                    </section>
                    
                    <section className="flex-1 flex flex-col bg-black/20 rounded-lg p-4 border border-border-color min-h-[300px]">
                        <h2 className="text-xl font-bold font-display mb-4 flex-shrink-0">2. Plug-in Skills</h2>
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {skills.map(skill => {
                                const isSelected = selectedSkills.has(skill.id);
                                const Icon = skill.icon;
                                return (
                                    <div key={skill.id} onClick={() => handleSkillToggle(skill.id)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'bg-accent/20 border-accent' : 'bg-bg-tertiary border-border-color hover:border-white/50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                                            <h4 className="font-semibold text-sm">{skill.name}</h4>
                                        </div>
                                        <p className="text-xs text-text-secondary">{skill.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </main>
                
                {/* Sidebar: Preview & Deploy */}
                <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
                    <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                        <h2 className="text-xl font-bold font-display">Live Preview</h2>
                        <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white/5">
                            <div className="flex items-center justify-center size-14 bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 rounded-xl">
                                <span className="text-3xl">{icon}</span>
                            </div>
                            <p className="text-sm font-bold text-white/90">{name || "Agent Name"}</p>
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
                onConfirm={handleDeploy}
                title="Confirm Agent Deployment"
                message={`Are you sure you want to deploy agent "${name}"? It will become available across the OS.`}
                confirmText="Deploy"
            />
        </div>
    );
};

export default AgentForgeApp;
