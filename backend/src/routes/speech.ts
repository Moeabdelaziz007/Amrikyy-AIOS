import express from 'express';
import {
  synthesizeSpeech,
  listVoices,
  VoiceSelectionParams,
} from '../services/speech.js';

const router = express.Router();

// Middleware for graceful error handling
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to synthesize speech
router.post('/synthesize', asyncHandler(async (req, res) => {
  const { text, voice } = req.body as { text: string; voice: VoiceSelectionParams };

  if (!text || !voice) {
    return res.status(400).json({ error: 'Text and voice selection are required' });
  }

  // Basic validation for voice params
  if (!voice.languageCode) {
      return res.status(400).json({ error: 'languageCode is a required voice parameter.' });
  }

  const audioContent = await synthesizeSpeech(text, voice);
  res.json({ audioContent });
}));

// Route to list available voices
router.get('/voices', asyncHandler(async (req, res) => {
    const { languageCode } = req.query as { languageCode?: string };
    const voices = await listVoices(languageCode);
    res.json({ voices });
}));

export default router;
