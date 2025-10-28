import React, { createContext, useState, useContext, useCallback } from 'react';
import { Engram, EngramConnection, ReasoningPath } from '../types';
// FIX: Imported synthesizeMemory
import { synthesizeMemory } from '../services/geminiAdvancedService';

/**
 * Defines the shape of the context object provided by `MemoryContext`.
 */
interface MemoryContextType {
  /** An array of all stored Engrams (memories). */
  engrams: Engram[];
  /** An array of connections between Engrams, representing relationships. */
  connections: EngramConnection[];
  /** An array of temporary reasoning paths visualized between Engrams. */
  reasoningPaths: ReasoningPath[];
  /** Indicates if the AI is currently synthesizing a new memory. */
  isSynthesizing: boolean;
  /** Function to add a new Engram to the memory system. */
  addEngram: (engram: Omit<Engram, 'id' | 'timestamp'>) => void;
  /** Function to add new connections between Engrams. */
  addConnections: (newConnections: EngramConnection[]) => void;
  /** Function to trigger the AI to synthesize a new memory based on a prompt. */
  synthesizeNewMemory: (prompt: string) => Promise<void>;
  /** Function to trigger a visual reasoning path between Engrams. */
  triggerReasoning: (engramId: string) => void;
  /** Function to "collapse" an Engram, marking it as stable (potentiality = 1). */
  collapseEngram: (engramId: string) => void;
}

/**
 * Initial mock Engrams for demonstration purposes.
 */
const initialEngrams: Engram[] = [
    { id: 'engram-1', label: 'User Preferences', type: 'user_preference', content: 'User prefers window seats and vegetarian meals.', timestamp: Date.now() - 86400000, color: '#8B5CF6', potentiality: 1 },
    { id: 'engram-2', label: 'Tokyo Trip Plan', type: 'travel_plan', content: 'A 5-day trip to Tokyo focusing on technology and food.', timestamp: Date.now() - 43200000, color: '#06B6D4', potentiality: 1 },
];

/**
 * React Context for managing the application's memory (Engrams, connections, reasoning paths).
 */
const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

/**
 * Provides memory context to its children.
 * Manages the state of Engrams, their connections, and AI-driven reasoning processes.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @returns {JSX.Element} The MemoryProvider component.
 */
export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engrams, setEngrams] = useState<Engram[]>(initialEngrams);
  const [connections, setConnections] = useState<EngramConnection[]>([]);
  const [reasoningPaths, setReasoningPaths] = useState<ReasoningPath[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  /**
   * Adds a new Engram to the `engrams` state.
   * A unique ID and timestamp are generated automatically.
   * @param {Omit<Engram, 'id' | 'timestamp'>} engramData - The data for the new Engram, excluding `id` and `timestamp`.
   */
  const addEngram = useCallback((engramData: Omit<Engram, 'id' | 'timestamp'>) => {
    const newEngram: Engram = {
      ...engramData,
      id: `engram-${Date.now()}`,
      timestamp: Date.now(), // Ensure timestamp is set here
    };
    setEngrams(prev => [...prev, newEngram]);
  }, []);
  
  /**
   * Adds new connections between Engrams to the `connections` state.
   * Prevents adding duplicate connections.
   * @param {EngramConnection[]} newConnections - An array of new connections to add.
   */
  const addConnections = useCallback((newConnections: EngramConnection[]) => {
      setConnections(prev => {
        const existingConnections = new Set(prev.map(c => `${c.from}-${c.to}`));
        const filteredNewConnections = newConnections.filter(c => !existingConnections.has(`${c.from}-${c.to}`));
        return [...prev, ...filteredNewConnections];
      });
  }, []);

  /**
   * Triggers a visual reasoning path between a specified Engram and a random related Engram.
   * The path is displayed temporarily.
   * @param {string} engramId - The ID of the Engram to start the reasoning path from.
   */
  const triggerReasoning = useCallback((engramId: string) => {
    const relatedEngram = engrams.filter(e => e.id !== engramId)[Math.floor(Math.random() * (engrams.length - 1))];
    if (relatedEngram) {
      setReasoningPaths([{ from: engramId, to: relatedEngram.id }]);
      setTimeout(() => setReasoningPaths([]), 2000);
    }
  }, [engrams]);

  /**
   * Synthesizes a new memory (Engram) using the AI service based on a user prompt
   * and existing Engrams. The new Engram is added to the system.
   * @param {string} prompt - The user's prompt for memory synthesis.
   * @returns {Promise<void>} A promise that resolves when the synthesis is complete.
   */
  const synthesizeNewMemory = useCallback(async (prompt: string) => {
    setIsSynthesizing(true);
    try {
      const newEngramData = await synthesizeMemory(prompt, engrams);
      const newEngram: Engram = {
        ...newEngramData,
        id: `engram-${Date.now()}`,
        timestamp: Date.now(),
      };
      setEngrams(prev => [...prev, newEngram]);
    } finally {
      setIsSynthesizing(false);
    }
  }, [engrams]);

  /**
   * Collapses a specified Engram, changing its `potentiality` from 0 (superposition) to 1 (collapsed/stable).
   * Also adds a connection to a related Engram if available.
   * @param {string} engramId - The ID of the Engram to collapse.
   */
  const collapseEngram = useCallback((engramId: string) => {
    setEngrams(prev => prev.map(e => e.id === engramId ? { ...e, potentiality: 1 } : e));
    const relatedEngram = engrams.filter(e => e.id !== engramId)[0];
    if(relatedEngram) {
        addConnections([{ from: engramId, to: relatedEngram.id }]);
    }
  }, [engrams, addConnections]);


  return (
    <MemoryContext.Provider value={{ engrams, connections, reasoningPaths, isSynthesizing, addEngram, addConnections, synthesizeNewMemory, triggerReasoning, collapseEngram }}>
      {children}
    </MemoryContext.Provider>
  );
};

/**
 * Custom hook to access the memory context.
 * Throws an error if used outside of a `MemoryProvider`.
 * @returns {MemoryContextType} The current memory context.
 * @throws {Error} If `useMemory` is not used within a `MemoryProvider`.
 */
export const useMemory = (): MemoryContextType => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};