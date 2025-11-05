import express from 'express';
import {
  generateContent,
  startChat,
  searchWithGemini,
  generateCode,
  summarizeText,
  analyzeSentiment,
  extractKeywords,
  translateText,
  generateImage,
} from '../services/gemini.js';

const router = express.Router();

// Middleware to handle errors gracefully
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to generate content
router.post('/generate', asyncHandler(async (req, res) => {
  const { prompt, generationConfig, safetySettings } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  const content = await generateContent(prompt, generationConfig, safetySettings);
  res.json({ content });
}));

// Route to handle chat sessions
router.post('/chat', asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }
  const response = await startChat(messages);
  res.json({ response });
}));

// Route for Gemini search (with optional web search)
router.post('/search', asyncHandler(async (req, res) => {
  const { query, includeWebSearch } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  const result = await searchWithGemini({ query, includeWebSearch });
  res.json(result);
}));

// Route to generate code
router.post('/code', asyncHandler(async (req, res) => {
  const { language, description } = req.body;
  if (!language || !description) {
    return res.status(400).json({ error: 'Language and description are required' });
  }
  const code = await generateCode(language, description);
  res.json({ code });
}));

// Route to summarize text
router.post('/summarize', asyncHandler(async (req, res) => {
  const { text, maxWords } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const summary = await summarizeText(text, maxWords);
  res.json({ summary });
}));

// Route to analyze sentiment
router.post('/sentiment', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const analysis = await analyzeSentiment(text);
  res.json(analysis);
}));

// Route to extract keywords
router.post('/keywords', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const keywords = await extractKeywords(text);
  res.json({ keywords });
}));

// Route to translate text
router.post('/translate', asyncHandler(async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Text and target language are required' });
  }
  const translation = await translateText(text, targetLanguage);
  res.json({ translation });
}));

// Route to generate an image
router.post('/image', asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  const imageUrl = await generateImage(prompt);
  res.json({ imageUrl });
}));

export default router;
