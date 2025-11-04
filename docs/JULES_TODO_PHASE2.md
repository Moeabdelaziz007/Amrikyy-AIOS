# 📋 TODO List for Jules Agent - Phase 2: Backend & Workflow Infrastructure

**Created:** November 4, 2025  
**Phase:** Infrastructure & Workflow (Post-Supabase Integration)  
**Priority:** HIGH  
**Estimated Duration:** 3-5 days

---

## 🎯 Mission Overview

Build the backend infrastructure layer to support real-time operations, automation workflows, and external integrations. This phase connects the Supabase-powered frontend with server-side services, event processing, and bot interfaces.

---

## ✅ Prerequisites (Already Complete)

- [x] Supabase Integration (Task 5) - All 3 apps integrated
- [x] AI Engine & Voice Services (Task 3)
- [x] Authentication Layer with AuthContext
- [x] Real-time subscriptions working
- [x] Integration tests passing
- [x] Security scan clean (0 vulnerabilities)

---

## 🔥 Phase 2 Tasks

### Task 10: Backend Services Setup ⚡ **HIGHEST PRIORITY**

#### 10.1 Initialize Backend Project Structure

**Directory Setup:**
```bash
mkdir -p backend/src/routes
mkdir -p backend/src/services
mkdir -p backend/src/utils
mkdir -p backend/src/middleware
mkdir -p backend/src/types
```

**Files to Create:**
- [ ] `backend/package.json` - Backend dependencies configuration
- [ ] `backend/tsconfig.json` - TypeScript config for backend
- [ ] `backend/.env.example` - Environment template
- [ ] `backend/src/server.ts` - Main Express server
- [ ] `backend/src/config.ts` - Configuration loader
- [ ] `backend/README.md` - Backend documentation

**Dependencies to Install:**
```bash
cd backend
npm init -y
npm install express cors dotenv
npm install ws telegraf
npm install @supabase/supabase-js
npm install --save-dev typescript @types/node @types/express @types/cors @types/ws
npm install --save-dev ts-node nodemon
```

**Checkpoint 1:** ✅ Backend structure created, dependencies installed

---

#### 10.2 Create Express API Server

**File:** `backend/src/server.ts`

**Implementation Tasks:**
- [ ] Set up Express app with TypeScript
- [ ] Configure CORS middleware (allow frontend origin)
- [ ] Add body-parser middleware
- [ ] Create `/health` endpoint (returns `{ status: 'ok', timestamp: Date.now() }`)
- [ ] Add error handling middleware
- [ ] Set up port configuration from environment
- [ ] Add request logging middleware

**File:** `backend/src/routes/auth.ts`

**Implementation Tasks:**
- [ ] Create `POST /api/auth/verify` - Verify Supabase token
- [ ] Create `POST /api/auth/refresh` - Refresh user session
- [ ] Create `GET /api/auth/user` - Get current user info
- [ ] Add JWT middleware for protected routes

**File:** `backend/src/routes/agents.ts`

**Implementation Tasks:**
- [ ] Create `GET /api/agents` - List user's agents
- [ ] Create `POST /api/agents` - Create new agent
- [ ] Create `PUT /api/agents/:id` - Update agent
- [ ] Create `DELETE /api/agents/:id` - Delete agent
- [ ] Create `POST /api/agents/:id/execute` - Execute agent task

**File:** `backend/src/routes/knowledge.ts`

**Implementation Tasks:**
- [ ] Create `GET /api/knowledge` - Search knowledge base
- [ ] Create `POST /api/knowledge` - Add knowledge entry
- [ ] Create `PUT /api/knowledge/:id` - Update entry
- [ ] Create `DELETE /api/knowledge/:id` - Delete entry
- [ ] Create `GET /api/knowledge/suggest` - AI-powered suggestions

**Scripts to Add in package.json:**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

**Checkpoint 2:** ✅ Express server running on http://localhost:4000
**Checkpoint 3:** ✅ `/health` endpoint returns 200 OK
**Checkpoint 4:** ✅ All API routes respond correctly

---

#### 10.3 WebSocket Server Implementation

**File:** `backend/src/websocket/server.ts`

**Implementation Tasks:**
- [ ] Set up WebSocket server alongside Express
- [ ] Implement connection handler
- [ ] Implement disconnection handler with cleanup
- [ ] Create room/channel system for broadcasts
- [ ] Add authentication for WebSocket connections
- [ ] Implement heartbeat/ping-pong for connection health

**File:** `backend/src/websocket/handlers.ts`

**Event Handlers:**
- [ ] `subscribe:knowledge` - Subscribe to knowledge updates
- [ ] `subscribe:agents` - Subscribe to agent updates
- [ ] `broadcast:message` - Broadcast to all connected clients
- [ ] `room:join` - Join specific room
- [ ] `room:leave` - Leave room

**Features:**
- [ ] Real-time knowledge base updates broadcast
- [ ] Agent status updates broadcast
- [ ] Collaborative editing support
- [ ] Presence tracking (who's online)

**Checkpoint 5:** ✅ WebSocket server running
**Checkpoint 6:** ✅ Echo test successful (send message, receive back)
**Checkpoint 7:** ✅ Room broadcasts working

---

#### 10.4 Telegram Bot Integration

**File:** `backend/src/telegram/bot.ts`

**Setup Tasks:**
- [ ] Initialize Telegraf bot
- [ ] Configure bot token from environment
- [ ] Set up webhook or long polling
- [ ] Add command error handling
- [ ] Add rate limiting

**Commands to Implement:**
- [ ] `/start` - Welcome message with capabilities
- [ ] `/help` - List all available commands
- [ ] `/status` - System health and stats
- [ ] `/create <agent_name>` - Create new agent via Telegram
- [ ] `/list` - List user's agents
- [ ] `/knowledge <query>` - Search knowledge base
- [ ] `/agent <name> <task>` - Execute agent task
- [ ] `/stats` - User statistics

**File:** `backend/src/telegram/handlers.ts`

**Handler Tasks:**
- [ ] Authenticate Telegram user with Supabase
- [ ] Link Telegram ID to Supabase user
- [ ] Process text messages for AI interaction
- [ ] Handle inline queries
- [ ] Handle callback buttons

**Checkpoint 8:** ✅ Bot responds to `/start` and `/help`
**Checkpoint 9:** ✅ Bot can create agents via Telegram
**Checkpoint 10:** ✅ Bot can query knowledge base

---

#### 10.5 Supabase Service Integration (Server-side)

**File:** `backend/src/services/supabase.ts`

**Implementation Tasks:**
- [ ] Initialize Supabase client with SERVICE_ROLE key
- [ ] Create helper functions for admin operations
- [ ] Implement user management functions
- [ ] Add database query helpers
- [ ] Add storage management functions

**Security Considerations:**
- [ ] Never expose service role key to frontend
- [ ] Validate all inputs server-side
- [ ] Implement rate limiting per user
- [ ] Add request logging for audit trail

**Checkpoint 11:** ✅ Server can perform admin operations
**Checkpoint 12:** ✅ RLS policies still enforced correctly

---

### Task 4: Automation & Workflow Engine 🤖 **HIGH PRIORITY**

#### 4.1 Create Workflow Engine Package

**Directory Setup:**
```bash
mkdir -p packages/automation/src
cd packages/automation
```

**Files to Create:**
- [ ] `packages/automation/package.json`
- [ ] `packages/automation/tsconfig.json`
- [ ] `packages/automation/src/index.ts`
- [ ] `packages/automation/src/workflow-engine.ts`
- [ ] `packages/automation/src/task-scheduler.ts`
- [ ] `packages/automation/src/triggers.ts`
- [ ] `packages/automation/src/actions.ts`
- [ ] `packages/automation/src/types.ts`

**Checkpoint 13:** ✅ Package structure created

---

#### 4.2 Implement Workflow Engine Core

**File:** `packages/automation/src/workflow-engine.ts`

**Type Definitions:**
```typescript
interface Workflow {
  id: string;
  name: string;
  triggers: Trigger[];
  actions: Action[];
  conditions?: Condition[];
  enabled: boolean;
}

interface Trigger {
  type: 'schedule' | 'event' | 'webhook' | 'manual';
  config: any;
}

interface Action {
  type: string;
  config: any;
  retry?: number;
}
```

**Implementation Tasks:**
- [ ] Create `WorkflowEngine` class
- [ ] Implement `execute(workflow: Workflow)` method
- [ ] Add workflow validation
- [ ] Implement conditional logic (if/else)
- [ ] Add loop support (for/while)
- [ ] Add error handling and retry logic
- [ ] Add workflow state persistence
- [ ] Add execution history tracking

**Checkpoint 14:** ✅ Basic workflow executes successfully
**Checkpoint 15:** ✅ Conditional workflows work

---

#### 4.3 Implement Task Scheduler

**File:** `packages/automation/src/task-scheduler.ts`

**Implementation Tasks:**
- [ ] Create cron-like scheduling system
- [ ] Support one-time tasks
- [ ] Support recurring tasks (daily, weekly, monthly)
- [ ] Implement task queue with priority
- [ ] Add task persistence to database
- [ ] Implement task cancellation
- [ ] Add task status tracking

**Features:**
- [ ] Schedule knowledge base backups
- [ ] Schedule agent maintenance tasks
- [ ] Schedule report generation
- [ ] Schedule notifications

**Checkpoint 16:** ✅ Scheduled tasks execute on time
**Checkpoint 17:** ✅ Task queue processes correctly

---

#### 4.4 Implement Triggers System

**File:** `packages/automation/src/triggers.ts`

**Trigger Types:**
- [ ] `ScheduleTrigger` - Time-based triggers
- [ ] `EventTrigger` - React to Supabase events
- [ ] `WebhookTrigger` - External webhook calls
- [ ] `ManualTrigger` - User-initiated
- [ ] `DataTrigger` - Data threshold triggers

**Integration:**
- [ ] Connect to Supabase real-time for event triggers
- [ ] Add webhook endpoint in backend
- [ ] Add trigger testing UI

**Checkpoint 18:** ✅ All trigger types functional

---

#### 4.5 Implement Actions System

**File:** `packages/automation/src/actions.ts`

**Action Types:**
- [ ] `CreateKnowledgeAction` - Add to knowledge base
- [ ] `ExecuteAgentAction` - Run agent task
- [ ] `SendNotificationAction` - User notifications
- [ ] `SendEmailAction` - Email via service
- [ ] `WebhookAction` - Call external API
- [ ] `DatabaseAction` - Custom DB operations

**Checkpoint 19:** ✅ All action types working
**Checkpoint 20:** ✅ Actions can be chained

---

#### 4.6 Integrate Workflow Studio UI

**File:** `components/apps/WorkflowStudioApp.tsx`

**UI Components to Build:**
- [ ] Workflow list view
- [ ] Visual workflow editor (drag-and-drop)
- [ ] Trigger configuration panel
- [ ] Action configuration panel
- [ ] Condition builder
- [ ] Workflow testing panel
- [ ] Execution history viewer

**Implementation:**
- [ ] Use React Flow or similar for visual editor
- [ ] Connect to automation package
- [ ] Save/load workflows from Supabase
- [ ] Real-time workflow execution updates

**Checkpoint 21:** ✅ Can create workflow visually
**Checkpoint 22:** ✅ Workflow executes from UI

---

### Task 9: PWA Support 📱 **MEDIUM PRIORITY**

#### 9.1 Install PWA Dependencies

```bash
npm install -D vite-plugin-pwa workbox-window
```

**Checkpoint 23:** ✅ Dependencies installed

---

#### 9.2 Configure Vite PWA

**File:** `vite.config.ts`

**Tasks:**
- [ ] Import and configure VitePWA plugin
- [ ] Set `registerType: 'autoUpdate'`
- [ ] Configure manifest with app details
- [ ] Add icon configurations (192x192, 512x512)
- [ ] Set theme colors
- [ ] Configure service worker strategies

**Checkpoint 24:** ✅ PWA config added to vite

---

#### 9.3 Create PWA Manifest

**File:** `public/manifest.json`

**Required Fields:**
- [ ] name: "Amrikyy AI OS"
- [ ] short_name: "Amrikyy"
- [ ] description
- [ ] theme_color: "#0A0A0F"
- [ ] background_color: "#0A0A0F"
- [ ] display: "standalone"
- [ ] start_url: "/"
- [ ] icons array with multiple sizes

**Checkpoint 25:** ✅ Manifest file created

---

#### 9.4 Update HTML for PWA

**File:** `index.html`

**Updates:**
- [ ] Add manifest link tag
- [ ] Add theme-color meta tag
- [ ] Add apple-touch-icon links
- [ ] Add apple-mobile-web-app-capable meta
- [ ] Ensure viewport meta is correct

**Checkpoint 26:** ✅ HTML updated for PWA

---

#### 9.5 Create App Icons

**Tasks:**
- [ ] Create 192x192 icon (public/icon-192.png)
- [ ] Create 512x512 icon (public/icon-512.png)
- [ ] Create 180x180 Apple touch icon
- [ ] Create favicon.ico

**Checkpoint 27:** ✅ All icons created

---

#### 9.6 Test PWA Functionality

**Testing:**
- [ ] Test install prompt appears
- [ ] Test app installs successfully
- [ ] Test offline functionality
- [ ] Test service worker caching
- [ ] Test update notifications
- [ ] Validate with Lighthouse PWA audit

**Checkpoint 28:** ✅ PWA scores 90+ on Lighthouse
**Checkpoint 29:** ✅ Works offline

---

## 🧪 Testing & Validation

### Backend Testing

**File:** `backend/src/__tests__/`

**Test Files to Create:**
- [ ] `server.test.ts` - API endpoint tests
- [ ] `websocket.test.ts` - WebSocket tests
- [ ] `telegram.test.ts` - Telegram bot tests
- [ ] `auth.test.ts` - Authentication tests

**Coverage Goal:** 80%+

---

### Workflow Testing

**File:** `packages/automation/__tests__/`

**Test Files:**
- [ ] `workflow-engine.test.ts`
- [ ] `task-scheduler.test.ts`
- [ ] `triggers.test.ts`
- [ ] `actions.test.ts`

---

### Integration Testing

**File:** `backend_integration.test.ts`

**Tests:**
- [ ] Backend API + Frontend integration
- [ ] WebSocket + Supabase real-time
- [ ] Telegram bot + Database operations
- [ ] Workflow execution end-to-end

---

## 📊 Pre-Deployment Validation

### Security Checks

- [ ] Run CodeQL scan on backend code
- [ ] Check for hardcoded secrets
- [ ] Validate environment variable usage
- [ ] Review authentication flows
- [ ] Test rate limiting
- [ ] Validate input sanitization

**Target:** 0 security vulnerabilities

---

### Performance Checks

- [ ] Backend load testing (100+ concurrent requests)
- [ ] WebSocket connection limit testing
- [ ] Memory leak checks
- [ ] Database query optimization
- [ ] API response time < 200ms

---

### CI/CD Setup

**File:** `.github/workflows/backend-ci.yml`

**Pipeline Stages:**
- [ ] Install dependencies
- [ ] Run TypeScript compilation
- [ ] Run linting
- [ ] Run tests
- [ ] Run security scan
- [ ] Build Docker image
- [ ] Deploy to staging

---

## 📈 Success Metrics

**Backend Services:**
- ✅ All API endpoints respond < 200ms
- ✅ WebSocket handles 100+ concurrent connections
- ✅ Telegram bot responds < 1 second
- ✅ Zero downtime during testing

**Workflow Engine:**
- ✅ Executes 1000+ workflows/day
- ✅ 99.9% execution success rate
- ✅ Average execution time < 5 seconds

**PWA:**
- ✅ Lighthouse PWA score 90+
- ✅ Works offline for core features
- ✅ Install success rate > 80%

---

## 🚀 Execution Timeline

### Day 1: Backend Foundation
- Morning: Backend structure + Express setup
- Afternoon: API routes + health checks
- Evening: Basic tests + documentation

**Deliverable:** Working Express server with `/health` endpoint

---

### Day 2: Real-time & Bot
- Morning: WebSocket server implementation
- Afternoon: Telegram bot setup
- Evening: Integration testing

**Deliverable:** WebSocket echo test + Telegram bot responding

---

### Day 3: Workflow Engine
- Morning: Workflow engine core
- Afternoon: Triggers and actions
- Evening: Basic workflow execution

**Deliverable:** Simple workflow executes successfully

---

### Day 4: UI Integration
- Morning: WorkflowStudioApp UI
- Afternoon: Connect UI to engine
- Evening: Visual workflow creation

**Deliverable:** Create workflow from UI

---

### Day 5: PWA & Polish
- Morning: PWA configuration
- Afternoon: Testing and optimization
- Evening: Documentation update

**Deliverable:** PWA installable + documentation

---

## 📝 Documentation Updates

**Files to Update:**
- [ ] `docs/BACKEND_API.md` - API documentation
- [ ] `docs/WEBSOCKET_PROTOCOL.md` - WebSocket docs
- [ ] `docs/TELEGRAM_BOT.md` - Bot usage guide
- [ ] `docs/WORKFLOW_ENGINE.md` - Workflow system docs
- [ ] `docs/PWA_SETUP.md` - PWA installation guide
- [ ] `PROJECT_STATUS_REPORT.md` - Update to 60% progress
- [ ] `README.md` - Add backend setup instructions

---

## 🎯 Definition of Done

Each task is complete when:
- [ ] All checkpoints validated ✅
- [ ] Tests written and passing
- [ ] Code reviewed (self-review checklist)
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Committed and pushed to branch

---

## 🆘 Troubleshooting Guide

### Common Issues

**Backend won't start:**
- Check port 4000 is not in use
- Verify all environment variables set
- Check TypeScript compilation errors

**WebSocket connection fails:**
- Verify CORS configuration
- Check firewall rules
- Test with simple WebSocket client first

**Telegram bot not responding:**
- Verify bot token is correct
- Check webhook/polling configuration
- Test with Telegram BotFather

**Workflow not executing:**
- Check workflow validation
- Verify triggers are configured
- Check action permissions

---

## 🔗 Useful Resources

- Express.js Documentation: https://expressjs.com/
- WebSocket (ws) Documentation: https://github.com/websockets/ws
- Telegraf Documentation: https://telegraf.js.org/
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/
- Supabase Server-Side Auth: https://supabase.com/docs/guides/auth/server-side

---

## 📞 Support

If stuck on any task:
1. Check the troubleshooting guide above
2. Review existing documentation in `docs/`
3. Check the original TODO_FOR_JULES.md
4. Review commit history for context
5. Ask for clarification in PR comments

---

**Status:** Ready for Implementation  
**Priority:** HIGH  
**Estimated Completion:** 5 days  
**Next Review:** After Day 3 (Workflow Engine completion)

🔥 **Let's build the backend infrastructure!** 🚀
