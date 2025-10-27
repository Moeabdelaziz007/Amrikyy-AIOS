import React, { useState, useEffect } from 'react';
import { Alarm, Automation } from '../../types';

type View = 'clock' | 'alarms' | 'automations';
const views: View[] = ['clock', 'alarms', 'automations'];

interface SmartWatchAppProps {
    alarms: Alarm[];
    setAlarms: React.Dispatch<React.SetStateAction<Alarm[]>>;
    automations: Automation[];
    setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
}

const SmartWatchApp: React.FC<SmartWatchAppProps> = (props) => {
    const [time, setTime] = useState(new Date());
    const [activeView, setActiveView] = useState<View>('clock');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCrownClick = () => {
        const currentIndex = views.indexOf(activeView);
        const nextIndex = (currentIndex + 1) % views.length;
        setActiveView(views[nextIndex]);
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-transparent rounded-b-md text-white font-mono p-4">
            <div className="relative w-[320px] h-[360px]">
                {/* Watch Body */}
                <div className="absolute inset-0 bg-zinc-800 rounded-[48px] shadow-2xl border-4 border-zinc-900"></div>
                
                {/* Crown Button */}
                <button onClick={handleCrownClick} className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-12 bg-zinc-700 rounded-full border-2 border-zinc-900 active:bg-zinc-600"></button>

                {/* Screen */}
                <div className="absolute top-4 left-4 right-4 bottom-4 bg-black rounded-[32px] overflow-hidden p-4 flex flex-col">
                    {activeView === 'clock' && <ClockView time={time} />}
                    {activeView === 'alarms' && <AlarmsView {...props} />}
                    {activeView === 'automations' && <AutomationsView {...props} />}
                </div>
            </div>
        </div>
    );
};

const ClockView: React.FC<{ time: Date }> = ({ time }) => {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondAngle = (seconds / 60) * 360;
    const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
    const hourAngle = ((hours % 12 + minutes / 60) / 12) * 360;

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full">
            <svg className="absolute w-full h-full" viewBox="0 0 200 200">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                {/* Seconds Ring */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="var(--accent-color)" strokeWidth="4" strokeDasharray="502" strokeDashoffset={502 - (502 * (seconds/60))} transform="rotate(-90 100 100)" filter="url(#glow)"/>
                 {/* Minutes Ring */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#EC4899" strokeWidth="3" strokeDasharray="440" strokeDashoffset={440 - (440 * (minutes/60))} transform="rotate(-90 100 100)"/>
            </svg>
            <p className="relative text-5xl font-bold tracking-widest text-accent z-10">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
            <p className="relative text-lg text-text-secondary z-10">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
        </div>
    );
};

const AlarmsView: React.FC<SmartWatchAppProps> = ({ alarms, setAlarms }) => {
    const toggleAlarm = (id: string) => {
        setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-xl font-bold text-center mb-4 flex-shrink-0">Alarms</h2>
            <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                {alarms.map(alarm => (
                    <div key={alarm.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg">
                        <div>
                            <p className="text-2xl">{alarm.time}</p>
                            <p className="text-xs text-text-muted">{alarm.label}</p>
                        </div>
                        <div onClick={() => toggleAlarm(alarm.id)} className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${alarm.enabled ? 'bg-accent' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${alarm.enabled ? 'transform translate-x-6' : ''}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AutomationsView: React.FC<SmartWatchAppProps> = ({ automations }) => {
    return (
         <div className="w-full h-full flex flex-col">
            <h2 className="text-xl font-bold text-center mb-4 flex-shrink-0">Automations</h2>
            <div className="flex-grow space-y-2 overflow-y-auto pr-1">
                {automations.map(auto => (
                     <div key={auto.id} className="bg-zinc-900 p-3 rounded-lg">
                        <p className="font-semibold text-accent text-xs">WHEN</p>
                        <p className="text-sm ml-2">{auto.trigger}</p>
                        <p className="font-semibold text-accent mt-1 text-xs">DO</p>
                        <p className="text-sm ml-2">{auto.action.task}</p>
                     </div>
                ))}
                 <p className="text-xs text-center text-text-muted pt-4">Automation creation coming soon.</p>
            </div>
        </div>
    );
};

export default SmartWatchApp;