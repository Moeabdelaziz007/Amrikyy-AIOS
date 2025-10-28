import React from 'react';
import { Task } from '../types';

/**
 * Props for the TasksWidget component.
 */
interface TasksWidgetProps {
    /** An array of task objects to display. */
    tasks: Task[];
}

/**
 * The TasksWidget displays a list of outstanding tasks, typically on a dashboard.
 * It shows the task description and its completion status.
 * @param {TasksWidgetProps} props - The component props.
 * @returns {JSX.Element} The TasksWidget component.
 */
const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks }) => {
    return (
        <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-400 text-lg">task_alt</span>
                    <h2 className="font-medium text-sm">My Tasks</h2>
                </div>
            </div>
            <div className="space-y-2 p-4">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                        {/* Checkbox is read-only as task completion logic is handled elsewhere,
                            e.g., in a dedicated Task Management app. */}
                        <input type="checkbox" checked={task.completed} readOnly className="size-4 rounded bg-white/10 border-white/20 accent-rose-400" />
                        <label className={`text-sm ${task.completed ? 'line-through text-text-muted' : ''}`}>{task.text}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksWidget;