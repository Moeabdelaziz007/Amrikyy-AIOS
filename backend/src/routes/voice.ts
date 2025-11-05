import { Router } from 'express';

const router = Router();
import { Router } from 'express';
router.post('/voice-command', async (req, res) => {
  try {
    const { text } = req.body;

    // Mock AI processing - in real app, call Gemini API
    const command = parseCommand(text);

    res.json({
      success: true,
      command,
      originalText: text
    });
  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ error: 'Failed to process voice command' });
  }
});

function parseCommand(text: string) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('افتح') || lowerText.includes('open')) {
    const appMatch = lowerText.match(/(افتح|open)\s+(.+)/);
    if (appMatch) {
      return {
        type: 'open_app',
        app: appMatch[2].trim()
      };
    }
  }

  if (lowerText.includes('بحث') || lowerText.includes('search')) {
    const searchMatch = lowerText.match(/(بحث عن|search for|search)\s+(.+)/);
    if (searchMatch) {
      return {
        type: 'search',
        query: searchMatch[2].trim()
      };
    }
  }

  if (lowerText.includes('إنشاء') || lowerText.includes('create')) {
    if (lowerText.includes('فيديو') || lowerText.includes('video')) {
      return {
        type: 'create_video'
      };
    }
    if (lowerText.includes('صورة') || lowerText.includes('image')) {
      return {
        type: 'create_image'
      };
    }
  }

  return {
    type: 'unknown',
    text: text
  };
}

export default router;
import os from 'os';

const router = Router();

router.get('/system', async (req, res) => {
  try {
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const memUsage = (1 - os.freemem() / os.totalmem()) * 100;

    // Mock active agents count - in real app, query database
    const activeAgents = 3;

    res.json({
      cpu: Math.round(cpuUsage),
      memory: Math.round(memUsage),
      activeAgents
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

export default router;
