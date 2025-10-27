
import React from 'react';
import { SubAgent } from '../types';
import { SparklesIcon } from './Icons';

interface SubAgentNodeProps {
    subAgent: SubAgent;
    description: string;
    status: 'Completed' | 'Active' | 'Pending';
    style?: React.CSSProperties;
}

const statusStyles = {
    Completed: {
        borderColor: 'border-green-500',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/20',
    },
    Active: {
        borderColor: 'border-blue-500',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
    },
    Pending: {
        borderColor: 'border-gray-500',
        textColor: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
    }
};

const SubAgentNode: React.FC<SubAgentNodeProps> = ({ subAgent, description, status, style }) => {
    const Icon = subAgent.icon;
    const styles = statusStyles[status];

    return (
        <div 
            className={`relative w-48 h-48 p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 bg-bg-secondary shadow-lg animate-node-fade-in ${styles.borderColor}`}
            style={style}
        >
             <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${styles.bgColor} ${styles.textColor}`}>
                {status}
            </div>
            <div className={`p-3 rounded-full ${styles.bgColor}`}>
                <Icon className={`w-10 h-10 ${styles.textColor}`} />
            </div>
            <h3 className="font-bold text-center text-text-primary">{subAgent.name}</h3>
            <p className="text-xs text-center text-text-secondary">{description}</p>
            {status === 'Active' && (
                <SparklesIcon className={`absolute bottom-2 w-5 h-5 animate-pulse ${styles.textColor}`} />
            )}
        </div>
    );
};

export default React.memo(SubAgentNode);
