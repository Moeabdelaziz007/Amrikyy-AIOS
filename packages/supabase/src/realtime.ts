import { supabase } from './client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Realtime Service
 * Handles real-time subscriptions and live updates
 */

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SubscribeOptions<T = any> {
  table: string;
  event: RealtimeEvent;
  schema?: string;
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Subscribe to database changes
 */
export function subscribeToTable<T = any>(options: SubscribeOptions<T>): RealtimeChannel {
  const { table, event, schema = 'public', filter, callback } = options;

  const channel = supabase
    .channel(`${schema}:${table}`)
    .on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to all changes on a table
 */
export function subscribeToAllChanges<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema: string = 'public'
): RealtimeChannel {
  return subscribeToTable({
    table,
    event: '*',
    schema,
    callback,
  });
}

/**
 * Subscribe to INSERT events
 */
export function subscribeToInserts<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema: string = 'public'
): RealtimeChannel {
  return subscribeToTable({
    table,
    event: 'INSERT',
    schema,
    callback,
  });
}

/**
 * Subscribe to UPDATE events
 */
export function subscribeToUpdates<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema: string = 'public'
): RealtimeChannel {
  return subscribeToTable({
    table,
    event: 'UPDATE',
    schema,
    callback,
  });
}

/**
 * Subscribe to DELETE events
 */
export function subscribeToDeletes<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  schema: string = 'public'
): RealtimeChannel {
  return subscribeToTable({
    table,
    event: 'DELETE',
    schema,
    callback,
  });
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
}

/**
 * Subscribe to presence (user online status)
 */
export function subscribeToPresence(
  channelName: string,
  callbacks: {
    onJoin?: (user: any) => void;
    onLeave?: (user: any) => void;
    onSync?: () => void;
  }
): RealtimeChannel {
  const channel = supabase.channel(channelName);

  if (callbacks.onJoin) {
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      callbacks.onJoin?.(newPresences[0]);
    });
  }

  if (callbacks.onLeave) {
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      callbacks.onLeave?.(leftPresences[0]);
    });
  }

  if (callbacks.onSync) {
    channel.on('presence', { event: 'sync' }, () => {
      callbacks.onSync?.();
    });
  }

  channel.subscribe();
  return channel;
}

/**
 * Track user presence
 */
export async function trackPresence(channel: RealtimeChannel, userState: any) {
  await channel.track(userState);
}

/**
 * Untrack user presence
 */
export async function untrackPresence(channel: RealtimeChannel) {
  await channel.untrack();
}
