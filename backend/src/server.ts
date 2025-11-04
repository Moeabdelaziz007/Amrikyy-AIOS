import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import authRouter from './routes/auth.js';
import agentsRouter from './routes/agents.js';
import knowledgeRouter from './routes/knowledge.js';
import { verifyAuth } from './middleware/auth.js';
import { setupWebSocket } from './websocket/server.js';
import { launchBot } from './telegram/bot.js';

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
