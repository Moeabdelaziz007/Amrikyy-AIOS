import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentID, Workflow, TravelPlan, WorkflowNode, WorkflowConnection, ExecutionLogEntry } from '../../types';
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
    }, [isDragging, handleMouseMove]);
}