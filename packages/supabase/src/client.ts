import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Single source of truth for Supabase connection
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env file:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Singleton Supabase client instance
 * Used across the entire application
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
