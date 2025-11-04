// backend/src/services/agentService.ts
import { supabase } from './supabaseClient.js';
import { AIXAgent } from '../types.js';

export const getAgents = async (userId: string): Promise<AIXAgent[]> => {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data;
};

export const getAgentById = async (agentId: string, userId: string): Promise<AIXAgent | null> => {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('user_id', userId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') { // PostgREST error for "Not a single row"
            return null;
        }
        throw new Error(error.message);
    }
    return data;
};

export const createAgent = async (userId: string, agentData: Omit<AIXAgent, 'id' | 'user_id'>): Promise<AIXAgent> => {
    const { data, error } = await supabase
        .from('agents')
        .insert([{ ...agentData, user_id: userId }])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteAgent = async (agentId: string, userId: string): Promise<void> => {
    const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', userId);
    if (error) throw new Error(error.message);
};
