// backend/src/routes/chat.ts
import { Router } from 'express';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = Router();
router.use(verifyAuth);

// GET /api/chat/channels
router.get('/channels', async (req, res) => {
    try {
        const channels = await chatService.getChannels();
        res.json({ channels });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/channels/:id/messages
router.get('/channels/:id/messages', async (req, res) => {
    try {
        const messages = await chatService.getMessages(req.params.id);
        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat/channels/:id/messages
router.post('/channels/:id/messages', async (req: AuthenticatedRequest, res) => {
    try {
        const { content } = req.body;
        const newMessage = await chatService.createMessage(req.user.id, req.params.id, content);
        res.status(201).json(newMessage);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/dm/:userId
router.get('/dm/:userId', async (req: AuthenticatedRequest, res) => {
    try {
        const messages = await chatService.getDirectMessages(req.user.id, req.params.userId);
        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
