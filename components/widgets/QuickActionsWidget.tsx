import React from 'react';
import { AppID } from '../../types';
import { CreatorStudioIcon, TripIcon, ImageIcon, WorkflowIcon } from '../Icons';

/**
 * Props for the QuickActionsWidget component.
 */
interface QuickActionsWidgetProps {
  /**
   * Callback function to open an application by its ID when an action button is clicked.
   * @param {AppID} appId - The ID of the application to open.
   */
  onOpenApp: (appId: AppID) => void;
}

/**
 * The QuickActionsWidget displays a grid of commonly used application shortcuts.
 * Users can click these buttons to quickly launch a specific application or initiate a task.
 * @param {QuickActionsWidgetProps} props - The component props.
 * @returns {JSX.Element} The QuickActionsWidget component.
 */
const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onOpenApp }) => {
  /**
   * Defines the list of quick actions, including their ID, label, icon, and accent color.
   */
  const actions = [
    { id: 'creatorStudio', label: 'New Project', icon: CreatorStudioIcon, color: 'text-amber-400' },
    { id: 'travelAgent', label: 'Plan a Trip', icon: TripIcon, color: 'text-cyan-400' },
    { id: 'image', label: 'Generate Image', icon: ImageIcon, color: 'text-pink-400' },
    { id: 'workflow', label: 'Start Workflow', icon: WorkflowIcon, color: 'text-purple-400' },
  ] as const; // `as const` ensures `id` is treated as specific AppID literals

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-400 text-lg">bolt</span>
          <h2 className="font-medium text-sm">Quick Actions</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onOpenApp(action.id)}
              className="p-3 bg-black/20 rounded-lg flex flex-col items-center justify-center gap-1 text-center hover:bg-white/10 transition-colors"
            >
              <Icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-xs font-semibold">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsWidget;