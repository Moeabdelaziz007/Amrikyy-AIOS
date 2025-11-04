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
import { setupWebSocket } from './websocket/server.js';
import { launchBot } from './telegram/bot.js';

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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


// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
   console.log(`✅ Server running on http://localhost:${PORT}`);
   console.log(`✅ WebSocket server ready`);

   // Launch Telegram bot
   launchBot();
  });
}
