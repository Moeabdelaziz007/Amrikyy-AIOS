import React, { useState, useCallback } from 'react';
import { CognitiveCanvasIcon, SparklesIcon } from '../Icons';
import { expandTopic, getResearchSummary, translateText } from '../../services/geminiAdvancedService';
import { useLanguage } from '../../contexts/LanguageContext';
import { SystemVoice } from '../../types';

interface Node {
    id: string;
    label: string;
    content?: string;
    type: 'main' | 'sub-topic' | 'question';
    x: number;
    y: number;
}

interface CognitiveCanvasAppProps {
    speechSettings: {
        voice: SystemVoice;
        rate: number;
        pitch: number;
    };
}

const CognitiveCanvasApp: React.FC<CognitiveCanvasAppProps> = ({ speechSettings }) => {
    const { t } = useLanguage();
    const [topic, setTopic] = useState('');
    const [nodes, setNodes] = useState<Node[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResearching, setIsResearching] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState<string | null>(null); // New state for translation

    const generateMindMap = async () => {
        if (!topic || isLoading) return;
        setIsLoading(true);
        setNodes([]);
        try {
            const mapData = await expandTopic(topic);
            const newNodes: Node[] = [];
            
            // Main idea node
            const mainNode: Node = { id: 'main', label: mapData.mainIdea, type: 'main', x: 50, y: 50 };
            newNodes.push(mainNode);

            // Sub-topic nodes
            mapData.subTopics.forEach((sub, i) => {
                const angle = (i / mapData.subTopics.length) * 2 * Math.PI;
                newNodes.push({ id: `sub-${i}`, label: sub, type: 'sub-topic', x: 50 + 25 * Math.cos(angle), y: 50 + 15 * Math.sin(angle) });
            });

            // Question nodes
            mapData.questions.forEach((q, i) => {
                const angle = (i / mapData.questions.length) * 2 * Math.PI + Math.PI / 4;
                newNodes.push({ id: `q-${i}`, label: q, type: 'question', x: 50 + 40 * Math.cos(angle), y: 50 + 25 * Math.sin(angle) });
            });

            setNodes(newNodes);

        } catch (error) {
            console.error(error);
            alert("Failed to generate mind map.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResearch = async (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || isResearching) return;
        
        setIsResearching(nodeId);
        try {
            const summary = await getResearchSummary(node.label);
            setNodes(prev => prev.map(n => n.id === nodeId ? {...n, content: summary} : n));
        } catch (error) {
            console.error(error);
        } finally {
            setIsResearching(null);
        }
    };

    // New: Handle translation of node content
    const handleTranslateNode = async (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !node.content || isTranslating) return;

        setIsTranslating(nodeId);
        try {
            // Translate to the current UI language, or 'en' if not available
            const targetLanguageCode = t('language_code'); // Assuming t('language_code') gives 'en', 'ar', etc.
            const translatedContent = await translateText(node.content, targetLanguageCode);
            setNodes(prev => prev.map(n => n.id === nodeId ? {...n, content: translatedContent} : n));
        } catch (error) {
            console.error("Failed to translate node:", error);
        } finally {
            setIsTranslating(null);
        }
    };


    const updateNodeContent = (nodeId: string, newContent: string) => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, content: newContent } : n));
    };

    const mainNode = nodes.find(n => n.type === 'main');

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white overflow-hidden">
            <header className="flex-shrink-0 p-4 border-b border-border-color flex items-center gap-3">
                <CognitiveCanvasIcon className="w-8 h-8 text-purple-400"/>
                <h1 className="font-display text-2xl font-bold">Cognitive Canvas</h1>
            </header>
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="flex-grow relative bg-black/20 overflow-hidden">
                     {nodes.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                            <CognitiveCanvasIcon className="w-24 h-24 text-purple-400/20 mb-4" />
                            <h2 className="text-2xl font-bold font-display">Start a new brainstorming session</h2>
                            <p className="text-text-muted mt-2 max-w-md">Enter a topic and let the AI generate a visual mind map to kickstart your research and note-taking process.</p>
                        </div>
                     ) : (
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ perspective: '1000px' }}>
                            {nodes.filter(n => n.type !== 'main').map(node => (
                                <line key={`line-${node.id}`} x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`} className="stroke-purple-400/20" strokeWidth="0.5" />
                            ))}
                        </svg>
                     )}
                     
                    {nodes.map(node => (
                        <div 
                            key={node.id} 
                            className={`group absolute p-3 rounded-lg border-2 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 shadow-lg hover:shadow-2xl hover:z-10
                                ${node.type === 'main' ? 'bg-purple-600 border-purple-400 w-48 text-center' : ''}
                                ${node.type === 'sub-topic' ? 'bg-bg-secondary border-border-color w-40' : ''}
                                ${node.type === 'question' ? 'bg-bg-secondary border-dashed border-border-color w-40' : ''}
                            `}
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <p className={`font-bold text-sm ${node.type === 'main' ? 'mx-auto' : ''}`}>{node.label}</p>
                                {node.type !== 'main' && (
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleResearch(node.id)}
                                            disabled={!!isResearching}
                                            className="p-1 rounded-full hover:bg-white/10 text-purple-400"
                                            title="Research this topic"
                                        >
                                            {isResearching === node.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-3 h-3" />}
                                        </button>
                                        {node.content && ( // Only show translate button if there is content
                                            <button
                                                onClick={() => handleTranslateNode(node.id)}
                                                disabled={!!isTranslating}
                                                className="p-1 rounded-full hover:bg-white/10 text-primary-cyan"
                                                title="Translate content"
                                            >
                                                {isTranslating === node.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">translate</span>}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {node.content && (
                                 <textarea 
                                    value={node.content}
                                    onChange={(e) => updateNodeContent(node.id, e.target.value)}
                                    className="mt-2 text-xs text-text-secondary bg-transparent w-full h-20 resize-none border-t border-white/10 pt-1 focus:outline-none"
                                />
                            )}
                        </div>
                    ))}
                </div>
                <aside className="w-full md:w-72 flex-shrink-0 bg-black/30 backdrop-blur-sm p-4 border-t md:border-t-0 md:border-l border-border-color flex flex-col gap-4">
                    <h2 className="font-bold font-display text-lg">Controls</h2>
                    <div className="space-y-2">
                        <label htmlFor="topic-input" className="text-sm font-semibold">Brainstorm Topic</label>
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && generateMindMap()}
                            placeholder="e.g., Quantum Computing"
                            className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm focus:ring-1 focus:ring-purple-400 focus:outline-none"
                        />
                    </div>
                     <button onClick={generateMindMap} disabled={isLoading || !topic} className="w-full flex items-center justify-center gap-2 py-2 font-bold rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon />}
                        Generate Mind Map
                    </button>
                    <div className="text-xs text-text-muted mt-2">
                        Click the ✨ icon on a node to get a research summary. You can edit the text on any card.
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default CognitiveCanvasApp;