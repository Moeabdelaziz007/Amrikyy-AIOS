// backend/src/routes/memory.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as memoryService from '../services/memoryService.js';
import { generateContent } from '../services/gemini.js'; // Assuming you have a way to get embeddings

const router = Router();
router.use(verifyAuth);

// A simple (and inefficient) way to get embeddings for now.
// In a real app, you would use a dedicated embedding model.
const getEmbedding = async (text: string): Promise<number[]> => {
    // This is a placeholder. You'd replace this with a call to a real embedding model.
    const response = await generateContent(`Generate an embedding for this text: "${text}"`);
    // This is a very crude way to get a vector. Replace with actual embedding logic.
    return response.split('').map(char => char.charCodeAt(0));
};

// POST /api/memory
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const embedding = await getEmbedding(content);
        const memoryId = `mem_${Date.now()}`;
        const result = await memoryService.addMemory({ id: memoryId, content, embedding });
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add memory', message: error.message });
    }
});

// POST /api/memory/search
router.post('/search', async (req: AuthenticatedRequest, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        const embedding = await getEmbedding(query);
        const results = await memoryService.searchSimilarMemories(embedding);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to search memories', message: error.message });
    }
});

// GET /api/memory/:id
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const memory = await memoryService.getMemoryById(req.params.id);
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }
        res.json(memory);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to retrieve memory', message: error.message });
    }
});

export default router;
