import React from 'react';
import { SparklesIcon, MicrophoneIcon } from './Icons';

type VoiceState = 'idle' | 'listening' | 'speaking';

interface VoiceHologramProps {
    state: VoiceState;
}

const VoiceHologram: React.FC<VoiceHologramProps> = ({ state }) => {
    
    const stateConfig = {
        idle: {
            icon: <SparklesIcon className="w-12 h-12 text-primary-cyan" />,
            text: "AI is ready. Click the button to speak.",
            borderColor: 'border-primary-cyan/30',
            animation: 'animate-voice-pulse',
        },
        listening: {
            icon: <MicrophoneIcon className="w-12 h-12 text-primary-pink" />,
            text: "Listening...",
            borderColor: 'border-primary-pink/50',
            animation: 'animate-pulse',
        },
        speaking: {
            icon: <SparklesIcon className="w-12 h-12 text-primary-purple" />,
            text: "Speaking...",
            borderColor: 'border-primary-purple/40',
            animation: 'animate-voice-pulse',
        }
    };

    const current = stateConfig[state];

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer rings */}
            <div className={`absolute inset-0 rounded-full border-2 ${current.borderColor} ${state === 'listening' ? 'animate-ping' : ''}`} />
            <div className={`absolute inset-4 rounded-full border ${current.borderColor} ${current.animation}`} style={{ animationDelay: '0.5s' }} />
            <div className={`absolute inset-8 rounded-full border-2 ${current.borderColor} ${current.animation}`} />
            
            {/* Core */}
            <div className="w-32 h-32 rounded-full bg-bg-secondary/50 backdrop-blur-sm flex items-center justify-center">
                {current.icon}
            </div>

             <p className="absolute -bottom-8 text-sm text-text-secondary text-center">{current.text}</p>
        </div>
    );
};

export default VoiceHologram;