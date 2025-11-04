// backend/src/services/chatService.ts
import { supabase } from './supabase.js';

export const getChannels = async () => {
    const { data, error } = await supabase.from('chat_channels').select('*');
    if (error) throw error;
    return data;
};

export const getMessages = async (channelId: string) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

export const createMessage = async (userId: string, channelId: string, content: string) => {
    // In a real app, you'd get the username from a profiles table
    const username = 'temp_user';
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({ user_id: userId, channel_id: channelId, content, username })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getDirectMessages = async (userId1: string, userId2: string) => {
    const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`(sender_id.eq.${userId1},recipient_id.eq.${userId2}),(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};
