import { Router } from 'express';
import { generateContent } from '../services/gemini.js';
import { generateMusic, generateVideo, getVideoStatus } from '../services/geminiAdvancedService.js';
import { uploadVideoToYouTube } from '../services/youtubeService.js';

const router = Router();

// In-memory job store (for demonstration purposes)
const jobStore: Record<string, any> = {};

// POST /api/creator/start
// Body: { idea: string }
router.post('/start', async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'Idea is required' });

  try {
    // 1. Generate a detailed prompt from the user's idea
    const promptGenerationPrompt = `Based on the user's idea: "${idea}", generate a detailed, visually rich prompt for a 30-second video. Also, create a suitable title and a YouTube description with relevant tags. Return this as a JSON object with keys: "title", "description", "tags", "videoPrompt", "musicPrompt".`;
    const generatedPrompts = await generateContent(promptGenerationPrompt, { responseMimeType: 'application/json' });
    const { title, description, tags, videoPrompt, musicPrompt } = JSON.parse(generatedPrompts);

    // 2. Start video and music generation (async)
    const videoJob = await generateVideo(videoPrompt);
    const musicJob = await generateMusic(musicPrompt, 30).catch(e => ({ error: e.message }));

    // 3. Store job details
    const jobId = `job_${Date.now()}`;
    jobStore[jobId] = {
      status: 'processing',
      videoJobId: videoJob.jobId,
      musicJob,
      youtubeMeta: { title, description, tags, privacy: 'private' },
      createdAt: new Date().toISOString(),
    };

    res.status(202).json({ jobId, message: 'Creative process started.', details: jobStore[jobId] });

  } catch (e: any) {
    console.error('Creator start error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/creator/status/:jobId
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = jobStore[jobId];

  if (!job) return res.status(404).json({ error: 'Job not found' });

  try {
    // Check video generation status
    const videoStatus = await getVideoStatus(job.videoJobId);
    job.videoStatus = videoStatus;

    if (videoStatus.state === 'COMPLETED' && job.status !== 'ready') {
      job.status = 'ready';
      job.videoUrl = videoStatus.video.url; // Assuming the status check returns the final URL
    }

    res.json(job);
  } catch (e: any) {
    console.error('Job status error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/creator/upload
// Body: { jobId: string }
router.post('/upload', async (req, res) => {
  const { jobId } = req.body;
  const job = jobStore[jobId];

  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'ready' || !job.videoUrl) return res.status(400).json({ error: 'Video is not ready for upload.' });

  try {
    const uploadResult = await uploadVideoToYouTube(job.youtubeMeta, job.videoUrl);
    job.status = 'uploaded';
    job.youtubeUrl = `https://youtu.be/${uploadResult.id}`;

    res.json({ message: 'Upload successful!', youtubeUrl: job.youtubeUrl, details: job });
  } catch (e: any) {
    console.error('Upload error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
