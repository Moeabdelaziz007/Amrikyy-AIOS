import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Authentication helper functions
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: object) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign in with OAuth provider (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github' | 'azure' | 'gitlab') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  // Update user
  updateUser: async (attributes: { email?: string; password?: string; data?: object }) => {
    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helper functions
export const dbService = {
  // Generic query function
  from: (table: string) => supabase.from(table),

  // Storage helpers
  storage: {
    upload: async (bucket: string, path: string, file: File) => {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      return data;
    },

    download: async (bucket: string, path: string) => {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      return data;
    },

    getPublicUrl: (bucket: string, path: string) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },

    remove: async (bucket: string, paths: string[]) => {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
      return data;
    },
  },
};

// Real-time subscription helpers
export const realtimeService = {
  // Subscribe to table changes
  subscribeToTable: (
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return channel;
  },

  // Subscribe to specific events (INSERT, UPDATE, DELETE)
  subscribeToEvent: (
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void
  ) => {
    const channel = supabase
      .channel(`${table}-${event}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        callback
      )
      .subscribe();

    return channel;
  },

  // Unsubscribe from channel
  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel);
  },
};

export default supabase;
