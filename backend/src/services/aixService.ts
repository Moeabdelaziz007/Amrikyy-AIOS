// backend/src/services/aixService.ts
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { normalizeAixObject } from './aixAdapter.js';

// Zod schema for AIX validation (basic version)
const aixSchema = z.object({
    meta: z.object({
        name: z.string(),
        role: z.string(),
    }),
    persona: z.object({
        instructions: z.string(),
    }),
    skills: z.array(z.object({
        name: z.string(),
    })),
});

const agentsDir = path.resolve(__dirname, '../../data/agents');

export const loadAgentFromAix = async (agentId: string) => {
    const filePath = path.join(agentsDir, `${agentId}.aix.md`);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const aixData = yaml.load(fileContent);

        // Validate with Zod
        const validatedAix = aixSchema.parse(aixData);
        // normalize legacy keys into canonical shape for backend usage
        const normalized = normalizeAixObject(validatedAix);
        return normalized;
    } catch (error) {
        console.error(`Failed to load or parse AIX file for agent ${agentId}:`, error);
        return null;
    }
};

export const getAllAgents = async () => {
    try {
        const files = await fs.readdir(agentsDir);
        const agentIds = files
            .filter(file => file.endsWith('.aix.md'))
            .map(file => file.replace('.aix.md', ''));

        const agents = await Promise.all(agentIds.map(loadAgentFromAix));
        return agents.filter(Boolean); // Filter out any nulls from failed loads
    } catch (error) {
        console.error('Failed to get all agents:', error);
        return [];
    }
};
