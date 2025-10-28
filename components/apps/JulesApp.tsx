import React, { useState } from 'react';
import { Agent } from '../../types.ts';
import HologramCard from '../HologramCard.tsx';
import { agents } from '../../data/agents.ts';
import { skills } from '../../data/skills.ts';
import { runSystemDiagnostics } from '../../services/geminiAdvancedService.ts';

const julesAgent = agents.find(a => a.id === 'jules') as Agent;
const equippedSkills = skills.filter(s => julesAgent.skillIDs.includes(s.id));

const JulesApp: React.FC = () => {
    const [status, setStatus] = useState('Idle. Press "Run Diagnostics" to start.');
    const [isLoading, setIsLoading] = useState(false);

    const handleRunDiagnostics = async () => {
        setIsLoading(true);
        setStatus('Scanning system...');
        try {
            const report = await runSystemDiagnostics();
            setStatus(report);
        } catch (error) {
            setStatus('Error: Could not run diagnostics.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
        <div className="max-w-md w-full">
            <HologramCard agent={julesAgent} />
        </div>
        <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold">{julesAgent.name}</h1>
            <p className="text-green-400 font-semibold">{julesAgent.role}</p>
            <p className="text-text-secondary mt-2">
                Jules is the core system diagnostics and self-healing agent. He monitors OS performance, debugs issues, and ensures system stability.
            </p>
        </div>
        <div className="max-w-md w-full mt-4">
            <h2 className="text-xl font-bold font-display text-center mb-3">Equipped Skills</h2>
            <div className="flex justify-center flex-wrap gap-4 p-4 bg-black/20 rounded-lg border border-white/10">
                {equippedSkills.map(skill => {
                    const Icon = skill.icon;
                    return (
                        <div key={skill.id} title={skill.name} className="flex flex-col items-center gap-2 text-text-secondary hover:text-text-primary transition-colors w-20 text-center">
                            <Icon className="w-10 h-10" />
                            <span className="text-xs">{skill.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
        <div className="max-w-md w-full mt-2 text-center">
            <button 
                onClick={handleRunDiagnostics}
                disabled={isLoading}
                className="px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
                {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </button>
            <div className="font-mono text-sm mt-4 text-green-300 min-h-[6rem] bg-black/20 p-3 rounded-lg border border-green-500/20 text-left">
                <p className="font-bold mb-2">Status Report:</p>
                <pre className="whitespace-pre-wrap text-xs">
                    {isLoading ? <span className="animate-pulse">Scanning system...</span> : status}
                </pre>
            </div>
        </div>
    </div>
  );
};

export default JulesApp;