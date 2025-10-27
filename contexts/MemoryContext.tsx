import React, { createContext, useState, useContext, useCallback } from 'react';
import { Engram, EngramConnection, ReasoningPath } from '../types';
import { synthesizeMemory } from '../services/geminiAdvancedService';

interface MemoryContextType {
  engrams: Engram[];
  connections: EngramConnection[];
  reasoningPaths: ReasoningPath[];
  isSynthesizing: boolean;
  addEngram: (engram: Omit<Engram, 'id'>) => void;
  addConnections: (newConnections: EngramConnection[]) => void;
  synthesizeNewMemory: (prompt: string) => Promise<void>;
  triggerReasoning: (engramId: string) => void;
  collapseEngram: (engramId: string) => void;
}

const initialEngrams: Engram[] = [
    { id: 'engram-1', label: 'User Preferences', type: 'user_preference', content: 'User prefers window seats and vegetarian meals.', timestamp: Date.now() - 86400000, color: '#8B5CF6', potentiality: 1 },
    { id: 'engram-2', label: 'Tokyo Trip Plan', type: 'travel_plan', content: 'A 5-day trip to Tokyo focusing on technology and food.', timestamp: Date.now() - 43200000, color: '#06B6D4', potentiality: 1 },
];

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engrams, setEngrams] = useState<Engram[]>(initialEngrams);
  const [connections, setConnections] = useState<EngramConnection[]>([]);
  const [reasoningPaths, setReasoningPaths] = useState<ReasoningPath[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const addEngram = useCallback((engramData: Omit<Engram, 'id'>) => {
    const newEngram: Engram = {
      ...engramData,
      id: `engram-${Date.now()}`
    };
    setEngrams(prev => [...prev, newEngram]);
  }, []);
  
  const addConnections = useCallback((newConnections: EngramConnection[]) => {
      setConnections(prev => {
        const existingConnections = new Set(prev.map(c => `${c.from}-${c.to}`));
        const filteredNewConnections = newConnections.filter(c => !existingConnections.has(`${c.from}-${c.to}`));
        return [...prev, ...filteredNewConnections];
      });
  }, []);

  const triggerReasoning = useCallback((engramId: string) => {
    const relatedEngram = engrams.filter(e => e.id !== engramId)[Math.floor(Math.random() * (engrams.length - 1))];
    if (relatedEngram) {
      setReasoningPaths([{ from: engramId, to: relatedEngram.id }]);
      setTimeout(() => setReasoningPaths([]), 2000);
    }
  }, [engrams]);

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

export const useMemory = (): MemoryContextType => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};