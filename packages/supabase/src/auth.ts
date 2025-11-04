import { supabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Authentication Service
 * Handles all auth-related operations
 */

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  metadata?: Record<string, any>;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign up new user with email and password
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: credentials.metadata,
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Reset password request
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error };
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'discord'): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription;
}
