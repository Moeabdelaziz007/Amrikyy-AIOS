import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CalendarIcon, DriveIcon, GmailIcon } from '../Icons';
import { CalendarEvent, DriveFile, GmailMessage } from '../../types';

/**
 * Props for the WorkspaceHubWidget component.
 */
interface WorkspaceHubWidgetProps {
    /** Indicates if the Google account is connected. */
    isConnected: boolean;
    /** An array of calendar events to display. */
    events: CalendarEvent[];
    /** An array of drive files to display. */
    files: DriveFile[];
    /** An array of Gmail messages to display. */
    messages: GmailMessage[];
}

/**
 * The WorkspaceHubWidget provides a quick overview of a user's integrated Google Workspace data.
 * It displays upcoming calendar events, recent Drive files, and important Gmail messages.
 * If not connected, it prompts the user to connect their Google account.
 * @param {WorkspaceHubWidgetProps} props - The component props.
 * @returns {JSX.Element} The WorkspaceHubWidget component.
 */
const WorkspaceHubWidget: React.FC<WorkspaceHubWidgetProps> = ({ isConnected, events, files, messages }) => {
    const { t } = useLanguage();
    
    /**
     * Formats an ISO string into a localized time string (e.g., "10:30 AM").
     * @param {string} isoString - The ISO date string to format.
     * @returns {string} The formatted time string.
     */
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isConnected) {
        return (
            <div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400 text-lg">workspaces</span>
                        <h2 className="font-medium text-sm">{t('workspace_widget.title')}</h2>
                    </div>
                </div>
                <div className="p-4 text-center text-xs text-text-muted">
                    {t('workspace_widget.not_connected')}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-lg">workspaces</span>
                    <h2 className="font-medium text-sm">{t('workspace_widget.title')}</h2>
                </div>
            </div>
            <div className="space-y-4 p-4">
                {/* Calendar */}
                <div>
                    <h3 className="text-xs font-bold text-text-secondary flex items-center gap-1.5 mb-2"><CalendarIcon className="text-sm"/> {t('workspace_widget.calendar')}</h3>
                    <div className="space-y-2 text-xs">
                        {events.length > 0 ? events.map(event => (
                            <div key={event.id} className="p-2 bg-black/20 rounded-md">
                                <p className="font-semibold truncate">{event.summary}</p>
                                <p className="text-text-muted">{formatTime(event.start)} - {formatTime(event.end)}</p>
                            </div>
                        )) : <p className="text-xs text-text-muted">No upcoming events.</p>}
                    </div>
                </div>
                {/* Drive */}
                <div>
                    <h3 className="text-xs font-bold text-text-secondary flex items-center gap-1.5 mb-2"><DriveIcon className="text-sm"/> {t('workspace_widget.drive')}</h3>
                     <div className="space-y-2 text-xs">
                        {files.length > 0 ? files.map(file => (
                            <a key={file.id} href={file.link} target="_blank" rel="noopener noreferrer" className="block p-2 bg-black/20 rounded-md font-medium truncate hover:bg-white/10">
                                {file.name}
                            </a>
                        )) : <p className="text-xs text-text-muted">No recent files.</p>}
                    </div>
                </div>
                 {/* Gmail */}
                <div>
                    <h3 className="text-xs font-bold text-text-secondary flex items-center gap-1.5 mb-2"><GmailIcon className="text-sm"/> {t('workspace_widget.gmail')}</h3>
                     <div className="space-y-2 text-xs">
                        {messages.length > 0 ? messages.map(msg => (
                           <p key={msg.id} className="p-2 bg-black/20 rounded-md font-medium truncate">{msg.snippet}</p>
                        )) : <p className="text-xs text-text-muted">No important messages.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceHubWidget;