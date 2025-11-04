// backend/src/services/developerService.ts
import { supabase } from './supabase.js';
import crypto from 'crypto';

const hashApiKey = (apiKey: string): string => {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
};

export const createApiKey = async (userId: string, name: string) => {
    const apiKey = `amk_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = hashApiKey(apiKey);

    const { data, error } = await supabase
        .from('api_keys')
        .insert({ user_id: userId, name, key_hash: keyHash })
        .select('id, name, created_at')
        .single();

    if (error) throw error;
    return { ...data, apiKey }; // Return the raw key only once upon creation
};

export const getApiKeys = async (userId: string) => {
    const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, created_at, last_used_at')
        .eq('user_id', userId);

    if (error) throw error;
    return data;
};

export const deleteApiKey = async (userId: string, keyId: string) => {
    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', userId);

    if (error) throw error;
    return { message: 'API key deleted' };
};

export const recordApiUsage = async (keyId: string, endpoint: string, statusCode: number) => {
    const { error } = await supabase
        .from('api_usage')
        .insert({ key_id: keyId, endpoint, status_code: statusCode });

    if (error) {
        console.error('Failed to record API usage:', error);
    }

    // Also update the last_used_at timestamp on the key itself
    await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyId);
};
