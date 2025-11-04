import { useState, useCallback, useRef } from 'react';

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface UseWorkflowBuilderReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (node: Omit<WorkflowNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => string;
  deleteEdge: (id: string) => void;
  canConnect: (source: string, target: string) => boolean;
  getNodeById: (id: string) => WorkflowNode | undefined;
  getConnectedNodes: (nodeId: string) => {
    incoming: WorkflowNode[];
    outgoing: WorkflowNode[];
  };
  clear: () => void;
  exportWorkflow: () => { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  importWorkflow: (workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
}

/**
 * Hook for building workflow automation diagrams
 * Inspired by n8n, activepieces, and dify workflow builders
 */
export function useWorkflowBuilder(): UseWorkflowBuilderReturn {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const nodeIdCounter = useRef(0);
  const edgeIdCounter = useRef(0);

  const generateNodeId = useCallback(() => {
    return `node_${++nodeIdCounter.current}`;
  }, []);

  const generateEdgeId = useCallback(() => {
    return `edge_${++edgeIdCounter.current}`;
  }, []);

  const addNode = useCallback(
    (node: Omit<WorkflowNode, 'id'>) => {
      const id = generateNodeId();
      const newNode: WorkflowNode = { ...node, id };
      setNodes((prev) => [...prev, newNode]);
      return id;
    },
    [generateNodeId]
  );

  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    // Also delete all edges connected to this node
    setEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));
  }, []);

  const addEdge = useCallback(
    (edge: Omit<WorkflowEdge, 'id'>) => {
      const id = generateEdgeId();
      const newEdge: WorkflowEdge = { ...edge, id };
      setEdges((prev) => [...prev, newEdge]);
      return id;
    },
    [generateEdgeId]
  );

  const deleteEdge = useCallback((id: string) => {
    setEdges((prev) => prev.filter((edge) => edge.id !== id));
  }, []);

  const canConnect = useCallback(
    (source: string, target: string) => {
      // Check if connection already exists
      const existingEdge = edges.find(
        (edge) => edge.source === source && edge.target === target
      );
      if (existingEdge) return false;

      // Check for circular dependencies
      const visited = new Set<string>();
      const stack: string[] = [target];

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (current === source) return false; // Would create a cycle

        if (!visited.has(current)) {
          visited.add(current);
          const outgoing = edges.filter((edge) => edge.source === current);
          outgoing.forEach((edge) => stack.push(edge.target));
        }
      }

      return true;
    },
    [edges]
  );

  const getNodeById = useCallback(
    (id: string) => {
      return nodes.find((node) => node.id === id);
    },
    [nodes]
  );

  const getConnectedNodes = useCallback(
    (nodeId: string) => {
      const incoming = edges
        .filter((edge) => edge.target === nodeId)
        .map((edge) => nodes.find((node) => node.id === edge.source))
        .filter((node): node is WorkflowNode => node !== undefined);

      const outgoing = edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => nodes.find((node) => node.id === edge.target))
        .filter((node): node is WorkflowNode => node !== undefined);

      return { incoming, outgoing };
    },
    [nodes, edges]
  );

  const clear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    nodeIdCounter.current = 0;
    edgeIdCounter.current = 0;
  }, []);

  const exportWorkflow = useCallback(() => {
    return { nodes, edges };
  }, [nodes, edges]);

  const importWorkflow = useCallback(
    (workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      // Update counters to avoid ID conflicts
      const maxNodeId = Math.max(
        0,
        ...workflow.nodes.map((n) => {
          const match = n.id.match(/node_(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      const maxEdgeId = Math.max(
        0,
        ...workflow.edges.map((e) => {
          const match = e.id.match(/edge_(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      nodeIdCounter.current = maxNodeId;
      edgeIdCounter.current = maxEdgeId;
    },
    []
  );

  return {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    canConnect,
    getNodeById,
    getConnectedNodes,
    clear,
    exportWorkflow,
    importWorkflow,
  };
}
