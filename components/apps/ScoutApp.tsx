import React from 'react';
import { Agent } from '../../types';
import HologramCard from '../HologramCard';
import { agents } from '../../data/agents';
import { skills } from '../../data/skills';

const scoutAgent = agents.find(a => a.id === 'scout') as Agent;
const equippedSkills = skills.filter(s => scoutAgent.skillIDs.includes(s.id));

const ScoutApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
        <div className="max-w-md w-full">
            <HologramCard agent={scoutAgent} />
        </div>
        <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold">{scoutAgent.name}</h1>
            <p className="text-primary-purple font-semibold">{scoutAgent.role}</p>
            <p className="text-text-secondary mt-2">
                Scout is your tireless deal hunter. He constantly scans thousands of sources to find the best prices on flights, hotels, and activities, ensuring you never miss a great deal.
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
    </div>
  );
};

export default ScoutApp;