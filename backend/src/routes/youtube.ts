import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

// POST /api/youtube/upload
// Accepts multipart form with: video file, thumbnail (optional), metadata (title, description, tags[])
// This is a placeholder that stores metadata and file references and returns an upload id.
router.post('/upload', async (req, res) => {
  try {
    // For now, we accept JSON body with youtubeMeta and videoUrl pointing to preuploaded asset
    const { youtubeMeta, videoUrl } = req.body || {};
    if (!youtubeMeta || !videoUrl) return res.status(400).json({ error: 'Missing youtubeMeta or videoUrl' });

    // Store draft in supabase (or mock storage)
    const { data, error } = await supabase.from('youtube_uploads').insert([{ metadata: youtubeMeta, video_url: videoUrl, status: 'draft' }]).select().single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ uploadId: data.id, status: data.status });
  } catch (e: any) {
    console.error('YouTube upload error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
