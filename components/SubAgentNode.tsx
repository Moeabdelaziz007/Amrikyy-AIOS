import React from 'react';
import { SubAgent } from '../types';
import { SparklesIcon } from './Icons';

/**
 * Props for the SubAgentNode component.
 */
interface SubAgentNodeProps {
    /** The sub-agent object containing name and icon. */
    subAgent: SubAgent;
    /** A brief description of the sub-agent's current task or purpose. */
    description: string;
    /** The current status of the sub-agent ('Completed', 'Active', 'Pending'). */
    status: 'Completed' | 'Active' | 'Pending';
    /** Optional inline CSS styles to apply to the node. */
    style?: React.CSSProperties;
}

/**
 * Defines the styling properties for different sub-agent statuses.
 */
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

/**
 * The SubAgentNode component displays a visual card for a sub-agent within a workflow.
 * It shows the agent's icon, name, description, and current status with corresponding styling.
 * @param {SubAgentNodeProps} props - The component props.
 * @returns {JSX.Element} The SubAgentNode component.
 */
const SubAgentNode: React.FC<SubAgentNodeProps> = ({ subAgent, description, status, style }) => {
    const Icon = subAgent.icon;
    const styles = statusStyles[status];

    return (
        <div 
            className={`relative w-48 h-48 p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 bg-bg-secondary shadow-lg animate-node-fade-in ${styles.borderColor}`}
            style={style}
            role="status" // ARIA role for status information
            aria-label={`${subAgent.name} is ${status}: ${description}`}
        >
             <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${styles.bgColor} ${styles.textColor}`}>
                {status}
            </div>
            <div className={`p-3 rounded-full ${styles.bgColor}`}>
                <Icon className={`w-10 h-10 ${styles.textColor}`} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-center text-text-primary">{subAgent.name}</h3>
            <p className="text-xs text-center text-text-secondary">{description}</p>
            {status === 'Active' && (
                <SparklesIcon className={`absolute bottom-2 w-5 h-5 animate-pulse ${styles.textColor}`} aria-hidden="true" />
            )}
        </div>
    );
};

export default React.memo(SubAgentNode);