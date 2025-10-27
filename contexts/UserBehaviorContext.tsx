import React, { createContext, useState, useContext, useCallback } from 'react';
import { UserAction, AppID } from '../types';

const MAX_ACTION_HISTORY = 20;

interface UserBehaviorContextType {
  actions: UserAction[];
  logAction: (appId: AppID, details?: Record<string, any>) => void;
  getFrequentApps: (count: number) => AppID[];
}

const UserBehaviorContext = createContext<UserBehaviorContextType | undefined>(undefined);

export const UserBehaviorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<UserAction[]>([]);
  // Explicitly typing `appFrequency` is necessary because initializing with an empty
  // object `{}` causes TypeScript to infer its value types as `unknown`. This
  // leads to a type error during the arithmetic subtraction in the `sort` method
  // for `getFrequentApps` on line 34.
  // FIX: Explicitly type appFrequency as Record<AppID, number>.
  const [appFrequency, setAppFrequency] = useState<Record<AppID, number>>({});

  const logAction = useCallback((appId: AppID, details?: Record<string, any>) => {
    const newAction: UserAction = { appId, timestamp: Date.now(), details };
    
    setActions(prev => [newAction, ...prev.slice(0, MAX_ACTION_HISTORY - 1)]);
    
    setAppFrequency(prev => ({
        ...prev,
        [appId]: (prev[appId] || 0) + 1,
    }));
  }, []);
  
  const getFrequentApps = useCallback((count: number): AppID[] => {
      return Object.entries(appFrequency)
        // FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
        // The values of appFrequency are guaranteed to be numbers due to explicit typing above.
        // Explicitly type a and b as numbers to satisfy TypeScript's strictness in some environments.
        .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
        .slice(0, count)
        .map(([appId]) => appId as AppID);
  }, [appFrequency]);


  return (
    <UserBehaviorContext.Provider value={{ actions, logAction, getFrequentApps }}>
      {children}
    </UserBehaviorContext.Provider>
  );
};

export const useUserBehavior = (): UserBehaviorContextType => {
  const context = useContext(UserBehaviorContext);
  if (!context) {
    throw new Error('useUserBehavior must be used within a UserBehaviorProvider');
  }
  return context;
};