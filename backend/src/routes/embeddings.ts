import { Router } from 'express';
import { embedText } from '../services/geminiEmbeddingService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const vector = await embedText(text);
    res.json({ vector });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

