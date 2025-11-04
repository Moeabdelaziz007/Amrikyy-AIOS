import { supabase } from '../packages/supabase/src';

/**
 * Knowledge Service
 * Handles all database operations for the ChronoVault knowledge base
 */

export interface KnowledgeEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get all knowledge entries for the current user
 */
export async function getKnowledgeEntries(userId: string): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single knowledge entry by ID
 */
export async function getKnowledgeEntry(id: string): Promise<KnowledgeEntry | null> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching knowledge entry:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new knowledge entry
 */
export async function createKnowledgeEntry(
  userId: string,
  entry: Omit<KnowledgeEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert({
      user_id: userId,
      title: entry.title,
      content: entry.content,
      tags: entry.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating knowledge entry:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing knowledge entry
 */
export async function updateKnowledgeEntry(
  id: string,
  updates: Partial<Omit<KnowledgeEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating knowledge entry:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a knowledge entry
 */
export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting knowledge entry:', error);
    throw error;
  }
}

/**
 * Search knowledge entries by content or title
 */
export async function searchKnowledgeEntries(
  userId: string,
  query: string
): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching knowledge entries:', error);
    throw error;
  }

  return data || [];
}
