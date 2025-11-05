import express from 'express';
import { transcribeAudio } from '../services/transcriptionService.js';

const router = express.Router();

// Middleware for graceful error handling
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to transcribe audio
router.post('/transcribe', asyncHandler(async (req, res) => {
  const { audioBase64, languageCode } = req.body;

  if (!audioBase64 || !languageCode) {
    return res.status(400).json({ error: 'audioBase64 and languageCode are required' });
  }

  // The base64 string may have a data URI prefix, e.g., "data:audio/webm;base64,". We need to remove it.
  const pureBase64 = audioBase64.split(',')[1] || audioBase64;

  const transcription = await transcribeAudio(pureBase64, languageCode);
  res.json({ transcription });
}));

export default router;
