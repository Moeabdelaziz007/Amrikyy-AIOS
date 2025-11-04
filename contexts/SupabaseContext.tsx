import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, onAuthStateChange } from '../packages/supabase/src';
import type { User, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Context
 * Provides Supabase client and authentication state to the entire app
 */

interface SupabaseContextValue {
  supabase: SupabaseClient;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

/**
 * Supabase Provider Component
 */
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting current user:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const subscription = onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUser(null);
  };

  const value: SupabaseContextValue = {
    supabase,
    user,
    loading,
    signOut: handleSignOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

/**
 * Hook to use Supabase context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { supabase, user, loading } = useSupabase();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please sign in</div>;
 *   
 *   // Use supabase client
 *   const { data } = await supabase.from('table').select();
 * }
 * ```
 */
export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
}

export default SupabaseContext;
