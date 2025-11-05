    }

import express from 'express';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // memory storage

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY || '';

if (!GOOGLE_API_KEY) {
  console.warn('Warning: GOOGLE_API_KEY is not set. Speech endpoints will fail without a valid key.');
}

// Allowed mime types and size limit (5 MB)
const ALLOWED_MIME = new Set(['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp3', 'audio/mpeg']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/speech/transcribe
// Expects multipart/form-data with `audio` file field (webm/ogg/wav)
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided (field name: audio).' });

    const { originalname, mimetype, size, buffer } = req.file as Express.Multer.File;

    if (!ALLOWED_MIME.has(mimetype)) {
    }

    if (size > MAX_BYTES) {
      return res.status(413).json({ error: `Audio file too large (${(size / (1024*1024)).toFixed(2)} MB). Max allowed: ${(MAX_BYTES / (1024*1024)).toFixed(2)} MB.` });
      return res.status(415).json({ error: `Unsupported audio format: ${mimetype}. Allowed: ${Array.from(ALLOWED_MIME).join(', ')}` });
    if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'Server misconfigured: missing GOOGLE_API_KEY.' });

    const buffer = req.file.buffer;
    const base64 = buffer.toString('base64');

    const body = {
      audio: { content: base64 },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US'
      }
    };

    const resp = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(Math.max(502, resp.status)).json({ error: `Google Speech API error: ${resp.status} ${txt}` });
    }

    const data = await resp.json();
    const transcript = data?.results?.map((r: any) => r.alternatives?.[0]?.transcript).join(' ') || null;
    return res.json({ transcript });
  } catch (err: any) {
    console.error('Transcribe error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// POST /api/speech/synthesize
// Expects JSON { text }
router.post('/synthesize', express.json(), async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing `text` in body.' });
    if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'Server misconfigured: missing GOOGLE_API_KEY.' });
    const body = {
      input: { text },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' }
    };

    const resp = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(Math.max(502, resp.status)).json({ error: `Google TTS API error: ${resp.status} ${txt}` });
    }

    const data = await resp.json();
    const audioContent = data?.audioContent;
    if (!audioContent) return res.status(502).json({ error: 'Google TTS returned no audio content.' });

    // Return base64 audio content to client
    return res.json({ audioContent });
  } catch (err: any) {
    console.error('Synthesize error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;

