import React, { useState, useMemo } from 'react';
import { AppID } from '../types';
import { SparklesIcon } from './Icons';

/**
 * Defines the structure for an application definition used in the App Launcher.
 */
interface AppDef {
    /** The unique identifier for the application. */
    id: AppID;
    /** The display name of the application. */
    name: string;
    /** The React component for the application's icon. */
    icon: React.FC<{ className: string }>;
}

/**
 * Props for the AppLauncher component.
 */
interface AppLauncherProps {
    /** Callback function to open an application by its ID. */
    onOpen: (appId: AppID) => void;
    /** Callback function to close the App Launcher. */
    onClose: () => void;
    /** An array of all available applications to display. */
    allApps: AppDef[];
}

/**
 * The AppLauncher component provides a full-screen overlay for browsing and launching applications.
 * It includes a search bar to filter apps and displays them in a grid.
 * @param {AppLauncherProps} props - The component props.
 * @returns {JSX.Element} The rendered AppLauncher component.
 */
const AppLauncher: React.FC<AppLauncherProps> = ({ onOpen, onClose, allApps }) => {
    const [searchTerm, setSearchTerm] = useState('');

    /**
     * Memoized list of applications, filtered by the current search term.
     * Re-calculates only when `searchTerm` or `allApps` changes.
     */
    const filteredApps = useMemo(() => {
        if (!searchTerm) return allApps;
        return allApps.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, allApps]);

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl flex items-center justify-center animate-fade-in"
            onClick={onClose}
            role="dialog" // ARIA role for a dialog
            aria-modal="true" // Indicates that this modal blocks content behind it
            aria-label="App Launcher" // Accessible label for the dialog
        >
            <div 
                className="w-full h-full md:max-w-2xl md:h-[70vh] bg-bg-primary/80 rounded-none md:rounded-2xl border border-border-color shadow-2xl flex flex-col p-4 sm:p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative mb-6">
                    <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <label htmlFor="app-search-input" className="sr-only">Search apps and agents</label> {/* Accessible label for search input */}
                    <input 
                        id="app-search-input" // Connect label to input
                        type="text"
                        placeholder="Search apps and agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-border-color rounded-lg pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none text-base"
                        autoFocus
                        role="searchbox" // ARIA role for a search input
                    />
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                     <div role="grid" aria-label="Applications" className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-6">
                        {filteredApps.map(app => {
                            const Icon = app.icon;
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => onOpen(app.id)}
                                    className="flex flex-col items-center justify-start gap-2 text-center group"
                                    aria-label={`Open ${app.name}`} // Accessible label for each app button
                                >
                                    <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary shadow-lg group-hover:scale-110 group-hover:text-text-primary transition-all duration-200">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs font-medium text-text-primary">{app.name}</span>
                                </button>
                            );
                        })}
                     </div>
                     {filteredApps.length === 0 && (
                        <p className="text-center text-text-muted py-8" role="status">No apps found matching your search.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AppLauncher;