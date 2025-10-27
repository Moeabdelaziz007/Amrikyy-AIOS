import React from 'react';
import { skills } from '../../data/skills';
import { Skill, SkillCategory } from '../../types';
import { SettingsIcon } from '../Icons';

const SkillForgeApp: React.FC = () => {
    
    const categories: SkillCategory[] = ['Language', 'Vision', 'Audio', 'Knowledge', 'Logic'];
    const skillsByCategory = categories.map(category => ({
        category,
        skills: skills.filter(s => s.category === category)
    })).filter(g => g.skills.length > 0);

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-primary-cyan"/>
                <h1 className="font-display text-2xl font-bold">System Skills & Health</h1>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold font-display mb-4">Skill Library</h2>
                    <div className="space-y-6">
                        {skillsByCategory.map(({ category, skills }) => (
                            <div key={category}>
                                <h3 className="font-semibold text-primary-cyan mb-2">{category}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <aside className="w-full md:w-72 flex-shrink-0 bg-black/20 p-4 md:p-6 border-t md:border-t-0 md:border-l border-border-color overflow-y-auto">
                     <h2 className="text-xl font-bold font-display mb-4">System Status</h2>
                     <div className="space-y-4">
                         <HealthMetric label="Cognitive Load" value={38} unit="%" color="cyan" />
                         <HealthMetric label="Communication Latency" value={12} unit="ms" color="purple" />
                         <HealthMetric label="Memory Usage (Engrams)" value={76} unit="%" color="pink" />
                         <button className="w-full mt-4 py-2 font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 active:scale-95 transition-all">
                            Optimize All Skills
                         </button>
                     </div>
                </aside>
            </div>
        </div>
    );
};

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
    const Icon = skill.icon;
    return (
        <div className="bg-bg-secondary p-4 rounded-lg border border-border-color flex flex-col">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-accent" />
                <h4 className="font-bold">{skill.name}</h4>
            </div>
            <p className="text-xs text-text-secondary flex-grow mb-3">{skill.description}</p>
            <button className="w-full text-xs font-semibold py-1 rounded bg-green-500/20 text-green-300 hover:bg-green-500/40 transition-colors">
                Installed
            </button>
        </div>
    );
};

const HealthMetric: React.FC<{label: string; value: number; unit: string; color: string}> = ({ label, value, unit, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">{label}</span>
            <span className="font-bold">{value}{unit}</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2">
            <div className={`h-2 rounded-full`} style={{ width: `${value}%`, background: `var(--primary-${color})`}}></div>
        </div>
    </div>
);

export default SkillForgeApp;