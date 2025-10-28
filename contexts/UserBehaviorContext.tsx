import React, { createContext, useState, useContext, useCallback } from 'react';
import { UserAction, AppID } from '../types';

/** The maximum number of user actions to store in history. */
const MAX_ACTION_HISTORY = 20;

/**
 * Defines the shape of the context object provided by `UserBehaviorContext`.
 */
interface UserBehaviorContextType {
  /** An array of recent user actions. */
  actions: UserAction[];
  /**
   * Function to log a new user action.
   * @param {AppID} appId - The ID of the application where the action occurred.
   * @param {Record<string, any>} [details] - Optional additional context about the action.
   */
  logAction: (appId: AppID, details?: Record<string, any>) => void;
  /**
   * Function to retrieve a list of the most frequently used applications.
   * @param {number} count - The number of frequent apps to return.
   * @returns {AppID[]} An array of AppIDs representing the most frequent applications.
   */
  getFrequentApps: (count: number) => AppID[];
}

/**
 * React Context for managing and tracking user behavior and application usage patterns.
 */
const UserBehaviorContext = createContext<UserBehaviorContextType | undefined>(undefined);

/**
 * Provides user behavior context to its children.
 * Tracks user actions and calculates application frequency for features like proactive suggestions.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @returns {JSX.Element} The UserBehaviorProvider component.
 */
export const UserBehaviorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<UserAction[]>([]);
  // Explicitly typing `appFrequency` is necessary because initializing with an empty
  // object `{}` causes TypeScript to infer its value types as `unknown`. This
  // leads to a type error during the arithmetic subtraction in the `sort` method
  // for `getFrequentApps` on line 34.
  // FIX: Explicitly type appFrequency as Record<AppID, number>.
  const [appFrequency, setAppFrequency] = useState<Record<AppID, number>>({});

  /**
   * Logs a user action, adding it to the action history and updating app frequency counts.
   * The action history is capped at `MAX_ACTION_HISTORY` entries.
   * @param {AppID} appId - The ID of the application where the action occurred.
   * @param {Record<string, any>} [details] - Optional additional context about the action.
   */
  const logAction = useCallback((appId: AppID, details?: Record<string, any>) => {
    const newAction: UserAction = { appId, timestamp: Date.now(), details };
    
    setActions(prev => [newAction, ...prev.slice(0, MAX_ACTION_HISTORY - 1)]);
    
    setAppFrequency(prev => ({
        ...prev,
        [appId]: (prev[appId] || 0) + 1,
    }));
  }, []);
  
  /**
   * Returns an array of `AppID`s representing the most frequently used applications,
   * sorted by frequency in descending order.
   * @param {number} count - The maximum number of frequent apps to return.
   * @returns {AppID[]} An array of `AppID`s.
   */
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

/**
 * Custom hook to access the user behavior context.
 * This hook allows components to log user actions and retrieve insights into application usage patterns,
 * such as frequently used applications. It should be used within a `UserBehaviorProvider`.
 * @returns {UserBehaviorContextType} The current user behavior context, including recent actions,
 *   a function to log actions, and a function to get frequent apps.
 * @throws {Error} If `useUserBehavior` is not used within a `UserBehaviorProvider`.
 */
export const useUserBehavior = (): UserBehaviorContextType => {
  const context = useContext(UserBehaviorContext);
  if (!context) {
    throw new Error('useUserBehavior must be used within a UserBehaviorProvider');
  }
  return context;
};