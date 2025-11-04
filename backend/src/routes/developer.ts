// backend/src/routes/developer.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as developerService from '../services/developerService.js';

const router = Router();
router.use(verifyAuth);

// GET /api/developer/keys
router.get('/keys', async (req: AuthenticatedRequest, res) => {
    try {
        const keys = await developerService.getApiKeys(req.user.id);
        res.json({ keys });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/developer/keys
router.post('/keys', async (req: AuthenticatedRequest, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Key name is required' });
        }
        const newKey = await developerService.createApiKey(req.user.id, name);
        res.status(201).json(newKey);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/developer/keys/:id
router.delete('/keys/:id', async (req: AuthenticatedRequest, res) => {
    try {
        await developerService.deleteApiKey(req.user.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
