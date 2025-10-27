import React from 'react';
import { Agent } from '../types';

interface HologramCardProps {
    agent: Agent;
}

const HologramCard: React.FC<HologramCardProps> = ({ agent }) => {
    
    const GlitchText: React.FC<{ text: string }> = ({ text }) => (
        <div className="relative" data-text={text}>
            {text}
            <div className="absolute top-0 left-0 w-full h-full animate-glitch-anim opacity-80" style={{ 
                textShadow: `-2px 0 ${agent.hologram.aberrationColors[0]}`, 
                clipPath: 'rect(24px, 550px, 90px, 0)'
            }}>
                {text}
            </div>
             <div className="absolute top-0 left-0 w-full h-full animate-glitch-anim opacity-80" style={{ 
                textShadow: `2px 0 ${agent.hologram.aberrationColors[1]}`,
                animationDirection: 'reverse',
                clipPath: 'rect(85px, 550px, 140px, 0)'
            }}>
                {text}
            </div>
        </div>
    );

    return (
        <div 
            className={`relative p-5 rounded-xl overflow-hidden border border-white/10 bg-black/20 animate-hologram-glow`}
            style={{ '--glow-color': agent.hologram.glow } as React.CSSProperties}
        >
            <div 
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                style={{
                    background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${agent.hologram.glow}1A 2px, ${agent.hologram.glow}1A 4px)`
                }}
            />

            <div 
                className="relative z-10 animate-hologram-flicker"
                style={{
                    filter: `drop-shadow(2px 0 0 ${agent.hologram.aberrationColors[0]}70) drop-shadow(-2px 0 0 ${agent.hologram.aberrationColors[1]}70)`
                }}
            >
                <div className={`flex items-center justify-between mb-4 ${agent.hologram.color}`} style={{ textShadow: `0 0 5px ${agent.hologram.glow}, 0 0 10px ${agent.hologram.glow}`}}>
                    <h2 className="text-xl font-bold tracking-widest">{agent.name.toUpperCase()} ACTIVE</h2>
                    <span className="text-4xl">{agent.icon}</span>
                </div>
                
                <div className="h-20 my-4 flex items-center justify-center opacity-50">
                    <svg width="100%" height="100%" viewBox="0 0 200 80">
                        <defs>
                            <filter id={`glow-${agent.id}`}>
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <g style={{ filter: `url(#glow-${agent.id})`}}>
                            <circle cx="20" cy="40" r="4" fill={agent.hologram.glow} className="animate-pulse" style={{animationDelay: '0.1s'}} />
                            <circle cx="80" cy="20" r="4" fill={agent.hologram.glow} className="animate-pulse" style={{animationDelay: '0.3s'}} />
                            <circle cx="80" cy="60" r="4" fill={agent.hologram.glow} className="animate-pulse" style={{animationDelay: '0.4s'}} />
                            <circle cx="140" cy="40" r="4" fill={agent.hologram.glow} className="animate-pulse" style={{animationDelay: '0.6s'}} />
                            <circle cx="180" cy="40" r="4" fill={agent.hologram.glow} className="animate-pulse" style={{animationDelay: '0.8s'}} />
                            <path d="M 24 40 H 76" stroke={agent.hologram.glow} strokeWidth="1" fill="none" />
                            <path d="M 84 22 L 136 38" stroke={agent.hologram.glow} strokeWidth="1" fill="none" />
                            <path d="M 84 58 L 136 42" stroke={agent.hologram.glow} strokeWidth="1" fill="none" />
                            <path d="M 144 40 H 176" stroke={agent.hologram.glow} strokeWidth="1" fill="none" />
                        </g>
                    </svg>
                </div>
                
                <div className="w-full bg-black/30 rounded-full h-2.5 my-2">
                    <div className="h-2.5 rounded-full" style={{ width: `${agent.tasks * 1.5}%`, backgroundColor: agent.hologram.glow, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                <div className={`mt-2 text-sm font-mono ${agent.hologram.color}`}>
                    <GlitchText text={agent.hologram.task} />
                </div>
            </div>
        </div>
    );
};

export default React.memo(HologramCard);