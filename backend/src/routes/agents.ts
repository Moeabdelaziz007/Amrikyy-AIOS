import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateContent, startChat } from '../services/gemini.js';

const router = Router();

// Gemini API endpoints (protected)
router.post('/gemini/generate', async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt, model = 'gemini-pro' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = await generateContent(prompt, model);

    res.json({ text, user: req.user.email });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

router.post('/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-pro' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const text = await startChat(messages, model);

    res.json({ text });
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

export default router;
