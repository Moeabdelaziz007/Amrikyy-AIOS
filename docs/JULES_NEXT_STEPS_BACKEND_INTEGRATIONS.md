# 🚀 Jules TODO: Complete Backend API Integrations & Finish Project

**Created:** November 4, 2025  
**For:** Jules (google-labs-jules[bot])  
**Priority:** HIGH - Path to 100% Completion  
**Current Progress:** 60% → Target: 100%

---

## 📊 Current State

**Completed Infrastructure (60%):**
- ✅ Supabase Integration (Frontend)
- ✅ Backend TypeScript Server (Express, WebSocket, Telegram Bot)
- ✅ Automation Package Foundation (WorkflowEngine, TaskScheduler)
- ✅ AI Services (Gemini, Voice)

**Missing for Production (40%):**
- Backend API Routes Implementation
- External Service Integrations (Gmail, Calendar, Telegram, etc.)
- Workflow Engine UI & Database
- PWA Configuration
- Final Testing & Deployment

---

## 🎯 Phase 1: Complete Backend API Routes & Service Integrations (15% - Days 1-3)

### Priority 1: Complete Existing API Routes

#### Task A: Finish Auth Router (`backend/src/routes/auth.ts`)
**Current State:** Placeholder routes exist  
**Needed:**

```typescript
// backend/src/routes/auth.ts - Complete Implementation

import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/signout
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Signed out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
```

**Checkpoint:** Test with curl/Postman - all auth endpoints return 200

---

#### Task B: Complete Knowledge Router (`backend/src/routes/knowledge.ts`)
**Current State:** Placeholder  
**Needed:**

```typescript
// backend/src/routes/knowledge.ts

import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(verifyAuth);

// GET /api/knowledge - List user's knowledge entries
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ entries: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/knowledge - Create entry
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, tags } = req.body;
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        user_id: userId,
        title,
        content,
        tags: tags || []
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ entry: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/knowledge/:id - Update entry
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .update({ title, content, tags })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ entry: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/knowledge/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/knowledge/search - Search entries
router.get('/search', async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ entries: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Checkpoint:** Full CRUD operations working via API

---

#### Task C: Complete Agents Router (`backend/src/routes/agents.ts`)

```typescript
// backend/src/routes/agents.ts

import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();
router.use(verifyAuth);

// GET /api/agents
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ agents: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, role, icon, personality, skills } = req.body;
    
    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name,
        role,
        icon,
        personality,
        skill_ids: skills || []
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ agent: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/agents/:id
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, role, icon, personality, skills } = req.body;
    
    const { data, error } = await supabase
      .from('agents')
      .update({
        name,
        role,
        icon,
        personality,
        skill_ids: skills
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ agent: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    res.json({ message: 'Agent deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Checkpoint:** Agents CRUD working via API

---

### Priority 2: External Service Integrations

#### Task D: Gmail Integration Service

**Create:** `backend/src/services/gmailService.ts`

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

export class GmailService {
  private oauth2Client: OAuth2Client;
  
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }
  
  // Get authorization URL for user
  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId
    });
  }
  
  // Exchange code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
  
  // Send email
  async sendEmail(
    accessToken: string,
    to: string,
    subject: string,
    body: string
  ): Promise<void> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
  }
  
  // List recent emails
  async listEmails(accessToken: string, maxResults: number = 10) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults
    });
    
    return response.data.messages || [];
  }
  
  // Get email details
  async getEmail(accessToken: string, messageId: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });
    
    return response.data;
  }
}

export const gmailService = new GmailService();
```

**Create Router:** `backend/src/routes/gmail.ts`

```typescript
import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { gmailService } from '../services/gmailService.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

// GET /api/gmail/auth-url
router.get('/auth-url', (req, res) => {
  const authUrl = gmailService.getAuthUrl(req.user.id);
  res.json({ authUrl });
});

// POST /api/gmail/callback
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const tokens = await gmailService.getTokens(code);
    
    // Store tokens in user_integrations table
    await supabase
      .from('user_integrations')
      .upsert({
        user_id: req.user.id,
        service: 'gmail',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expiry_date || 3600000))
      });
    
    res.json({ message: 'Gmail connected successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/gmail/send
router.post('/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    // Get user's Gmail token
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'gmail')
      .single();
    
    if (!data) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }
    
    await gmailService.sendEmail(data.access_token, to, subject, body);
    res.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gmail/emails
router.get('/emails', async (req, res) => {
  try {
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'gmail')
      .single();
    
    if (!data) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }
    
    const emails = await gmailService.listEmails(data.access_token);
    res.json({ emails });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Environment Variables Needed:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback
```

**Database Table Needed:**
```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own integrations
CREATE POLICY "Users can manage their own integrations"
  ON user_integrations
  FOR ALL
  USING (auth.uid() = user_id);
```

**Checkpoint:** Send email via Gmail API successfully

---

#### Task E: Google Calendar Integration

**Create:** `backend/src/services/calendarService.ts`

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class CalendarService {
  private oauth2Client: OAuth2Client;
  
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }
  
  // Create event
  async createEvent(
    accessToken: string,
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    attendees?: string[]
  ) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
    
    return response.data;
  }
  
  // List upcoming events
  async listEvents(accessToken: string, maxResults: number = 10) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return response.data.items || [];
  }
  
  // Delete event
  async deleteEvent(accessToken: string, eventId: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
  }
}

export const calendarService = new CalendarService();
```

**Create Router:** `backend/src/routes/calendar.ts`

```typescript
import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { calendarService } from '../services/calendarService.js';
import { supabase } from '../services/supabase.js';

const router = Router();
router.use(verifyAuth);

// POST /api/calendar/events
router.post('/events', async (req, res) => {
  try {
    const { summary, description, startTime, endTime, attendees } = req.body;
    
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'google')
      .single();
    
    if (!data) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }
    
    const event = await calendarService.createEvent(
      data.access_token,
      summary,
      description,
      startTime,
      endTime,
      attendees
    );
    
    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/calendar/events
router.get('/events', async (req, res) => {
  try {
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'google')
      .single();
    
    if (!data) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }
    
    const events = await calendarService.listEvents(data.access_token);
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/calendar/events/:id
router.delete('/events/:id', async (req, res) => {
  try {
    const { data } = await supabase
      .from('user_integrations')
      .select('access_token')
      .eq('user_id', req.user.id)
      .eq('service', 'google')
      .single();
    
    if (!data) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }
    
    await calendarService.deleteEvent(data.access_token, req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Checkpoint:** Create and list calendar events successfully

---

#### Task F: Enhanced Telegram Bot Features

**Update:** `backend/src/telegram/bot.ts`

```typescript
import { Telegraf, Context } from 'telegraf';
import { supabase } from '../services/supabase.js';
import { geminiService } from '../services/gemini.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Store user sessions
const userSessions = new Map<number, { userId: string }>();

// /start - Welcome message
bot.command('start', (ctx) => {
  ctx.reply(
    '🤖 Welcome to Amrikyy AIOS Bot!\n\n' +
    'Commands:\n' +
    '/link - Link your account\n' +
    '/ai <question> - Ask AI assistant\n' +
    '/notes - List your knowledge entries\n' +
    '/agents - List your agents\n' +
    '/help - Show all commands'
  );
});

// /link - Link Telegram to user account
bot.command('link', (ctx) => {
  const linkCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  ctx.reply(
    `🔗 Link your account:\n\n` +
    `1. Go to your Amrikyy AIOS app\n` +
    `2. Navigate to Settings > Integrations\n` +
    `3. Enter this code: ${linkCode}\n\n` +
    `This code expires in 5 minutes.`
  );
  
  // Store link code in database
  supabase
    .from('telegram_link_codes')
    .insert({
      code: linkCode,
      telegram_user_id: ctx.from.id,
      expires_at: new Date(Date.now() + 5 * 60 * 1000)
    });
});

// /ai - AI assistant
bot.command('ai', async (ctx) => {
  try {
    const question = ctx.message.text.replace('/ai', '').trim();
    if (!question) {
      return ctx.reply('Please provide a question. Example: /ai What is AI?');
    }
    
    ctx.reply('🤔 Thinking...');
    
    const response = await geminiService.generateResponse(question);
    ctx.reply(`🤖 ${response}`);
  } catch (error) {
    ctx.reply('Sorry, I encountered an error processing your request.');
  }
});

// /notes - List knowledge entries
bot.command('notes', async (ctx) => {
  try {
    const session = userSessions.get(ctx.from.id);
    if (!session) {
      return ctx.reply('Please link your account first using /link');
    }
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return ctx.reply('You have no knowledge entries yet.');
    }
    
    let message = '📚 Your Recent Notes:\n\n';
    data.forEach((note, i) => {
      message += `${i + 1}. ${note.title}\n${note.content.substring(0, 100)}...\n\n`;
    });
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply('Error fetching notes.');
  }
});

// /agents - List agents
bot.command('agents', async (ctx) => {
  try {
    const session = userSessions.get(ctx.from.id);
    if (!session) {
      return ctx.reply('Please link your account first using /link');
    }
    
    const { data, error } = await supabase
      .from('agents')
      .select('name, role')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return ctx.reply('You have no agents yet.');
    }
    
    let message = '🤖 Your Agents:\n\n';
    data.forEach((agent, i) => {
      message += `${i + 1}. ${agent.name} (${agent.role})\n`;
    });
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply('Error fetching agents.');
  }
});

// /help - Show all commands
bot.command('help', (ctx) => {
  ctx.reply(
    '📖 Available Commands:\n\n' +
    '/start - Start the bot\n' +
    '/link - Link your Amrikyy AIOS account\n' +
    '/ai <question> - Ask AI assistant\n' +
    '/notes - List your knowledge entries\n' +
    '/agents - List your agents\n' +
    '/help - Show this help message'
  );
});

// Handle any text message (treat as AI question)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Skip if it's a command
  if (text.startsWith('/')) return;
  
  try {
    ctx.reply('🤔 Processing...');
    const response = await geminiService.generateResponse(text);
    ctx.reply(`🤖 ${response}`);
  } catch (error) {
    ctx.reply('Sorry, I encountered an error. Try using /ai command instead.');
  }
});

export async function launchBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not set, skipping bot launch');
    return;
  }
  
  try {
    await bot.launch();
    console.log('✅ Telegram bot launched successfully');
    
    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to launch Telegram bot:', error);
  }
}
```

**Database Table for Telegram Linking:**
```sql
CREATE TABLE telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  telegram_user_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all codes
CREATE POLICY "Service can manage link codes"
  ON telegram_link_codes
  FOR ALL
  TO service_role
  USING (true);
```

**Checkpoint:** Telegram bot responds to all commands

---

### Priority 3: Update Main Server to Include All Routes

**Update:** `backend/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import http from 'http';
import authRouter from './routes/auth.js';
import knowledgeRouter from './routes/knowledge.js';
import agentsRouter from './routes/agents.js';
import gmailRouter from './routes/gmail.js';
import calendarRouter from './routes/calendar.js';
import { setupWebSocket } from './websocket/server.js';
import { launchBot } from './telegram/bot.js';

const app = express();
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
app.use('/api/gmail', gmailRouter);
app.use('/api/calendar', calendarRouter);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket server ready`);
  
  // Launch Telegram bot
  launchBot();
});
```

**Checkpoint:** All routes accessible and working

---

## 🎯 Phase 2: Complete Workflow Engine Integration (10% - Days 4-5)

### Task G: Create Workflow Database Tables

```sql
-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  trigger_data JSONB,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled tasks table
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cron_expression TEXT NOT NULL,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their workflows"
  ON workflows FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their executions"
  ON workflow_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage executions"
  ON workflow_executions FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can view their tasks"
  ON scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage tasks"
  ON scheduled_tasks FOR ALL
  TO service_role
  USING (true);
```

**Checkpoint:** Tables created and RLS working

---

### Task H: Create Workflows API Router

**Create:** `backend/src/routes/workflows.ts`

```typescript
import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  saveWorkflow,
  getWorkflows,
  deleteWorkflow,
  saveExecution
} from '../services/workflowService.js';

const router = Router();
router.use(verifyAuth);

// GET /api/workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await getWorkflows(req.user.id);
    res.json({ workflows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workflows
router.post('/', async (req, res) => {
  try {
    const workflow = await saveWorkflow({
      userId: req.user.id,
      ...req.body
    });
    res.json({ workflow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteWorkflow(req.params.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workflows/:id/execute
router.post('/:id/execute', async (req, res) => {
  try {
    const { WorkflowEngine } = await import('../../packages/automation/src/index.js');
    const workflows = await getWorkflows(req.user.id);
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const engine = new WorkflowEngine();
    
    engine.on('workflow:complete', async (execution) => {
      await saveExecution(execution);
    });
    
    const execution = await engine.execute(workflow, req.body.triggerData || {});
    res.json({ execution });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Update server.ts:**
```typescript
import workflowsRouter from './routes/workflows.js';
app.use('/api/workflows', workflowsRouter);
```

**Checkpoint:** Workflows can be created, listed, executed via API

---

## 🎯 Phase 3: PWA Configuration (5% - Day 6)

### Task I: Setup PWA with Vite Plugin

**Install Dependencies:**
```bash
npm install -D vite-plugin-pwa
```

**Update:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Amrikyy AIOS',
        short_name: 'AIOS',
        description: 'Advanced AI Operating System',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ]
});
```

**Create PWA Icons:**
Place in `/public/`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png`
- `favicon.ico`

**Checkpoint:** PWA installs on mobile/desktop, works offline

---

## 🎯 Phase 4: Final Testing & Polish (10% - Days 7-8)

### Task J: Integration Testing Suite

**Create:** `backend/tests/api.test.ts`

```typescript
import request from 'supertest';
import { app } from '../src/server';

describe('API Integration Tests', () => {
  let authToken: string;
  
  test('POST /api/auth/signup', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'testpass123',
        fullName: 'Test User'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
  
  test('POST /api/auth/signin', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'testpass123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.session).toBeDefined();
    authToken = response.body.session.access_token;
  });
  
  test('POST /api/knowledge', async () => {
    const response = await request(app)
      .post('/api/knowledge')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Entry',
        content: 'Test content',
        tags: ['test']
      });
    
    expect(response.status).toBe(200);
    expect(response.body.entry).toBeDefined();
  });
  
  // Add more tests...
});
```

**Checkpoint:** All API tests passing

---

### Task K: Performance Optimization

**Update:** `backend/src/middleware/cache.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

const cache = new Map<string, { data: any; expires: number }>();

export function cacheMiddleware(duration: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }
    
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, {
        data,
        expires: Date.now() + duration * 1000
      });
      return originalJson(data);
    };
    
    next();
  };
}
```

Use in routes:
```typescript
router.get('/knowledge', cacheMiddleware(60), async (req, res) => {
  // Handler
});
```

**Checkpoint:** API response times < 200ms

---

## 📦 Dependencies to Install

```bash
# Backend
cd backend
npm install googleapis google-auth-library
npm install -D @types/google-auth-library

# Root (PWA)
cd ..
npm install -D vite-plugin-pwa

# Testing
npm install -D supertest @types/supertest
```

---

## ✅ Final Checklist

**Backend APIs (15%):**
- [ ] Auth router complete
- [ ] Knowledge router complete
- [ ] Agents router complete
- [ ] Gmail integration working
- [ ] Calendar integration working
- [ ] Telegram bot enhanced
- [ ] All routes in server.ts

**Workflow Engine (10%):**
- [ ] Database tables created
- [ ] Workflows API router complete
- [ ] Engine execution working
- [ ] Scheduled tasks functional

**PWA (5%):**
- [ ] Vite PWA plugin configured
- [ ] Manifest.json created
- [ ] Service worker caching
- [ ] Offline functionality
- [ ] PWA icons generated

**Testing & Polish (10%):**
- [ ] Integration tests written
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Error handling complete
- [ ] Documentation updated

**Environment Setup:**
- [ ] `.env.example` updated with all keys
- [ ] Google OAuth credentials obtained
- [ ] Telegram bot token configured
- [ ] Database tables created

---

## 🎯 Success Metrics

- **API Response Time:** < 200ms average
- **Test Coverage:** > 80%
- **PWA Lighthouse Score:** > 90
- **Build Success:** ✅ No errors
- **All Apps Working:** 89/89 functional
- **External Integrations:** Gmail, Calendar, Telegram all working

---

## 📅 Timeline to 100% Completion

| Day | Tasks | Progress |
|-----|-------|----------|
| 1-2 | Complete API routes (auth, knowledge, agents) | 60% → 70% |
| 3 | Gmail & Calendar integrations | 70% → 80% |
| 4-5 | Workflow engine database & UI | 80% → 90% |
| 6 | PWA configuration | 90% → 95% |
| 7-8 | Testing, polish, deployment | 95% → 100% |

**Total:** 8 days to 100% completion

---

## 🚀 Next Immediate Actions

1. **Start with Task A:** Complete auth router
2. **Then Task B:** Complete knowledge router
3. **Then Task C:** Complete agents router
4. **Test each:** Use Postman/curl to verify
5. **Move to Gmail:** Task D for external integrations

**Let's finish this! 🎉**
