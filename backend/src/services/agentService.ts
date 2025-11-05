// backend/src/services/agentService.ts
import { supabase } from './supabaseClient.js';
import { AIXAgent } from '../types.js';
import { embedText } from './geminiEmbeddingService.js';
import { upsertAgentVector, qdrantService } from './qdrantService.js';
import { redisService } from './redisService.js';
import { generateAIX } from '@Moeabdelaziz007/aix-format';
import { aixGeneratorService } from './aixGeneratorService.js';
import { mapAgentDataToAixConfig } from './aixAdapter.js';

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
    // Map legacy agent shape to the AIX package generator config
    const aixConfig = mapAgentDataToAixConfig(agentData, { userId });
    // Generate AIX format content (AIX package expects AIXGeneratorConfig)
    const aixContent = generateAIX(aixConfig);

    // Insert agent in Supabase with AIX fields
    const { data, error } = await supabase
        .from('agents')
        .insert([{
            ...agentData,
            user_id: userId,
            aix_format: aixContent,
            dna: agentData.dna || {},
            persona: agentData.persona || {},
            feelings: agentData.feelings || { valence: 0.0, arousal: 0.5, motivation: 0.8 },
            memory_config: agentData.memory_config || { storeToVectorDB: true, vectorTTL: null, memoryBias: 'balanced', useRedisCache: true }
        }])
        .select()
        .single();
    if (error) throw new Error(error.message);

    const created = data as AIXAgent;

    // Build embedding text
    const metaText = `${created.name} - ${created.role} - Skills: ${Array.isArray(created.skillIDs) ? created.skillIDs.join(', ') : created.skillIDs}`;

    try {
        const vector = await embedText(metaText);
        // Update Supabase with vector
        await supabase.from('agents').update({ embedding_vector: vector }).eq('id', created.id);
        // Upsert into Qdrant
        await upsertAgentVector(created.id, vector, { name: created.name, user_id: userId, role: created.role });
    } catch (e) {
        console.error('Embedding/Qdrant error:', e);
    }

    try {
        // Cache summary in Redis
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

export const updateAgentFeelings = async (agentId: string, event: 'success' | 'failure' | 'idle', userId: string) => {
    // fetch agent
    const agent = await getAgentById(agentId, userId);
    if (!agent) throw new Error('Agent not found');

    const current = agent.dna?.feelingsModel || agent.feelings || { valence: 0.0, arousal: 0.5, motivation: 0.8, decayRate: 0.01 };
    const updated = aixGeneratorService.updateFeelings(current, event, event === 'idle' ? 60 : 0);

    const { error } = await supabase.from('agents').update({ feelings: updated, 'dna': { ...agent.dna, feelingsModel: updated } }).eq('id', agentId);
    if (error) throw new Error(error.message);

    // return refreshed agent
    return await getAgentById(agentId, userId);
};
