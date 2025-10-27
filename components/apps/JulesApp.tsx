import React, { useState } from 'react';
import { Agent } from '../../types';
import HologramCard from '../HologramCard';
import { agents } from '../../data/agents';
import { skills } from '../../data/skills';

const julesAgent = agents.find(a => a.id === 'jules') as Agent;
const equippedSkills = skills.filter(s => julesAgent.skillIDs.includes(s.id));

const JulesApp: React.FC = () => {
    const [status, setStatus] = useState('Idle');

    const runDiagnostics = () => {
        setStatus('Running...');
        setTimeout(() => {
            setStatus('All systems nominal.');
        }, 3000);
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
                onClick={runDiagnostics}
                disabled={status === 'Running...'}
                className="px-6 py-3 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
                {status === 'Running...' ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </button>
            <p className="font-mono text-sm mt-4 text-green-300 h-6">
                Status: {status}
                {status === 'Running...' && <span className="animate-pulse">...</span>}
            </p>
        </div>
    </div>
  );
};

export default JulesApp;