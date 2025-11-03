import React from 'react';
import { WorkflowIcon } from '../Icons.tsx';
import { AppID } from '../../types.ts';

/**
 * Props for the WorkflowDashboardWidget component.
 */
interface WorkflowDashboardWidgetProps {
    /**
     * Callback function to open an application by its ID.
     * @param {AppID} appId - The ID of the application to open.
     */
    onOpenApp: (appId: AppID) => void;
}

/**
 * WorkflowDashboardWidget - Displays workflow automation status and quick actions
 */
const WorkflowDashboardWidget: React.FC<WorkflowDashboardWidgetProps> = ({ onOpenApp }) => {
    return (
        <div className="bg-bg-secondary rounded-lg p-4 border border-border-color">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <WorkflowIcon className="w-5 h-5 text-primary-purple" />
                    <h3 className="font-semibold text-white">Workflows</h3>
                </div>
                <button
                    onClick={() => onOpenApp(AppID.workflow)}
                    className="text-xs text-primary-cyan hover:text-primary-purple transition-colors"
                >
                    View All
                </button>
            </div>
            <div className="space-y-2">
                <div className="text-sm text-text-secondary">
                    <p>No active workflows</p>
                    <p className="text-xs mt-1">Create automated workflows in Workflow Studio</p>
                </div>
            </div>
        </div>
    );
};

export default WorkflowDashboardWidget;