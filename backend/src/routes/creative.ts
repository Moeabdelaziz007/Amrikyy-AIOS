import { Router, Request, Response } from 'express';
import { generateContent } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/creative/image
 * Image Generation endpoint
 * 
 * Body:
 * {
 *   "prompt": "A serene landscape at sunset",
 *   "style": "realistic",
 *   "aspectRatio": "16:9"
 * }
 */
router.post('/image', async (req: Request, res: Response) => {
  try {
    const { prompt, style = 'realistic', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string'
      });
    }

    // Note: This is a placeholder since actual image generation requires Imagen API
    // The frontend currently uses geminiAdvancedService directly
    res.json({
      status: 'info',
      message: 'Image generation should be handled client-side using Imagen API',
      prompt,
      style,
      aspectRatio,
      suggestion: 'Use the frontend Image Generator app which connects directly to Imagen API'
    });
  } catch (error: any) {
    console.error('Image generation endpoint error:', error.message);
    res.status(500).json({
      error: 'Image generation endpoint error',
      message: error.message
    });
  }
});

/**
 * POST /api/creative/video
 * Video Generation endpoint (Veo)
 * 
 * Body:
 * {
 *   "prompt": "A cat playing piano",
 *   "duration": 5,
 *   "aspectRatio": "16:9"
 * }
 */
router.post('/video', async (req: Request, res: Response) => {
  try {
    const { prompt, duration = 5, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    // Note: This is a placeholder since actual video generation requires Veo API
    // The frontend currently uses geminiAdvancedService directly
    res.json({
      status: 'info',
      message: 'Video generation should be handled client-side using Veo API',
      prompt,
      duration,
      aspectRatio,
      suggestion: 'Use the frontend Video Generator app which connects directly to Veo API'
    });
  } catch (error: any) {
    console.error('Video generation endpoint error:', error.message);
    res.status(500).json({
      error: 'Video generation endpoint error',
      message: error.message
    });
  }
});

/**
 * POST /api/creative/audio
 * Audio/Text-to-Speech endpoint
 * 
 * Body:
 * {
 *   "text": "Hello, this is a test",
 *   "voice": "en-US-Standard-A",
 *   "speed": 1.0
 * }
 */
router.post('/audio', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'en-US-Standard-A', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    // Note: Actual TTS requires Google Cloud Text-to-Speech API
    res.json({
      status: 'info',
      message: 'Audio generation requires Google Cloud Text-to-Speech API configuration',
      text,
      voice,
      speed,
      suggestion: 'Configure Google Cloud TTS API credentials to enable this feature'
    });
  } catch (error: any) {
    console.error('Audio generation endpoint error:', error.message);
    res.status(500).json({
      error: 'Audio generation endpoint error',
      message: error.message
    });
  }
});

/**
 * POST /api/creative/avatar
 * Avatar creation/generation endpoint
 * 
 * Body:
 * {
 *   "description": "Cyberpunk character with neon colors",
 *   "style": "3d"
 * }
 */
router.post('/avatar', async (req: Request, res: Response) => {
  try {
    const { description, style = '3d', name } = req.body;

    if (!description) {
      return res.status(400).json({
        error: 'Avatar description is required'
      });
    }

    const prompt = `Generate a detailed description for creating a ${style} avatar with the following characteristics: ${description}

Provide specifications for:
1. Visual appearance details
2. Color palette
3. Style elements
4. Unique features
5. Animation suggestions`;

    const avatarSpec = await generateContent(prompt);

    res.json({
      description,
      style,
      name: name || 'Custom Avatar',
      specifications: avatarSpec.trim(),
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Avatar generation error:', error.message);
    res.status(500).json({
      error: 'Failed to generate avatar specifications',
      message: error.message
    });
  }
});

/**
 * POST /api/creative/enhance-prompt
 * Enhance creative prompts for better results
 * 
 * Body:
 * {
 *   "prompt": "sunset",
 *   "type": "image" | "video" | "audio"
 * }
 */
router.post('/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'image' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const enhancementPrompt = `You are an expert at writing prompts for ${type} generation AI models.

Original prompt: "${prompt}"

Enhance this prompt to produce the best possible results. Include:
1. Detailed visual/audio descriptions
2. Style and mood
3. Technical specifications
4. Artistic elements

Provide only the enhanced prompt, nothing else.`;

    const enhanced = await generateContent(enhancementPrompt);

    res.json({
      original: prompt,
      enhanced: enhanced.trim(),
      type,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Prompt enhancement error:', error.message);
    res.status(500).json({
      error: 'Failed to enhance prompt',
      message: error.message
    });
  }
});

/**
 * GET /api/creative/health
 * Health check for creative APIs
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      services: ['image', 'video', 'audio', 'avatar', 'prompt-enhancement'],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
