import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import authRouter from './routes/auth';
import agentsRouter from './routes/agents';
import knowledgeRouter from './routes/knowledge';
import { verifyAuth, AuthenticatedRequest } from './middleware/auth';
import { generateContent, startChat } from './services/gemini';
import { supabase } from './services/supabase';
import { setupWebSocket } from './websocket/server';
import { launchBot } from './telegram/bot';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/agents', verifyAuth, agentsRouter);
app.use('/api/knowledge', verifyAuth, knowledgeRouter);


// Gemini API endpoints (protected)
app.post('/api/gemini/generate', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt, model = 'gemini-pro' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = await generateContent(prompt, model);

    res.json({ text, user: req.user.email });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/gemini/chat', verifyAuth, async (req, res) => {
  try {
    const { messages, model = 'gemini-pro' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const text = await startChat(messages, model);

    res.json({ text });
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// User profile endpoints (examples)
app.get('/api/user/profile', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { display_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: req.user.id,
        display_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Setup WebSocket server
setupWebSocket(server);

// Launch Telegram bot
if (process.env.TELEGRAM_BOT_TOKEN) {
    launchBot();
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
