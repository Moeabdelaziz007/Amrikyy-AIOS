import { aixGeneratorService } from './aix-generator.service';
import { AdapterFactory } from '../adapters';

export const enhancedAgentFactory = {
  async createAgent(config: any, userId: string) {
    // Build AIX
    const aix = {
      metadata: { id: `agent-${Date.now()}`, name: config.name, description: config.description || '', version: '0.1', created_by: userId, created_at: new Date().toISOString() },
      dna: {
        role: config.role || 'Agent',
        persona: config.persona || { tone: 'professional', language: 'en' },
        skills: config.skills || [],
        feelingsModel: config.feelingsModel || { valence: 0.0, arousal: 0.5, motivation: 0.8 },
        memoryConfig: config.memoryConfig || { storeToVectorDB: true, vectorTTL: null, memoryBias: 'balanced', useRedisCache: true },
        tools: config.tools || [],
        rules: [],
        workflows: config.workflows || [],
        embeddingHints: { textForEmbed: 'name+role+skills', model: 'embed-english-v1' }
      },
      aixFile: ''
    };

    // Generate embedding text
    const embedText = aixGeneratorService.generateEmbeddingText(aix);
    // call gemini adapter to embed
    const embedRes = await AdapterFactory.call('gemini', { action: 'embed', params: { text: embedText }, context: { userId } });
    const vector = embedRes.success ? embedRes.data : [];

    // Persist agent using backend endpoint
    const resp = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: aix.metadata.name, role: aix.dna.role, skillIDs: aix.dna.skills, dna: aix.dna, aix_format: aix.aixFile, feelings: aix.dna.feelingsModel, memory_config: aix.dna.memoryConfig }) });
    if (!resp.ok) throw new Error('Failed to create agent on backend');
    const created = await resp.json();

    return { agentId: created.id || created.id || created.agent_id || created, aix, vector };
  },

  async getAgent(agentId: string) {
    const resp = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/agents/${agentId}`);
    if (resp.status === 404) return null;
    if (!resp.ok) throw new Error('Failed to fetch agent');
    return await resp.json();
  },

  async searchSimilarAgents(query: string, userId: string, limit = 5) {
    const embedRes = await AdapterFactory.call('gemini', { action: 'embed', params: { text: query }, context: { userId } });
    const vector = embedRes.success ? embedRes.data : [];

    const resp = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/search/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vector, limit }) });
    if (!resp.ok) throw new Error('Search failed');
    const json = await resp.json();
    return json.results || json;
  },

  async updateAgentFeelings(agentId: string, event: 'success' | 'failure') {
    const resp = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/agents/${agentId}/feelings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event }) });
    if (!resp.ok) throw new Error('Failed to update feelings');
    return await resp.json();
  },

  async createPresetAgent(presetId: string, userId: string) {
    const resp = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/creator/compose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presetId }) });
    if (!resp.ok) throw new Error('Failed to create preset agent');
    const json = await resp.json();
    return { agentId: json.id || json.agentId, aix: json };
  }
};

