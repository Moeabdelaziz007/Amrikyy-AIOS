import React, { useState, useEffect, useCallback } from 'react';
import { CustomAgent, SkillID } from '../../types';
import { skills } from '../../data/skills';
import { AgentForgeIcon, SparklesIcon, TrashIcon, DownloadIcon } from '../Icons';
import { suggestAgentPersona } from '../../services/geminiAdvancedService';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationDialog from '../ConfirmationDialog';
import { getAgents, createAgent, deleteAgent, updateAgent, getTools, getSkills, AIXAgent, Tool, Skill } from '../../services/agentService';
import { generateAIX, downloadAIX, createAIXFilename, type AIXGeneratorConfig } from '../../packages/aix-format/src/index';

interface AgentForgeAppProps {
    onClose: () => void;
}

const AgentForgeApp: React.FC<AgentForgeAppProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [agents, setAgents] = useState<AIXAgent[]>([]);
    const [name, setName] = useState('');
    const [persona, setPersona] = useState('');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [category, setCategory] = useState('general');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    const [availableTools, setAvailableTools] = useState<Tool[]>([]);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

    const [isDeployed, setIsDeployed] = useState(false);
    const [isConfirmingDeploy, setIsConfirmingDeploy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [personaInstructions, setPersonaInstructions] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [temperature, setTemperature] = useState(0.7);
    const [editingAgent, setEditingAgent] = useState<AIXAgent | null>(null);

    const listAgents = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [fetchedAgents, fetchedTools, fetchedSkills] = await Promise.all([
                getAgents(),
                getTools(),
                getSkills()
            ]);
            setAgents(fetchedAgents);
            setAvailableTools(fetchedTools);
            setAvailableSkills(fetchedSkills);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        listAgents();
    }, [listAgents]);

    const handleToolToggle = (toolId: string) => {
        setSelectedTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
    };

    const handleSkillToggle = (skillId: string) => {
        setSelectedSkills(prev => prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]);
    };

    const saveAgent = async () => {
        if (!name || !persona) {
            alert("Please provide a name and a persona for your agent.");
            return;
        }

        const agentData = {
            name,
            persona,
            tools: selectedTools,
            skills: selectedSkills,
            category,
            visibility,
        };

        try {
            if (editingAgent) {
                const updatedAgent = await updateAgent(editingAgent.id, agentData);
                setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
            } else {
                const newAgent = await createAgent(agentData);
                setAgents([...agents, newAgent]);
            }
            setIsDeployed(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const downloadAgentAIX = (agent: AIXAgent) => {
        const aixConfig: AIXGeneratorConfig = {
            name: agent.name,
            role: agent.persona,
            description: agent.persona,
            skillIDs: agent.skills,
            icon: '🤖',
            persona: personaInstructions,
            model: selectedModel,
            temperature,
        };
        
        const aixContent = generateAIX(aixConfig);
        const filename = createAIXFilename(agent.name);
        downloadAIX(aixContent, filename);
    };

    const handleDeleteAgent = async (agentId: string) => {
        try {
            await deleteAgent(agentId);
            setAgents(agents.filter(a => a.id !== agentId));
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const requestDeploy = () => {
        if (!name || !persona) return;
        setIsConfirmingDeploy(true);
    };

    const resetForm = () => {
        setName('');
        setPersona('');
        setSelectedTools([]);
        setSelectedSkills([]);
        setCategory('general');
        setVisibility('private');
        setIsDeployed(false);
        setPersonaInstructions('');
        setSelectedModel('gemini-2.0-flash');
        setTemperature(0.7);
    };

    if (!user) {
        return <div className="h-full w-full flex items-center justify-center bg-bg-tertiary rounded-b-md text-white"><p className="text-text-secondary">Please sign in to access Agent Forge</p></div>;
    }

    if (isDeployed) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 text-center animate-fade-in">
                 <SparklesIcon className="w-20 h-20 text-green-400 mb-4" />
                 <h1 className="font-display text-3xl font-bold">Deployment Successful!</h1>
                 <button onClick={() => setIsDeployed(false)} className="mt-6 px-6 py-3 font-bold rounded-lg bg-primary-blue hover:brightness-110 transition-all">Forge Another Agent</button>
                 <button onClick={onClose} className="mt-2 px-6 py-2 text-sm rounded-lg hover:bg-white/10 transition-all">Close</button>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3"><AgentForgeIcon className="w-8 h-8 text-amber-400"/><h1 className="font-display text-2xl font-bold">Agent Forge</h1></header>
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
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
                                            <span className="text-2xl flex-shrink-0">🤖</span>
                                            <div className="min-w-0 flex-grow">
                                                <p className="font-semibold text-sm truncate">{agent.name}</p>
                                                <p className="text-xs text-text-secondary truncate">{agent.persona}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => {
                                                    setEditingAgent(agent);
                                                    setName(agent.name);
                                                    setPersona(agent.persona);
                                                    setSelectedTools(agent.tools);
                                                    setSelectedSkills(agent.skills);
                                                    setCategory(agent.category);
                                                    setVisibility(agent.visibility);
                                                }}
                                                className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                                                title="Edit agent"
                                            >
                                                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                            </button>
                                            <button
                                                onClick={() => downloadAgentAIX(agent)}
                                                className="p-1 hover:bg-primary-blue/20 rounded transition-colors"
                                                title="Download AIX"
                                            >
                                                <DownloadIcon className="w-4 h-4 text-primary-blue" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAgent(agent.id)}
                                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                title="Delete agent"
                                            >
                                                <TrashIcon className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Agent Configuration Form */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold font-display text-primary-cyan">Basic Information</h2>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Agent Persona *</label>
                                <input
                                    type="text"
                                    value={persona}
                                    onChange={(e) => setPersona(e.target.value)}
                                    placeholder="e.g., Content Creator, Data Analyst, Travel Planner"
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary-blue focus:outline-none"
                                />
                                <p className="text-xs text-text-muted mt-1">Describe what your agent does</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        setIsSuggesting(true);
                                        const suggestion = await suggestAgentPersona(persona);
                                        setPersona(suggestion);
                                        setIsSuggesting(false);
                                    }}
                                    disabled={!persona || isSuggesting}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    {isSuggesting ? 'Generating...' : 'AI Suggest Persona'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Agent Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., ContentBot, DataPro, VoyageAI"
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary-blue focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Icon Emoji</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        maxLength={2}
                                        className="w-20 px-3 py-2 text-center text-2xl bg-black/30 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary-blue focus:outline-none"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {['🤖', '🧠', '💡', '🚀', '⚡', '🎯', '🔮', '✨'].map((e) => (
                                            <button
                                                key={e}
                                                onClick={() => setIcon(e)}
                                                className="p-2 text-xl hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* MCP Tools & Capabilities */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold font-display text-primary-cyan">MCP Tools & Capabilities</h2>
                            <p className="text-sm text-text-secondary">Select the tools and skills your agent can use via Model Context Protocol</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {skills.map((skill) => {
                                    const Icon = skill.icon;
                                    const isSelected = selectedSkills.has(skill.id);
                                    return (
                                        <button
                                            key={skill.id}
                                            onClick={() => handleSkillToggle(skill.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                isSelected
                                                    ? 'border-primary-cyan bg-primary-cyan/10'
                                                    : 'border-white/10 bg-black/20 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-cyan/20' : 'bg-white/5'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-semibold text-sm">{skill.name}</h3>
                                                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{skill.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex-shrink-0 text-primary-cyan">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="text-sm text-text-secondary">
                                Selected: {selectedSkills.size} tool{selectedSkills.size !== 1 ? 's' : ''}
                            </div>
                        </section>

                        {/* Advanced Configuration */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold font-display text-primary-cyan">Advanced Configuration</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-purple-400">⚙️</span>
                                        Model Selection
                                    </h3>
                                    <select 
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary-blue focus:outline-none text-sm"
                                    >
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-amber-400">🎯</span>
                                        Temperature: {temperature.toFixed(1)}
                                    </h3>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-text-muted mt-1">
                                        <span>Precise</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-green-400">🎭</span>
                                    Persona & System Instructions
                                </h3>
                                <textarea
                                    value={personaInstructions}
                                    onChange={(e) => setPersonaInstructions(e.target.value)}
                                    placeholder="Define your agent's personality, tone, and behavior. Example: You are a friendly, helpful assistant specializing in..."
                                    rows={4}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary-blue focus:outline-none text-sm resize-none"
                                ></textarea>
                                <p className="text-xs text-text-muted mt-1">Optional: Leave blank for auto-generated instructions</p>
                            </div>
                        </section>
                    </div>
                </main>
                
                {/* Sidebar: Preview & Deploy */}
                <aside className="w-full lg:w-80 flex-shrink-0 border-l border-border-color flex flex-col p-4 gap-4">
                    <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-border-color">
                        <h2 className="text-lg font-bold font-display">Live Preview</h2>
                        <div className="flex flex-col items-center text-center gap-3 p-4 rounded-lg bg-gradient-to-br from-primary-cyan/10 to-primary-purple/10 border border-primary-cyan/20">
                            <div className="flex items-center justify-center size-16 bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 rounded-xl border border-white/10">
                                <span className="text-4xl">{icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{name || 'Unnamed Agent'}</h3>
                                <p className="text-sm text-text-secondary">{role || 'No role defined'}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                {Array.from(selectedSkills).slice(0, 6).map((skillId) => {
                                    const skill = skills.find(s => s.id === skillId);
                                    const Icon = skill?.icon;
                                    return Icon ? (
                                        <div key={skillId} className="p-1.5 bg-white/10 rounded" title={skill?.name}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    ) : null;
                                })}
                                {selectedSkills.size > 6 && (
                                    <div className="p-1.5 bg-white/10 rounded text-xs">
                                        +{selectedSkills.size - 6}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-text-secondary uppercase">Agent Stats</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-center">
                                <div className="text-2xl font-bold text-primary-cyan">{selectedSkills.size}</div>
                                <div className="text-xs text-text-secondary">Tools</div>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-center">
                                <div className="text-2xl font-bold text-amber-400">{agents.length}</div>
                                <div className="text-xs text-text-secondary">Deployed</div>
                            </div>
                        </div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Visibility</label><select value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'public')} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"><option value="private">Private</option><option value="public">Public</option></select></div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="mt-auto space-y-2">
                        <button
                            onClick={requestDeploy}
                            disabled={!name || !role}
                            className="w-full px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Deploy Agent
                        </button>
                        <button
                            onClick={resetForm}
                            className="w-full px-6 py-2 font-semibold rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                        >
                            Reset Form
                        </button>
                    </div>
                </aside>
            </div>
            <ConfirmationDialog isOpen={isConfirmingDeploy} onClose={() => setIsConfirmingDeploy(false)} onConfirm={saveAgent} title="Confirm Agent Deployment" message={`Are you sure you want to deploy agent "${name}"? It will be saved to your collection.`} confirmText="Deploy"/>
        </div>
    );
};

export default AgentForgeApp;
