import express from 'express';
import cors from 'cors';
import http from 'http';
import authRouter from './routes/auth.js';
import knowledgeRouter from './routes/knowledge.js';
import agentsRouter from './routes/agents.js';
import aiRouter from './routes/ai.js';
import searchRouter from './routes/search.js';
import gmailRouter from './routes/gmail.js';
import calendarRouter from './routes/calendar.js';
import workflowsRouter from './routes/workflows.js';
import projectsRouter from './routes/projects.js';
import memoryRouter from './routes/memory.js';
import developerRouter from './routes/developer.js';
import marketplaceRouter from './routes/marketplace.js';
import creativeRouter from './routes/creative.js';
import chatRouter from './routes/chat.js';
import speechRouter from './routes/speech.js';
import embeddingsRouter from './routes/embeddings.js';
import creatorRouter from './routes/creator.js';
import youtubeRouter from './routes/youtube.js';
import geminiRouter from './routes/geminiRoutes.js'; // Import Gemini routes
import transcriptionRouter from './routes/transcription.js'; // Import Transcription routes
import { setupWebSocket } from './websocket/server.js';
import { launchBot } from './telegram/bot.js';
import { qdrantService } from './services/qdrantService.js';
import { redisService } from './services/redisService.js';

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload size limit for audio data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
 res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/search', searchRouter);
app.use('/api/gmail', gmailRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/developer', developerRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/creative', creativeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/speech', speechRouter);
app.use('/api/embeddings', embeddingsRouter);
app.use('/api/creator', creatorRouter);
app.use('/api/youtube', youtubeRouter);
app.use('/api/gemini', geminiRouter); // Add Gemini routes
app.use('/api/transcribe', transcriptionRouter); // Add Transcription routes


// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Initialize services
  qdrantService.connect().catch(console.error);
  redisService.connect().catch(console.error);

  server.listen(PORT, () => {
   console.log(`✅ Server running on http://localhost:${PORT}`);
   console.log(`✅ WebSocket server ready`);

   // Launch Telegram bot
   launchBot();
  });
}
