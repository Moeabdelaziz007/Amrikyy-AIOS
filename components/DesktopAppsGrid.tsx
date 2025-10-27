import React from 'react';
import { AppID } from '../types';

interface AppDef {
    id: AppID;
    name: string;
    icon: React.FC<{ className: string }>;
}

interface DesktopAppsGridProps {
    onOpen: (appId: AppID) => void;
    apps: AppDef[];
}

const DesktopAppsGrid: React.FC<DesktopAppsGridProps> = ({ onOpen, apps }) => {
    return (
        <div className="w-full max-w-4xl p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
                {apps.map(app => {
                    const Icon = app.icon;
                    return (
                        <button
                            key={app.id}
                            onClick={() => onOpen(app.id)}
                            title={`Open ${app.name}`}
                            className="group flex flex-col items-center justify-center text-center gap-2 p-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                        >
                            <div className="flex items-center justify-center size-16 bg-black/20 rounded-2xl shadow-lg border border-white/10 group-hover:border-[var(--accent-color)]/50 transition-colors duration-300 backdrop-blur-sm">
                                <Icon className="text-4xl text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs font-medium text-white/90">{app.name}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default React.memo(DesktopAppsGrid);