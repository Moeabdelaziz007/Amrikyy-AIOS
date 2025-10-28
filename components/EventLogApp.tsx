import React, { useState, useEffect, useRef } from 'react';
import { agents } from '../data/agents';
import { AgentID, LogEntry } from '../types';

/**
 * Mock data for system event logs, simulating agent-to-agent communications and actions.
 * Includes different types of log entries: standard, insight, and proactive-offer.
 */
const mockLogs: Omit<LogEntry, 'id' | 'timestamp'>[] = [
    { from: 'orion', message: 'Workflow "Paris Trip" initiated by user.', type: 'standard' },
    { from: 'echo', to: 'luna', message: 'Insight: User frequently researches European history. Luna, consider adding cultural landmark visits to travel plans for Rome.', type: 'insight' }, // Proactive insight
    { from: 'orion', to: 'luna', message: 'Tasked with itinerary generation.', type: 'standard' },
    { from: 'luna', to: 'scout', message: 'Requesting flight & hotel data for Paris.', type: 'standard' },
    { from: 'scout', message: 'Querying Google Flights API...', type: 'standard' },
    { from: 'scout', to: 'luna', message: 'Flight data package sent.', type: 'standard' },
    { from: 'luna', message: 'Itinerary draft complete. Sending to Orion.', type: 'standard' },
    { from: 'karim', to: 'scout', message: 'Offer: Scout, I detect budget constraints on "Tokyo Trip". Can you find a similar quality hotel for 15% less?', type: 'proactive-offer' }, // Proactive request
    { from: 'orion', to: 'karim', message: 'Tasked with budget optimization.', type: 'standard' },
    { from: 'karim', message: 'Budget finalized. Submitting to Orion.', type: 'standard' },
    { from: 'orion', to: 'maya', message: 'Compiling final plan for user view.', type: 'standard' },
    { from: 'maya', message: 'Workflow "Paris Trip" completed successfully.', type: 'standard' },
];

/**
 * A mapping of agent IDs to their full agent objects for easy lookup.
 */
const agentMap = agents.reduce((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
}, {} as Record<AgentID, (typeof agents)[0]>);

/**
 * The EventLogApp component displays a real-time stream of agent-to-agent communications and system events.
 * It simulates a "Communication Bus" where AI agents interact and log their activities.
 * @returns {JSX.Element} The EventLogApp component.
 */
const EventLogApp: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Effect to simulate streaming of log entries over time.
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
        }, 1500); // Add a new log entry every 1.5 seconds

        return () => clearInterval(interval);
    }, []);

    // Effect to scroll to the bottom of the log whenever new entries are added.
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full w-full flex flex-col bg-black font-mono rounded-b-md text-sm">
            <header className="flex-shrink-0 p-3 border-b border-green-500/30 bg-green-500/10 text-green-300">
                <h1 className="font-bold">[LIVE] Agent-to-Agent Communication Bus <span className="material-symbols-outlined text-sm align-text-bottom">hub</span></h1>
                <p className="text-xs text-green-200 mt-1">Observing proactive insights and dynamic task delegation between AI agents.</p>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-2">
                    {logs.map(log => {
                        const fromAgent = agentMap[log.from];
                        const toAgent = log.to ? agentMap[log.to] : null;
                        
                        let messageClass = "text-gray-200";
                        let messagePrefixIcon = "";
                        if (log.type === 'insight') {
                            messageClass = "text-blue-300 italic";
                            messagePrefixIcon = "💡 ";
                        } else if (log.type === 'proactive-offer') {
                            messageClass = "text-yellow-300 font-semibold";
                            messagePrefixIcon = "🤝 ";
                        }

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
                                    <span className={`${messageClass}`}>: {messagePrefixIcon}{log.message}</span>
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