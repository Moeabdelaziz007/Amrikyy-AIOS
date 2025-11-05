import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { Button } from './Button';

export interface AgentNode extends Node {
  type: 'trigger' | 'action' | 'condition' | 'data';
  label: string;
  description?: string;
  config?: Record<string, any>;
}

export interface AgentEdge extends Edge {
  label?: string;
  condition?: string;
}

export interface AgentCanvasProps {
  initialNodes?: AgentNode[];
  initialEdges?: AgentEdge[];
  onNodesChange?: (nodes: AgentNode[]) => void;
  onEdgesChange?: (edges: AgentEdge[]) => void;
  onSave?: (data: { nodes: AgentNode[]; edges: AgentEdge[] }) => void;
  readOnly?: boolean;
  className?: string;
}

const nodeTypes = {
  trigger: ({ data }: { data: AgentNode['data'] }) => (
    <div className="px-4 py-3 bg-green-100 border-2 border-green-500 rounded-lg text-green-800 font-medium">
      {data.label}
    </div>
  ),
  action: ({ data }: { data: AgentNode['data'] }) => (
    <div className="px-4 py-3 bg-blue-100 border-2 border-blue-500 rounded-lg text-blue-800 font-medium">
      {data.label}
    </div>
  ),
  condition: ({ data }: { data: AgentNode['data'] }) => (
    <div className="px-4 py-3 bg-yellow-100 border-2 border-yellow-500 rounded-lg text-yellow-800 font-medium">
      {data.label}
    </div>
  ),
  data: ({ data }: { data: AgentNode['data'] }) => (
    <div className="px-4 py-3 bg-purple-100 border-2 border-purple-500 rounded-lg text-purple-800 font-medium">
      {data.label}
    </div>
  ),
};

const AgentCanvas: React.FC<AgentCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onSave,
  readOnly = false,
  className,
}) => {
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(initialEdges);
  const [isDirty, setIsDirty] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodesChangeInternal = useCallback(
    (changes: any) => {
      onNodesChangeHandler(changes);
      setIsDirty(true);
    },
    [onNodesChangeHandler]
  );

  const onEdgesChangeInternal = useCallback(
    (changes: any) => {
      onEdgesChangeHandler(changes);
      setIsDirty(true);
    },
    [onEdgesChangeHandler]
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({ nodes, edges });
      setIsDirty(false);
    }
  }, [nodes, edges, onSave]);

  const handleAddNode = useCallback((type: AgentNode['type']) => {
    const newNode: AgentNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: '',
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setIsDirty(true);
  }, [setNodes]);

  const stats = useMemo(() => ({
    nodes: nodes.length,
    edges: edges.length,
    triggers: nodes.filter(n => n.type === 'trigger').length,
    actions: nodes.filter(n => n.type === 'action').length,
    conditions: nodes.filter(n => n.type === 'condition').length,
    dataNodes: nodes.filter(n => n.type === 'data').length,
  }), [nodes, edges]);

  return (
    <div className={cn('h-full w-full relative', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger': return '#10b981';
              case 'action': return '#3b82f6';
              case 'condition': return '#eab308';
              case 'data': return '#a855f7';
              default: return '#6b7280';
            }
          }}
          className="bg-white"
        />
        
        <Panel position="top-left" className="bg-white border rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Agent Workflow Canvas</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span className="font-medium">{stats.nodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Edges:</span>
                  <span className="font-medium">{stats.edges}</span>
                </div>
              </div>
            </div>

            {!readOnly && (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Add Node:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddNode('trigger')}
                      className="text-xs"
                    >
                      Trigger
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddNode('action')}
                      className="text-xs"
                    >
                      Action
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddNode('condition')}
                      className="text-xs"
                    >
                      Condition
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddNode('data')}
                      className="text-xs"
                    >
                      Data
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!isDirty || !onSave}
                  size="sm"
                  className="w-full"
                >
                  {isDirty ? 'Save Changes' : 'Saved'}
                </Button>
              </div>
            )}
          </div>
        </Panel>

        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            Unsaved changes
          </motion.div>
        )}
      </ReactFlow>
    </div>
  );
};

export default AgentCanvas;
