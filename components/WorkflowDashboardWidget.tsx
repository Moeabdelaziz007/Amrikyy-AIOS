import React from 'react';
import { WorkflowIcon } from './Icons.tsx';
import { AppID } from '../types.ts';

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
 * A widget for the dashboard that displays workflow-related actions.
 * @param {WorkflowDashboardWidgetProps} props - The props for the component.
 * @returns {JSX.Element} The rendered WorkflowDashboardWidget component.
 */
const WorkflowDashboardWidget: React.FC<WorkflowDashboardWidgetProps> = ({ onOpenApp }) => {
    return (
        <div className="glass-effect p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Workflow Status</h3>
            <button
                onClick={() => onOpenApp(AppID.workflow)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                Open Workflow Studio
            </button>
        </div>
    );
};

export default WorkflowDashboardWidget;
