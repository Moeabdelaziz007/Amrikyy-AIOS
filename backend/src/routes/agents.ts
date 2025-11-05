// POST /api/agents/:id/feelings
router.post('/:id/feelings', async (req: AuthenticatedRequest, res) => {
    try {
        const { event } = req.body || {};
        if (!event) return res.status(400).json({ error: 'Missing event' });
        const updated = await agentService.updateAgentFeelings(req.params.id, event, req.user.id);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// backend/src/routes/agents.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as aixService from '../services/aixService.js';
import * as agentService from '../services/agentService.js';
import { quantumAgentService } from '../../services/src/index.js';

const router = Router();
router.use(verifyAuth);

// GET /api/agents
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const agents = await agentService.getAgents(req.user.id);
        res.json(agents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/agents/:id
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const agent = await agentService.getAgentById(req.params.id, req.user.id);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(agent);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/agents
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const newAgent = await agentService.createAgent(req.user.id, req.body);
        res.status(201).json(newAgent);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        await agentService.deleteAgent(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/agents/:id/reason
router.post('/:id/reason', async (req: AuthenticatedRequest, res) => {
    try {
        const { prompt, context } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        // Get agent data for context
        const agent = await agentService.getAgentById(req.params.id, req.user.id);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // Build context from agent data
        const agentContext = {
            name: agent.name,
            role: agent.role,
            personality: agent.personality,
            skills: agent.skills,
            ...context
        };

        // Get quantum-enhanced response
        const response = await quantumAgentService.getEnhancedResponse(
            prompt,
            agentContext,
            {
                temperature: req.body.temperature || 0.7,
                maxTokens: req.body.maxTokens || 2000
            }
        );

        res.json({
            agent_id: req.params.id,
            response: response.content,
            confidence: response.confidence,
            reasoning_trace: response.reasoning_trace,
            alternative_hypotheses: response.alternative_hypotheses,
            quantum_metadata: response.quantum_metadata,
            processing_time: response.processing_time
        });
    } catch (error: any) {
        console.error('Quantum reasoning error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
