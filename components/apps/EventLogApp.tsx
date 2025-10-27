import React, { useState, useEffect, useRef } from 'react';
import { agents } from '../../data/agents';
import { AgentID } from '../../types';

interface LogEntry {
    id: number;
    timestamp: string;
    from: AgentID;
    to?: AgentID;
    message: string;
}

const mockLogs: Omit<LogEntry, 'id' | 'timestamp'>[] = [
    { from: 'orion', message: 'Workflow "Paris Trip" initiated by user.' },
    { from: 'orion', to: 'luna', message: 'Tasked with itinerary generation.' },
    { from: 'luna', to: 'scout', message: 'Requesting flight & hotel data for Paris.' },
    { from: 'scout', message: 'Querying Google Flights API...' },
    { from: 'scout', to: 'luna', message: 'Flight data package sent.' },
    { from: 'luna', message: 'Itinerary draft complete. Sending to Orion.' },
    { from: 'orion', to: 'karim', message: 'Tasked with budget optimization.' },
    { from: 'karim', to: 'scout', message: 'Requesting cost-effective alternatives.' },
    { from: 'karim', message: 'Budget finalized. Submitting to Orion.' },
    { from: 'orion', to: 'maya', message: 'Compiling final plan for user view.' },
    { from: 'maya', message: 'Workflow "Paris Trip" completed successfully.' },
];

const agentMap = agents.reduce((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
}, {} as Record<AgentID, (typeof agents)[0]>);

const EventLogApp: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(prevLogs => {
                if (prevLogs.length >= mockLogs.length) {
                    clearInterval(interval);
                    return prevLogs;
                }
                const nextLog = mockLogs[prevLogs.length];
                return [...prevLogs, {
                    ...nextLog,
                    id: Date.now(),
                    timestamp: new Date().toLocaleTimeString(),
                }];
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full w-full flex flex-col bg-black font-mono rounded-b-md text-sm">
            <header className="flex-shrink-0 p-3 border-b border-green-500/30 bg-green-500/10 text-green-300">
                <h1 className="font-bold">[LIVE] Agent-to-Agent Communication Bus</h1>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-2">
                    {logs.map(log => {
                        const fromAgent = agentMap[log.from];
                        const toAgent = log.to ? agentMap[log.to] : null;
                        return (
                            <div key={log.id} className="flex items-start gap-3 animate-fade-in">
                                <span className="text-gray-500">{log.timestamp}</span>
                                <div className="flex-grow">
                                    <span style={{ color: fromAgent.hologram.glow }}>
                                        [{fromAgent.name}]
                                    </span>
                                    {toAgent && (
                                        <>
                                            <span className="text-gray-400"> -&gt; </span>
                                            <span style={{ color: toAgent.hologram.glow }}>
                                                [{toAgent.name}]
                                            </span>
                                        </>
                                    )}
                                    <span className="text-gray-200">: {log.message}</span>
                                </div>
                            </div>
                        )
                    })}
                     <div ref={logEndRef} />
                </div>
            </main>
             <footer className="flex-shrink-0 p-2 border-t border-green-500/30 bg-green-500/10 text-green-300 text-xs text-center">
                <p>Status: <span className="font-bold animate-pulse">STREAMING...</span></p>
            </footer>
        </div>
    );
};

export default EventLogApp;
