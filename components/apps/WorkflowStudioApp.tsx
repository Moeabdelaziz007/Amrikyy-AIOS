import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentID, Workflow, TravelPlan, WorkflowNode, ExecutionLogEntry } from '../../types';
import { agents } from '../../data/agents';
import { generateTravelPlan, executeDynamicWorkflow } from '../../services/geminiAdvancedService';
import { SparklesIcon, SendIcon } from '../Icons';

interface WorkflowStudioAppProps {
    workflow?: Workflow;
    isExecuting?: boolean;
    onComplete?: (result: any) => void;
    executingDetails?: any;
}

const agentMap: Record<string, Agent> = agents.reduce((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
}, {} as Record<string, Agent>);

interface Node extends WorkflowNode {
    x: number;
    y: number;
}
interface Connection { from: string; to: string; }

const DraggableAgent: React.FC<{ agent: Agent }> = ({ agent }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('application/json', JSON.stringify(agent));
    };
    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center gap-3 p-2 rounded-lg bg-bg-primary hover:bg-accent hover:text-white cursor-grab transition-colors"
        >
            <span className="text-2xl">{agent.icon}</span>
            <div>
                <p className="font-bold text-sm">{agent.name}</p>
                <p className="text-xs text-text-muted">{agent.role}</p>
            </div>
        </div>
    );
};

const NodeComponent: React.FC<{ node: Node; onDrag: (id: string, x: number, y: number) => void; onStartConnect: (nodeId: string, output: 'top' | 'bottom' | 'left' | 'right') => void; onEndConnect: (nodeId: string) => void; }> = ({ node, onDrag, onStartConnect, onEndConnect }) => {
    const agent = agentMap[node.agentId];
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if((e.target as HTMLElement).closest('.connector')) return;
        setIsDragging(true);
        dragOffset.current = { x: e.clientX - node.x, y: e.clientY - node.y };
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            onDrag(node.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
        }
    }, [isDragging, onDrag, node.id]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className="absolute p-4 w-48 bg-bg-secondary border-2 border-border-color rounded-xl shadow-lg select-none"
            style={{ left: node.x, top: node.y, cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{agent.icon}</span>
                <p className="font-bold">{agent.name}</p>
            </div>
            <textarea
                defaultValue={node.description}
                placeholder="Task description..."
                className="w-full h-16 bg-black/20 text-xs p-1 rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="connector absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full cursor-pointer" onMouseDown={() => onStartConnect(node.id, 'top')} onMouseUp={() => onEndConnect(node.id)} />
            <div className="connector absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full cursor-pointer" onMouseDown={() => onStartConnect(node.id, 'bottom')} onMouseUp={() => onEndConnect(node.id)} />
        </div>
    );
};

const WorkflowStudioApp: React.FC<WorkflowStudioAppProps> = ({ workflow: initialWorkflow, isExecuting, onComplete, executingDetails }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [connecting, setConnecting] = useState<{ from: string; fromOutput: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
    const [executionLog, setExecutionLog] = useState<ExecutionLogEntry[] | null>(null);


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const agent = JSON.parse(e.dataTransfer.getData('application/json')) as Agent;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        const newNode: Node = {
            id: `node-${Date.now()}`,
            agentId: agent.id,
            description: `Execute ${agent.role}`,
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
        };
        setNodes(prev => [...prev, newNode]);
    };

    const updateNodePosition = (id: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    };

    const handleStartConnect = (nodeId: string, output: 'top' | 'bottom' | 'left' | 'right') => {
        const node = nodes.find(n => n.id === nodeId);
        if(!node) return;
        const x = node.x + 96;
        const y = output === 'top' ? node.y : node.y + 136;
        setConnecting({ from: nodeId, fromOutput: output, x , y });
    };

    const handleEndConnect = (nodeId: string) => {
        if (connecting && connecting.from !== nodeId) {
            setConnections(prev => [...prev, { from: connecting.from, to: nodeId }]);
        }
        setConnecting(null);
    };
    
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if(connecting) {
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;
            setConnecting(prev => prev ? {...prev, x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top} : null);
        }
    };
    
    const getNodePos = (nodeId: string, end: 'start' | 'end') => {
        const node = nodes.find(n => n.id === nodeId);
        if(!node) return {x: 0, y: 0};
        const x = node.x + 96; // center of node
        const y = end === 'start' ? node.y + 136 : node.y; // bottom or top connector
        return { x, y };
    };

    const handleRunWorkflow = async () => {
        setIsExecutingWorkflow(true);
        setExecutionLog(null);
        try {
            const workflowNodes = nodes.map(({ x, y, ...node }) => node);
            const log = await executeDynamicWorkflow(workflowNodes, connections);
            setExecutionLog(log);
        } catch (e: any) {
            console.error(e);
            setExecutionLog([{step: 0, thought: 'An error occurred during orchestration.', action: 'Execution Failed', result: e.message || 'Unknown error.'}]);
        } finally {
            setIsExecutingWorkflow(false);
        }
    };

    if (initialWorkflow) {
        // --- VIEWER MODE ---
        return <WorkflowViewer workflow={initialWorkflow} isExecuting={isExecuting} onComplete={onComplete} executingDetails={executingDetails} />
    }
    
    // --- BUILDER MODE ---
    return (
        <div className="h-full w-full flex flex-col lg:flex-row bg-bg-tertiary rounded-b-md text-white p-4 gap-4 overflow-hidden">
            <aside className="w-full lg:w-64 flex-shrink-0 bg-black/20 rounded-lg border border-border-color p-3 space-y-3 overflow-y-auto h-48 lg:h-auto">
                <h2 className="font-display font-bold text-lg">Agents</h2>
                <div className="flex flex-row lg:flex-col gap-2">
                    {agents.map(agent => <DraggableAgent key={agent.id} agent={agent} />)}
                </div>
            </aside>
            <main className="flex-grow flex flex-col gap-4 overflow-hidden">
                 <header className="flex-shrink-0 flex justify-between items-center p-2 bg-black/20 rounded-lg border border-border-color">
                    <h1 className="font-display text-2xl font-bold">Workflow Builder</h1>
                    <button onClick={handleRunWorkflow} disabled={isExecutingWorkflow || nodes.length === 0} className="flex items-center gap-2 px-4 py-2 font-bold rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isExecutingWorkflow ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SendIcon className="w-5 h-5" />}
                        {isExecutingWorkflow ? 'Executing...' : 'Smart Execute'}
                    </button>
                 </header>
                 <div className="flex-grow flex gap-4 overflow-hidden">
                    <div ref={canvasRef} onDragOver={handleDragOver} onDrop={handleDrop} onMouseMove={handleCanvasMouseMove} onMouseUp={() => setConnecting(null)} className="relative flex-grow bg-black/20 rounded-lg border-2 border-dashed border-border-color overflow-hidden">
                        {nodes.length === 0 && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-muted">Drop agents here to start building</p>}
                        
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            {connections.map((c, i) => {
                                const startPos = getNodePos(c.from, 'start');
                                const endPos = getNodePos(c.to, 'end');
                                return <path key={i} d={`M ${startPos.x} ${startPos.y} C ${startPos.x} ${startPos.y + 50}, ${endPos.x} ${endPos.y - 50}, ${endPos.x} ${endPos.y}`} stroke="#8B5CF6" strokeWidth="3" fill="none" />
                            })}
                            {connecting && <path d={`M ${getNodePos(connecting.from, 'start').x} ${getNodePos(connecting.from, 'start').y} L ${connecting.x} ${connecting.y}`} stroke="#3B82F6" strokeWidth="3" fill="none" strokeDasharray="5,5" />}
                        </svg>

                        {nodes.map(node => (
                            <NodeComponent key={node.id} node={node} onDrag={updateNodePosition} onStartConnect={handleStartConnect} onEndConnect={handleEndConnect} />
                        ))}
                    </div>
                    {executionLog && (
                        <div className="w-96 flex-shrink-0 bg-black/20 rounded-lg border border-border-color p-3 flex flex-col animate-slide-in-right">
                            <h2 className="font-display font-bold text-lg mb-2 flex-shrink-0">Orchestration Log</h2>
                            <div className="flex-grow overflow-y-auto space-y-4 text-xs font-mono pr-2">
                                {executionLog.map(entry => (
                                    <div key={entry.step} className="border-b border-white/10 pb-2 last:border-b-0">
                                        <p className="text-primary-cyan font-bold">[Step {entry.step}] Thought:</p>
                                        <p className="text-white/80 pl-2 leading-relaxed">{entry.thought}</p>
                                        <p className="text-primary-purple font-bold mt-1">[Action]:</p>
                                        <p className="text-white/80 pl-2 leading-relaxed">{entry.action}</p>
                                        <p className="text-green-400 font-bold mt-1">[Result]:</p>
                                        <p className="text-white/80 pl-2 leading-relaxed">{entry.result}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
            </main>
        </div>
    );
};

const WorkflowViewer: React.FC<WorkflowStudioAppProps> = ({ workflow, isExecuting, onComplete, executingDetails }) => {
    const [currentStep, setCurrentStep] = useState(isExecuting ? 0 : -1);
    const [finalPlan, setFinalPlan] = useState<TravelPlan | null>(null);

    useEffect(() => {
        if (!isExecuting || !workflow) return;
        const runWorkflow = async () => {
            for (let i = 0; i < workflow.nodes.length; i++) {
                setCurrentStep(i);
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            if (workflow.title.includes("Travel Plan")) {
                const plan = await generateTravelPlan(executingDetails);
                setFinalPlan(plan);
                if(onComplete) onComplete(plan);
            }
            setCurrentStep(workflow.nodes.length);
        };
        runWorkflow();
    }, [isExecuting, workflow, onComplete, executingDetails]);

    const getStatus = (stepIndex: number): 'Completed' | 'Active' | 'Pending' => {
        if (currentStep === -1) return 'Pending';
        if (stepIndex < currentStep) return 'Completed';
        if (stepIndex === currentStep && currentStep < (workflow?.nodes.length || 0)) return 'Active';
        if (currentStep === (workflow?.nodes.length || 0)) return 'Completed';
        return 'Pending';
    };

     return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-bg-tertiary rounded-b-md text-white p-4 gap-4 overflow-y-auto">
            <h1 className="font-display text-2xl font-bold mb-6 text-center">{workflow!.title}</h1>
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-4 lg:gap-12">
                 <svg className="absolute top-0 left-0 w-full h-full -z-0 hidden md:block">
                    {workflow!.connections.map((connection, index) => {
                        const fromNodeIndex = workflow!.nodes.findIndex(n => n.id === connection.from);
                        return <path key={index} d={`M ${112 + fromNodeIndex * 208} 96 H ${208 + fromNodeIndex * 208}`} stroke="#8B5CF6" strokeWidth="3" fill="none" />
                    })}
                 </svg>
                 {workflow!.nodes.map((node, index) => {
                     const agent = agentMap[node.agentId];
                     const Icon = SparklesIcon; // Placeholder, real icon would need more logic
                     return (
                         <div key={node.id} className={`z-10 relative w-48 h-48 p-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 bg-bg-secondary shadow-lg ${getStatus(index) === 'Active' ? 'border-accent' : 'border-border-color'}`}>
                             <div className="p-3 rounded-full bg-accent/20"><Icon className="w-10 h-10 text-accent" /></div>
                             <h3 className="font-bold text-center text-text-primary">{agent.name}</h3>
                             <p className="text-xs text-center text-text-secondary">{node.description}</p>
                         </div>
                     );
                 })}
            </div>
            <div className="h-20 mt-8">
               {finalPlan ? (
                   <div className="mt-8 flex items-center gap-2 py-2 px-5 text-green-400 animate-fade-in">✅ Workflow Completed</div>
               ) : (
                   <div className="mt-8 flex items-center gap-2 py-2 px-5 text-text-secondary animate-fade-in">
                       <div className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full ${isExecuting ? 'animate-spin' : ''}`}></div>
                       <span>{isExecuting ? 'AI Agents are working...' : 'Waiting for workflow...'}</span>
                   </div>
               )}
            </div>
        </div>
    );
};

export default WorkflowStudioApp;