// backend/src/routes/creative.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as creativeService from '../services/creativeService.js';
import { generateImage } from '../services/gemini.js';

const router = Router();
router.use(verifyAuth);

// POST /api/creative/image
router.post('/image', async (req: AuthenticatedRequest, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const imageUrl = await generateImage(prompt);
        res.json({ imageUrl });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
});

// POST /api/creative/video
router.post('/video', async (req: AuthenticatedRequest, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const result = await creativeService.generateVideo(prompt);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate video', message: error.message });
    }
});

// POST /api/creative/audio
router.post('/audio', async (req: AuthenticatedRequest, res) => {
    try {
        const { text, voice } = req.body;
        if (!text || !voice) {
            return res.status(400).json({ error: 'Text and voice are required' });
        }
        const result = await creativeService.generateAudio(text, voice);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate audio', message: error.message });
    }
});

export default router;
