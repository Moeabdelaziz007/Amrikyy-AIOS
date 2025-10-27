import React from 'react';
import { Agent } from '../../types';
import HologramCard from '../HologramCard';
import { agents } from '../../data/agents';
import { skills } from '../../data/skills';

const lunaAgent = agents.find(a => a.id === 'luna') as Agent;
const equippedSkills = skills.filter(s => lunaAgent.skillIDs.includes(s.id));

const LunaApp: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
        <div className="max-w-md w-full">
            <HologramCard agent={lunaAgent} />
        </div>
        <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold">{lunaAgent.name}</h1>
            <p className="text-primary-cyan font-semibold">{lunaAgent.role}</p>
            <p className="text-text-secondary mt-2">
                Luna is your dedicated trip planning specialist. She analyzes flight routes, finds the best accommodations, and crafts perfect itineraries based on your preferences.
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

export default LunaApp;