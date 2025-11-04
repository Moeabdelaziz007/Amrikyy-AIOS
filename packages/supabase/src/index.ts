/**
 * @auraos/supabase
 * Centralized Supabase integration for Amrikyy AI OS
 * 
 * This package provides a unified interface for:
 * - Authentication (email/password, OAuth, sessions)
 * - Storage (file uploads, downloads, management)
 * - Realtime (live subscriptions, presence)
 * - Database client
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @license MIT
 */

// Core client
export { supabase, default } from './client';

// Authentication
export * from './auth';
export type {
  SignInCredentials,
  SignUpCredentials,
  AuthResponse,
} from './auth';

// Storage
export * from './storage';
export type {
  UploadOptions,
  DownloadOptions,
} from './storage';

// Realtime
export * from './realtime';
export type {
  RealtimeEvent,
  SubscribeOptions,
} from './realtime';

// Re-export Supabase types for convenience
export type {
  User,
  Session,
  AuthError,
  PostgrestError,
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
