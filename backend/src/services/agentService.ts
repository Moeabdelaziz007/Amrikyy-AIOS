r ea// backend/src/services/agentService.ts
import { supabase } from './supabaseClient.js';
import { AIXAgent } from '../types.js';
ch agentimport { embedText } from './geminiEmbeddingService.js';
import { upsertAgentVector, qdrantService } from './qdrantService.js';
import { redisService } from './redisService.js';

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
    // Insert agent in Supabase
    const { data, error } = await supabase
        .from('agents')
        .insert([{ ...agentData, user_id: userId }])
        .select()
        .single();
    if (error) throw new Error(error.message);

    const created = data as AIXAgent;

    // Build a short metadata text for embedding
    const metaText = `${created.name} - ${created.role} - Skills: ${Array.isArray(created.skillIDs) ? created.skillIDs.join(', ') : created.skillIDs}`;

    try {
        const vector = await embedText(metaText);
        // upsert into qdrant
        await upsertAgentVector(created.id, vector, { name: created.name, user_id: userId, role: created.role });
    } catch (e) {
        console.error('Embedding/Qdrant error:', e);
    }

    try {
        // cache summary in redis
        await redisService.cache(`agent_summary:${created.id}`, { id: created.id, name: created.name, role: created.role }, 60 * 60 * 24);
    } catch (e) {
        console.error('Redis cache error:', e);
    }

    return created;
};

export const deleteAgent = async (agentId: string, userId: string): Promise<void> => {
    const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', userId);
    if (error) throw new Error(error.message);

    try {
        await qdrantService.deleteVectors('agents', [agentId]);
    } catch (e) {
        console.warn('Qdrant delete error:', e);
    }

    try { await redisService.delete(`agent_summary:${agentId}`); } catch (_) {}
};
