import React, { useState } from 'react';
import { Project, Message, SharedContent } from '../../types';
import { CreatorStudioIcon, SendIcon } from '../Icons';
import { Content } from '@google/genai';
import { generateResponse } from '../../services/geminiService';
import { agents } from '../../data/agents';

type Tab = 'dashboard' | 'ai_assistant' | 'new_project';

const atlasAgent = agents.find(a => a.id === 'atlas');

interface CreatorStudioAppProps {
    projects: Project[];
    onAddProject: (project: Project) => void;
    onShare: (content: SharedContent) => void;
}

const CreatorStudioApp: React.FC<CreatorStudioAppProps> = ({ projects, onAddProject, onShare }) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-2">
                 <div className="flex items-center gap-3">
                    <CreatorStudioIcon className="w-8 h-8 text-amber-400"/>
                    <h1 className="font-display text-2xl font-bold">Creator Studio</h1>
                </div>
                <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-full sm:w-auto">
                    <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} label="Dashboard" />
                    <TabButton id="ai_assistant" activeTab={activeTab} setActiveTab={setActiveTab} label="AI Assistant" />
                    <TabButton id="new_project" activeTab={activeTab} setActiveTab={setActiveTab} label="New Project" />
                </nav>
            </header>
            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                {activeTab === 'dashboard' && <DashboardView projects={projects} onShare={onShare} />}
                {activeTab === 'ai_assistant' && <AIAssistantView />}
                {activeTab === 'new_project' && <NewProjectView onAddProject={onAddProject} setActiveTab={setActiveTab} />}
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

const DashboardView: React.FC<{ projects: Project[], onShare: (content: SharedContent) => void }> = ({ projects, onShare }) => {
    const totalEarnings = projects.reduce((sum, p) => sum + p.earnings, 0);
    const activeProjects = projects.filter(p => p.status === 'Active').length;

    const statusColors: Record<Project['status'], string> = {
        Active: 'bg-green-500 text-green-50',
        Paused: 'bg-yellow-500 text-yellow-50',
        Completed: 'bg-gray-500 text-gray-50',
    };
    
    // Mock data for the chart
    const earningsData = [150, 400, 300, 800, 750, 1250, 1500];
    const maxEarning = Math.max(...earningsData, 1);

    const handleShare = (project: Project) => {
        onShare({
            type: 'project',
            title: project.name,
            subtitle: project.description,
            cta: "Check Out My New Project"
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                    <h3 className="text-sm text-text-secondary">Total Earnings</h3>
                    <p className="text-3xl font-bold">${totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                    <h3 className="text-sm text-text-secondary">Active Projects</h3>
                    <p className="text-3xl font-bold">{activeProjects}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                    <h3 className="text-sm text-text-secondary">Avg. Project Value</h3>
                    <p className="text-3xl font-bold">${(projects.length > 0 ? totalEarnings / projects.length : 0).toFixed(2)}</p>
                </div>
            </div>
             <div className="bg-black/20 p-4 rounded-lg border border-border-color">
                <h3 className="text-lg font-bold mb-4">Earnings This Week</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                    {earningsData.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                            <div className="w-full bg-gradient-to-t from-amber-500/50 to-amber-500/10 rounded-t-md group-hover:from-amber-400/50 group-hover:to-amber-400/10 transition-colors" style={{ height: `${(val / maxEarning) * 100}%` }} />
                             <span className="text-xs text-text-muted mt-1">Day {i+1}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-2">My Projects</h3>
                <div className="space-y-3">
                    {projects.map(p => (
                        <div key={p.id} className="bg-black/20 p-4 rounded-lg border border-border-color flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h4 className="font-bold">{p.name}</h4>
                                <p className="text-xs text-text-secondary">{p.description}</p>
                            </div>
                             <div className="flex items-center gap-4 self-end sm:self-center">
                                <span className="font-semibold">${p.earnings.toLocaleString()}</span>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${statusColors[p.status]}`}>
                                    {p.status}
                                </span>
                                <button onClick={() => handleShare(p)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10" aria-label={`Share ${p.name}`}>
                                    <span className="material-symbols-outlined text-base">share</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AIAssistantView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'ai', text: `Hello! I am ${atlasAgent?.name}, your business and monetization strategist. How can I help you grow your venture today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const history: Content[] = []; 
        const responseText = await generateResponse(`As a business strategist named Atlas, answer this: ${input}`, history);
        
        const aiMessage: Message = { id: `ai-${Date.now()}`, sender: 'ai', text: responseText };
        setMessages(prev => [...prev, aiMessage]);
        setInput('');
        setIsLoading(false);
    };

    return (
         <div className="h-full w-full max-w-2xl mx-auto flex flex-col bg-bg-secondary rounded-lg border border-border-color">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                 {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-600 flex items-center justify-center text-2xl">{atlasAgent?.icon}</div>}
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-bg-tertiary'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && <div className="text-sm p-3 rounded-lg bg-bg-tertiary">...</div>}
            </div>
             <div className="p-4 border-t border-border-color">
                <div className="relative">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for business advice..." disabled={isLoading} className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-5 pr-14 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 disabled:bg-gray-500"><SendIcon className="h-5 w-5 text-white" /></button>
                </div>
            </div>
        </div>
    );
};

const NewProjectView: React.FC<{ onAddProject: (p: Project) => void, setActiveTab: (tab: Tab) => void }> = ({ onAddProject, setActiveTab }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !description) return;

        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description,
            status: 'Active',
            earnings: 0,
        };
        onAddProject(newProject);
        setActiveTab('dashboard');
    };

    return (
        <div className="max-w-md mx-auto">
             <h2 className="text-2xl font-bold font-display text-center mb-6">Launch a New Venture</h2>
             <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-black/20 rounded-lg border border-border-color">
                <div>
                    <label htmlFor="proj-name" className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                    <input type="text" id="proj-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-accent focus:outline-none"/>
                </div>
                 <div>
                    <label htmlFor="proj-desc" className="block text-sm font-medium text-text-secondary mb-1">Brief Description</label>
                    <textarea id="proj-desc" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-accent focus:outline-none resize-none"/>
                </div>
                <button type="submit" className="w-full py-2 font-bold rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 transition-all">Create Project</button>
             </form>
        </div>
    );
};

export default CreatorStudioApp;