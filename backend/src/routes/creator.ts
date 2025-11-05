import { Router } from 'express';
import { generateMusic, generateVideo, generateTravelPlan } from '../services/geminiAdvancedService.js';
import { embedText } from '../services/geminiEmbeddingService.js';

const router = Router();

// POST /api/creator/compose
// Body: { title, description, youtubeTitle, youtubeDescription, tags[] }
router.post('/compose', async (req, res) => {
  try {
    const { title, description, target } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Missing title or description' });

    // Create embeddings for metadata
    const embed = await embedText(`${title}\n${description}`);

    // Generate music track (short) and a short video/visual using Veo
    const music = await generateMusic(description, 20).catch(e => ({ audioUrl: '', description: e.message }));
    const videoGen = generateVideo(description); // returns { jobId }

    // For YouTube, we prepare metadata and return to the client for upload
    const youtubeMeta = {
      title: title || target || 'Untitled',
      description: description,
      tags: req.body.tags || [],
      privacy: req.body.privacy || 'private'
    };

    res.json({ embedVector: embed, music, videoJob: await videoGen, youtubeMeta });
  } catch (e: any) {
    console.error('Creator compose error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
h q