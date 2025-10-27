import React from 'react';
import { WorkflowIcon } from './Icons';
import { AppID } from '../types';

interface WorkflowDashboardWidgetProps {
    onOpenApp: (appId: AppID) => void;
}

const WorkflowDashboardWidget: React.FC<WorkflowDashboardWidgetProps> = ({ onOpenApp }) => {
    return (
        <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <WorkflowIcon className="text-neon-cyan text-lg" />
                    <h2 className="font-medium text-sm">Active Workflows</h2>
                </div>
                <button onClick={() => onOpenApp('workflow')} className="text-xs bg-neon-cyan/80 hover:bg-neon-cyan text-black font-semibold px-2 py-1 rounded transition-colors">
                    New +
                </button>
            </div>
            <div className="space-y-3 p-4">
                {/* Mock Active Workflow */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-semibold">Generating Travel Plan: Tokyo</p>
                        <p className="text-xs font-mono text-neon-cyan">75%</p>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1">
                        <div className="bg-neon-cyan h-1 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-text-muted mt-1">Agent: Karim - Optimizing Budget</p>
                </div>
            </div>
        </div>
    );
};

export default WorkflowDashboardWidget;