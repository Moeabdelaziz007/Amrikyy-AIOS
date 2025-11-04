import { supabase } from './supabaseClient';
import { Knowledge } from '../components/apps/ChronoVaultApp'; // Assuming the type is exported from here

export const getRecentKnowledge = async (userId: string) => {
    const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw error;
    return data || [];
};

export const saveKnowledge = async (userId: string, title: string, content: string, tags: string[]) => {
    const { data, error } = await supabase
        .from('knowledge_base')
        .insert([{ title, content, tags, user_id: userId }])
        .select();

    if (error) throw error;
    return data ? data[0] : null;
};

export const updateKnowledge = async (id: string, updates: Partial<Knowledge>) => {
    const { data, error } = await supabase
        .from('knowledge_base')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data ? data[0] : null;
};

export const deleteKnowledge = async (id: string) => {
    const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
    if (error) throw error;
};
