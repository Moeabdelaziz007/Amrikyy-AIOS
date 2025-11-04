import { supabase } from '../packages/supabase/src';

/**
 * Agent Service
 * Handles all database operations for custom agents
 */

export interface AgentConfig {
  id: string;
  user_id: string;
  name: string;
  role: string;
  icon: string;
  skill_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get all agents for the current user
 */
export async function getUserAgents(userId: string): Promise<AgentConfig[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single agent by ID
 */
export async function getAgent(id: string): Promise<AgentConfig | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new agent
 */
export async function createAgent(
  userId: string,
  agent: Omit<AgentConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from('agents')
    .insert({
      user_id: userId,
      name: agent.name,
      role: agent.role,
      icon: agent.icon,
      skill_ids: agent.skill_ids || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating agent:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing agent
 */
export async function updateAgent(
  id: string,
  updates: Partial<Omit<AgentConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from('agents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating agent:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
}
