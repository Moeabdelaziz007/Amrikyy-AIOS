import axios from 'axios';

const AGENTS_API_URL = '/api/agents';
const DEV_API_URL = '/api/developer';

export interface AIXAgent {
    id: string;
    name: string;
    persona: string;
    tools: string[];
    skills: string[];
    category: string;
    visibility: 'private' | 'public';
}

export interface Tool {
    id: string;
    name: string;
    description: string;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
}

export const getAgents = async (): Promise<AIXAgent[]> => {
    try {
        const response = await axios.get(AGENTS_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw error;
    }
};

export const updateAgent = async (agentId: string, agentData: Partial<Omit<AIXAgent, 'id'>>): Promise<AIXAgent> => {
    try {
        const response = await axios.put(`${AGENTS_API_URL}/${agentId}`, agentData);
        return response.data;
    } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
    }
};

export const createAgent = async (agentData: Omit<AIXAgent, 'id'>): Promise<AIXAgent> => {
    try {
        const response = await axios.post(AGENTS_API_URL, agentData);
        return response.data;
    } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
    }
};

export const deleteAgent = async (agentId: string): Promise<void> => {
    try {
        await axios.delete(`${AGENTS_API_URL}/${agentId}`);
    } catch (error) {
        console.error('Error deleting agent:', error);
        throw error;
    }
};

export const getTools = async (): Promise<Tool[]> => {
    try {
        const response = await axios.get(`${DEV_API_URL}/tools`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tools:', error);
        throw error;
    }
};

export const getSkills = async (): Promise<Skill[]> => {
    try {
        const response = await axios.get(`${DEV_API_URL}/skills`);
        return response.data;
    } catch (error) {
        console.error('Error fetching skills:', error);
        throw error;
    }
};
