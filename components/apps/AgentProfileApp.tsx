import React from 'react';
import { CustomAgent } from '../../types';
import { skills } from '../../data/skills';

interface AgentProfileAppProps {
  agent: CustomAgent;
}

const AgentProfileApp: React.FC<AgentProfileAppProps> = ({ agent }) => {
  const equippedSkills = skills.filter(s => agent.skillIDs.includes(s.id));

  // Simplified hologram effect for custom agents
  const glowColor = '#00f0ff'; // Default cyan
  const aberrationColors = ['#00f0ff', '#f000b8']; // Cyan, Pink

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
        <div className="max-w-md w-full">
            <div 
                className={`relative p-5 rounded-xl overflow-hidden border border-white/10 bg-black/20 animate-hologram-glow`}
                style={{ '--glow-color': glowColor } as React.CSSProperties}
            >
                <div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                    style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${glowColor}1A 2px, ${glowColor}1A 4px)` }}
                />
                 <div 
                    className="relative z-10 animate-hologram-flicker"
                    style={{ filter: `drop-shadow(2px 0 0 ${aberrationColors[0]}70) drop-shadow(-2px 0 0 ${aberrationColors[1]}70)` }}
                >
                    <div className={`flex items-center justify-between mb-4 text-primary-cyan`} style={{ textShadow: `0 0 5px ${glowColor}, 0 0 10px ${glowColor}`}}>
                        <h2 className="text-xl font-bold tracking-widest">{agent.name.toUpperCase()}</h2>
                        <span className="text-4xl">{agent.icon}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold">{agent.name}</h1>
            <p className="text-primary-cyan font-semibold">{agent.role}</p>
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
                 {equippedSkills.length === 0 && <p className="text-sm text-text-muted">No skills equipped.</p>}
            </div>
        </div>
    </div>
  );
};

export default AgentProfileApp;