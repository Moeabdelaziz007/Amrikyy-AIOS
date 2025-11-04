import { Router } from "express";
import { askGemini, startChat } from "../services/gemini.js";
import { verifyAuth } from "../middleware/auth.js";

const router = Router();

router.post("/ask", verifyAuth, async (req, res) => {
  try {
    const result = await askGemini(req.body.prompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ask Gemini' });
  }
});

router.post("/chat", verifyAuth, async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const text = await startChat(messages);

        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

export default router;
