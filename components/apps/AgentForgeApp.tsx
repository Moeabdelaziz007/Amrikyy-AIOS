import React, { useState, useEffect, useCallback } from 'react';
import { AIXAgent, getAgents, createAgent, deleteAgent, getTools, getSkills, Tool, Skill } from '../../services/agentService';
import { AgentForgeIcon, SparklesIcon, TrashIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationDialog from '../ConfirmationDialog';

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
    const [loading, setLoading] = useState(true);

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
        const newAgentData = {
            name,
            persona,
            tools: selectedTools,
            skills: selectedSkills,
            category,
            visibility,
        };

        try {
            const newAgent = await createAgent(newAgentData);
            setAgents([...agents, newAgent]);
            setIsDeployed(true);
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
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
                    {loading ? <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>
                    : agents.length === 0 ? <p className="text-sm text-text-secondary">No agents yet</p>
                    : <div className="space-y-2">{agents.map((agent) => (<div key={agent.id} className="p-3 bg-black/20 rounded-lg border border-border-color hover:border-primary-blue/50 transition-colors"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2 flex-grow min-w-0"><span className="text-2xl flex-shrink-0">🤖</span><div className="min-w-0 flex-grow"><p className="font-semibold text-sm truncate">{agent.name}</p><p className="text-xs text-text-secondary truncate">{agent.persona}</p></div></div><button onClick={() => handleDeleteAgent(agent.id)} className="p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0" title="Delete agent"><TrashIcon className="w-4 h-4 text-red-400" /></button></div></div>))}</div>}
                </aside>
                <main className="flex-grow p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold font-display mb-4">Create New Agent</h2>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Persona</label><textarea value={persona} onChange={(e) => setPersona(e.target.value)} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue" rows={3}></textarea></div>
                        <div>
                            <h3 className="text-lg font-bold mt-4 mb-2">Tools</h3>
                            <div className="grid grid-cols-2 gap-2">{availableTools.map(tool => (<button key={tool.id} onClick={() => handleToolToggle(tool.id)} className={`p-2 rounded-md text-left ${selectedTools.includes(tool.id) ? 'bg-primary-blue' : 'bg-black/20'}`}>{tool.name}</button>))}</div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mt-4 mb-2">Skills</h3>
                            <div className="grid grid-cols-2 gap-2">{availableSkills.map(skill => (<button key={skill.id} onClick={() => handleSkillToggle(skill.id)} className={`p-2 rounded-md text-left ${selectedSkills.includes(skill.id) ? 'bg-primary-blue' : 'bg-black/20'}`}>{skill.name}</button>))}</div>
                        </div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue" /></div>
                        <div><label className="block text-sm font-medium text-text-secondary mb-1">Visibility</label><select value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'public')} className="w-full bg-black/20 border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"><option value="private">Private</option><option value="public">Public</option></select></div>
                    </div>
                </main>
                <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col p-4 gap-6"><div className="mt-auto"><button onClick={requestDeploy} className="w-full px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50" disabled={!name || !persona}>Deploy Agent</button></div></aside>
            </div>
            <ConfirmationDialog isOpen={isConfirmingDeploy} onClose={() => setIsConfirmingDeploy(false)} onConfirm={saveAgent} title="Confirm Agent Deployment" message={`Are you sure you want to deploy agent "${name}"? It will be saved to your collection.`} confirmText="Deploy"/>
        </div>
    );
};

export default AgentForgeApp;
