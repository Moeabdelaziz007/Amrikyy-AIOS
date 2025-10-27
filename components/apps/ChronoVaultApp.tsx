import React, { useState, useEffect } from 'react';
import { ChronoVaultIcon, SparklesIcon, SendIcon } from '../Icons';
import { useMemory } from '../../contexts/MemoryContext';
import { Engram } from '../../types';
import QuantumFoamBackground from '../QuantumFoamBackground';

interface Node extends Engram {
    x: number;
    y: number;
}

const ChronoVaultApp: React.FC = () => {
    const { engrams, connections, reasoningPaths, triggerReasoning, synthesizeNewMemory, collapseEngram, isSynthesizing } = useMemory();
    const [prompt, setPrompt] = useState('');

    const nodes: Node[] = engrams.map((engram, i) => {
        const angle = (i / engrams.length) * 2 * Math.PI + Math.PI / 4;
        const radius = Math.min(35, 20 + engrams.length * 1.5);
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        return { ...engram, x, y };
    });

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    useEffect(() => {
        const superpositionEngrams = engrams.filter(e => e.potentiality === 0);
        if (superpositionEngrams.length > 0) {
            const timer = setTimeout(() => {
                superpositionEngrams.forEach(e => collapseEngram(e.id));
            }, 3000); // Collapse after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [engrams, collapseEngram]);

    const handleSynthesize = async () => {
        if (!prompt || isSynthesizing) return;
        await synthesizeNewMemory(prompt);
        setPrompt('');
    };

    return (
        <div className="h-full w-full flex flex-col bg-transparent rounded-b-md text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/50 -z-20"></div>
            <QuantumFoamBackground />
            <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center gap-3 bg-black/30 backdrop-blur-sm">
                <ChronoVaultIcon className="w-8 h-8 text-primary-purple"/>
                <h1 className="font-display text-2xl font-bold">Quantum Reasoning Engine</h1>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <main className="flex-grow p-4 md:p-6 flex flex-col">
                     <div className="relative flex-grow rounded-lg overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                            {/* Static Connections */}
                            {connections.map((conn, i) => {
                                const fromNode = nodeMap.get(conn.from);
                                const toNode = nodeMap.get(conn.to);
                                if (!fromNode || !toNode) return null;
                                return <line key={`c-${i}`} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className="stroke-white/10" strokeWidth="0.3" />;
                            })}
                             {/* Reasoning Paths */}
                            {reasoningPaths.map((path, i) => {
                                const fromNode = nodeMap.get(path.from);
                                const toNode = nodeMap.get(path.to);
                                if (!fromNode || !toNode) return null;
                                return <path key={`r-${i}`} d={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`} className="stroke-primary-cyan animate-reasoning-path" strokeWidth="0.5" strokeDasharray="5" />;
                            })}
                            {/* Nodes */}
                            {nodes.map(node => (
                                <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group" onClick={() => triggerReasoning(node.id)}>
                                    {node.potentiality === 0 ? (
                                        <circle r="4" fill={node.color} className="animate-superposition" />
                                    ) : (
                                        <>
                                            <circle r="5" fill={node.color} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                                            <circle r="2.5" fill={node.color} />
                                        </>
                                    )}
                                    <text y="5" textAnchor="middle" className="fill-white/80 text-[1.5px] font-mono group-hover:fill-white transition-colors">{node.label}</text>
                                </g>
                            ))}
                        </svg>
                     </div>
                </main>
                 <aside className="w-full md:w-80 flex-shrink-0 bg-black/30 backdrop-blur-sm p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto space-y-6">
                    <div>
                        <h2 className="text-xl font-bold font-display mb-3 flex items-center gap-2"><SparklesIcon className="text-primary-pink"/>Reasoning Engine</h2>
                        <p className="text-sm text-text-secondary mb-3">Ask the AI to analyze its memories and synthesize a new insight.</p>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., What common theme exists in my recent activities?"
                            rows={3}
                            className="w-full bg-black/20 border border-white/10 rounded-md p-2 focus:ring-1 focus:ring-primary-pink focus:outline-none text-sm resize-none"
                        />
                        <button onClick={handleSynthesize} disabled={isSynthesizing || !prompt} className="w-full flex items-center justify-center gap-2 py-2 mt-2 font-semibold rounded-lg bg-primary-pink text-white hover:brightness-110 transition-colors disabled:opacity-50">
                             {isSynthesizing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon />}
                            Synthesize Insight
                        </button>
                    </div>
                 </aside>
            </div>
        </div>
    );
};
export default ChronoVaultApp;