import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentID, Workflow, TravelPlan, WorkflowNode, WorkflowConnection, ExecutionLogEntry } from '../../types.ts';
import { agents } from '../../data/agents.ts';
import { generateTravelPlan, executeDynamicWorkflow } from '../../services/geminiAdvancedService.ts';
import { SparklesIcon, SendIcon } from '../Icons.tsx';
import SubAgentNode from '../SubAgentNode.tsx';

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

const NodeComponent: React.FC<{ node: Node; onDrag: (id: string, x: number, y: number) => void; onStartConnect: (nodeId: string, pos: 'left' | 'right') => void; onEndConnect: (nodeId: string) => void; }> = ({ node, onDrag, onStartConnect, onEndConnect }) => {
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
            onMouseDown={handleMouseDown}
            style={{ left: node.x, top: node.y, borderColor: agent.hologram.glow }}
            className={`absolute p-3 rounded-lg bg-bg-secondary border-2 cursor-move shadow-lg transition-all flex items-center gap-2`}
        >
            <div 
                className="connector absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 hover:bg-accent" 
                onMouseDown={() => onStartConnect(node.id, 'left')}
                onMouseUp={() => onEndConnect(node.id)}
            />
            <div 
                className="connector absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-500 hover:bg-accent"
                onMouseDown={() => onStartConnect(node.id, 'right')}
                onMouseUp={() => onEndConnect(node.id)}
            />
            
            <span className="text-2xl">{agent.icon}</span>
            <div>
                <p className="font-bold text-sm">{agent.name}</p>
                <p className="text-xs text-text-muted">{node.description || agent.role}</p>
            </div>
        </div>
    );
};

const ExecutionView: React.FC<{ workflow: Workflow, executingDetails: any, onComplete?: (result: any) => void }> = ({ workflow, executingDetails, onComplete }) => {
    const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        const execute = async () => {
            let result: TravelPlan | null = null;
            if (workflow.title.includes('Travel Plan')) {
                setStatus('Generating Travel Plan with AI...');
                result = await generateTravelPlan(executingDetails);
            } else {
                setStatus('Executing dynamic workflow...');
                const logResult = await executeDynamicWorkflow(executingDetails?.prompt || workflow.title);
                setLogs(logResult);
            }
            
            setStatus('Workflow Completed.');
            if (onComplete) {
                onComplete(result);
            }
        };
        execute();
    }, [workflow, executingDetails, onComplete]);
    
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/50">
            <h2 className="text-2xl font-bold font-display mb-4">{workflow.title}</h2>
            <div className="flex gap-4 mb-8">
                {workflow.nodes.map((node, i) => (
                    <SubAgentNode key={node.id} subAgent={{name: agentMap[node.agentId].name, icon: () => <span>{agentMap[node.agentId].icon}</span>}} description={node.description} status={ i < logs.length ? 'Completed' : i === logs.length ? 'Active' : 'Pending'}/>
                ))}
            </div>
            <p className="font-mono text-primary-cyan animate-pulse">{status}</p>
        </div>
    );
};


const WorkflowStudioApp: React.FC<WorkflowStudioAppProps> = ({ workflow, isExecuting, onComplete, executingDetails }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<WorkflowConnection[]>([]);
    const [connecting, setConnecting] = useState<{ from: string; fromPos: 'left' | 'right' } | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const agentData = e.dataTransfer.getData('application/json');
        if (!agentData) return;
        const agent = JSON.parse(agentData) as Agent;
        const rect = e.currentTarget.getBoundingClientRect();
        const newNode: Node = {
            id: `node-${Date.now()}`,
            agentId: agent.id,
            description: agent.role,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        setNodes(prev => [...prev, newNode]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleNodeDrag = (id: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    };
    
    const handleStartConnect = (nodeId: string, fromPos: 'left' | 'right') => {
        setConnecting({ from: nodeId, fromPos });
    };

    const handleEndConnect = (nodeId: string) => {
        if (connecting && connecting.from !== nodeId) {
            setConnections(prev => [...prev, { from: connecting.from, to: nodeId }]);
        }
        setConnecting(null);
    };


    if (isExecuting && workflow) {
        return <ExecutionView workflow={workflow} executingDetails={executingDetails} onComplete={onComplete} />;
    }

    return (
        <div className="h-full w-full flex bg-bg-secondary rounded-b-md">
            <aside className="w-64 border-r border-border-color p-4 space-y-3 overflow-y-auto">
                <h2 className="font-bold font-display text-lg">Agents</h2>
                {agents.map(agent => <DraggableAgent key={agent.id} agent={agent} />)}
            </aside>
            <main className="flex-1 relative" onDrop={handleDrop} onDragOver={handleDragOver}>
                <svg className="absolute w-full h-full pointer-events-none">
                    {connections.map((conn, i) => {
                        const fromNode = nodes.find(n => n.id === conn.from);
                        const toNode = nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;
                        return <line key={i} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="white" strokeWidth="2" />;
                    })}
                </svg>
                {nodes.map(node => (
                    <NodeComponent key={node.id} node={node} onDrag={handleNodeDrag} onStartConnect={handleStartConnect} onEndConnect={handleEndConnect} />
                ))}
            </main>
        </div>
    );
};

export default WorkflowStudioApp;