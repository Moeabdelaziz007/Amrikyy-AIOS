import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ControlPanelIcon } from '../Icons';
import { AppID } from '../../types';

interface ControlPanelAppProps {
    onOpenApp: (appId: AppID) => void;
}

const ControlPanelApp: React.FC<ControlPanelAppProps> = ({ onOpenApp }) => {
    const { t } = useLanguage();
    const [dnd, setDnd] = useState(false);
    const [performanceMode, setPerformanceMode] = useState(false);

    const controls = [
        { id: 'dnd', label: 'Do Not Disturb', icon: 'do_not_disturb_on', state: dnd, setState: setDnd },
        { id: 'performance', label: 'Performance Mode', icon: 'speed', state: performanceMode, setState: setPerformanceMode },
    ];
    
    const settingsShortcuts = [
        { id: 'settings', appId: 'settings', label: 'Appearance', icon: 'palette' },
        { id: 'profile', appId: 'settings', label: 'Profile', icon: 'person' },
        { id: 'assistant', appId: 'settings', label: 'AI Assistant', icon: 'smart_toy' },
        { id: 'billing', appId: 'settings', label: 'Subscription', icon: 'credit_card' },
    ] as const;


    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <ControlPanelIcon className="w-8 h-8 text-primary-cyan"/>
                <h1 className="font-display text-2xl font-bold">{t('app_titles.controlPanel')}</h1>
            </header>
            <main className="flex-grow p-4 md:p-6 overflow-y-auto space-y-8">
                 <div>
                    <h2 className="font-bold font-display text-xl mb-4">System Toggles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {controls.map(control => (
                            <div key={control.id} className="bg-black/20 p-4 rounded-lg border border-border-color flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl text-accent">{control.icon}</span>
                                    <span className="font-semibold">{control.label}</span>
                                </div>
                                <div onClick={() => control.setState(!control.state)} className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${control.state ? 'bg-accent' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${control.state ? 'transform translate-x-6' : ''}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div>
                    <h2 className="font-bold font-display text-xl mb-4">Settings Shortcuts</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {settingsShortcuts.map(shortcut => (
                            <button key={shortcut.id} onClick={() => onOpenApp(shortcut.appId)} className="bg-black/20 p-4 rounded-lg border border-border-color flex flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent transition-colors">
                                 <span className="material-symbols-outlined text-3xl">{shortcut.icon}</span>
                                 <span className="font-semibold text-sm">{shortcut.label}</span>
                            </button>
                        ))}
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default ControlPanelApp;
