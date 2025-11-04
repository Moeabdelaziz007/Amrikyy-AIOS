// services/memoryApiService.ts
import { supabase } from './supabaseClient';
import { Engram } from '../types';

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return `Bearer ${session?.access_token}`;
};

export const addMemory = async (content: string): Promise<any> => {
    const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': await getAuthHeader(),
        },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add memory');
    return response.json();
};

export const searchMemories = async (query: string): Promise<any> => {
    const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': await getAuthHeader(),
        },
        body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search memories');
    return response.json();
};
