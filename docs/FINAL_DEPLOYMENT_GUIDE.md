# 🚀 Complete Deployment Guide - Amrikyy AIOS

## Project Status: 85% Complete ✅

### Overview
This guide covers deployment of the complete full-stack Amrikyy AIOS application with:
- **Frontend**: React + Vite + PWA (Vercel)
- **Backend**: Express + TypeScript (Render)
- **Cache**: Redis (Upstash/Redis Cloud)
- **Vector DB**: Qdrant (Qdrant Cloud)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

---

## 📋 Pre-Deployment Checklist

### ✅ Completed Features (85%)
- [x] Frontend Supabase integration (ChronoVault, AgentForge, Files apps)
- [x] Backend TypeScript infrastructure (Express, WebSocket, Telegram)
- [x] Automation & Workflow Engine foundation
- [x] Google Search API integration (code ready)
- [x] Enhanced Gemini AI service (code ready)
- [x] Gmail & Google Calendar integration (code ready)
- [x] PWA configuration
- [x] Database migrations prepared
- [x] Authentication layer (Supabase Auth)
- [x] Real-time subscriptions
- [x] API routes (auth, knowledge, agents, AI, search, workflows, gmail, calendar)

### 🔨 Final Tasks (15%)
- [ ] Merge Jules PR #22 (backend implementation)
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Set up Redis cache
- [ ] Set up Qdrant vector database
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domains
- [ ] Final integration testing

---

## 🗄️ Database Setup (Supabase)

### 1. Run SQL Migrations

Navigate to Supabase Dashboard → SQL Editor and run:

```sql
-- Migration 1: User Integrations (OAuth tokens)
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- RLS Policies
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations"
  ON user_integrations
  FOR ALL
  USING (auth.uid() = user_id);

-- Migration 2: Telegram Link Codes
CREATE TABLE telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  link_code VARCHAR(10) UNIQUE NOT NULL,
  telegram_id BIGINT UNIQUE,
  linked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 minutes'
);

ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own link codes"
  ON telegram_link_codes
  FOR ALL
  USING (auth.uid() = user_id);

-- Migration 3: Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflows"
  ON workflows
  FOR ALL
  USING (auth.uid() = user_id);

-- Migration 4: Workflow Executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own executions"
  ON workflow_executions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Migration 5: Scheduled Tasks
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cron_expression VARCHAR(100) NOT NULL,
  next_run TIMESTAMPTZ NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled tasks"
  ON scheduled_tasks
  FOR ALL
  USING (auth.uid() = user_id);
```

### 2. Verify Existing Tables
Ensure these tables exist (from earlier migrations):
- `knowledge_base`
- `agents`
- `file_metadata`

### 3. Configure Storage Bucket
- Bucket name: `user-files`
- Public: No
- File size limit: 50MB
- Allowed MIME types: All

---

## 🔴 Redis Setup (Upstash)

### 1. Create Redis Database

**Option A: Upstash (Recommended)**
1. Go to [upstash.com](https://upstash.com)
2. Create account / Sign in
3. Click "Create Database"
4. Select region closest to your Render deployment
5. Copy connection details

**Option B: Redis Cloud**
1. Go to [redis.com/try-free](https://redis.com/try-free)
2. Create free database
3. Copy connection URL

### 2. Get Redis Credentials

From Upstash dashboard, copy:
```
REDIS_URL=rediss://:your-password@your-endpoint.upstash.io:6379
```

### 3. Use Cases in Application
- **Session storage**: User sessions, temporary data
- **Cache**: API responses, search results
- **Rate limiting**: API rate limits
- **Queue**: Background job queue for workflows

---

## 🔍 Qdrant Setup (Vector Database)

### 1. Create Qdrant Cloud Cluster

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io)
2. Sign up / Sign in
3. Click "Create Cluster"
4. Select **Free Tier** (1GB, perfect for starting)
5. Choose region closest to Render deployment
6. Wait for cluster to be ready (~2 minutes)

### 2. Get Qdrant Credentials

From Qdrant dashboard:
```
QDRANT_URL=https://your-cluster-id.aws.cloud.qdrant.io
QDRANT_API_KEY=your-api-key-here
```

### 3. Initialize Collections

The backend will auto-create collections, but you can pre-create:

```typescript
// backend/src/services/qdrantService.ts (create this file)
import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

// Create collections for knowledge base embeddings
await client.createCollection('knowledge_embeddings', {
  vectors: {
    size: 768, // Gemini embedding size
    distance: 'Cosine',
  },
});

// Create collection for agent memory
await client.createCollection('agent_memory', {
  vectors: {
    size: 768,
    distance: 'Cosine',
  },
});
```

### 4. Use Cases in Application
- **Knowledge search**: Semantic search in ChronoVault
- **Agent memory**: Long-term memory for AI agents
- **Document similarity**: Find similar documents
- **Recommendation**: Recommend related content

---

## 🖥️ Backend Deployment (Render)

### 1. Prepare Repository

Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Create Web Service on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `amrikyy-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` or closest
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter $7/month for better performance)

### 3. Environment Variables

Add all these in Render dashboard:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Google Services
GOOGLE_SEARCH_API_KEY=your-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-secret
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-secret

# Telegram
TELEGRAM_BOT_TOKEN=8311767002:AAEIUzmsseDtCk6SjFYK41Zi09rcb0ELHsI

# Redis (Upstash)
REDIS_URL=rediss://:password@endpoint.upstash.io:6379

# Qdrant
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# App Config
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Deploy

Click "Create Web Service" - Render will:
1. Clone repository
2. Install dependencies
3. Run build
4. Start server
5. Provide URL: `https://amrikyy-backend.onrender.com`

### 5. Configure Health Checks

Render Auto-configuration:
- **Health Check Path**: `/health`
- **Health Check Interval**: 60 seconds

---

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare for Deployment

Ensure `package.json` has:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Environment Variables

Add in Vercel dashboard (Settings → Environment Variables):

```bash
# Supabase (Client-side safe)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API
VITE_API_URL=https://amrikyy-backend.onrender.com
VITE_WS_URL=wss://amrikyy-backend.onrender.com

# App Config
VITE_APP_NAME=Amrikyy AIOS
VITE_APP_VERSION=1.0.0
```

### 4. Deploy

Click "Deploy" - Vercel will:
1. Build the application
2. Deploy to CDN
3. Provide URL: `https://your-app.vercel.app`

### 5. Configure Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

---

## 🔗 Post-Deployment Configuration

### 1. Update CORS Settings (Backend)

Ensure `backend/src/server.ts` has:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  credentials: true,
}));
```

### 2. Update Supabase Auth Redirect URLs

Supabase Dashboard → Authentication → URL Configuration:

Add:
- `https://your-app.vercel.app/**`
- `https://your-custom-domain.com/**` (if using custom domain)

### 3. Configure Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot8311767002:AAEIUzmsseDtCk6SjFYK41Zi09rcb0ELHsI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://amrikyy-backend.onrender.com/api/telegram/webhook"}'
```

### 4. Test All Integrations

**Backend Health**:
```bash
curl https://amrikyy-backend.onrender.com/health
```

**AI Endpoint**:
```bash
curl -X POST https://amrikyy-backend.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, AI!"}'
```

**Search Endpoint**:
```bash
curl "https://amrikyy-backend.onrender.com/api/search?q=test"
```

**Frontend**:
- Visit `https://your-app.vercel.app`
- Test login/signup
- Test ChronoVault app
- Test AgentForge app
- Test Files app

---

## 📊 Monitoring & Maintenance

### Backend Monitoring (Render)

1. **Logs**: Render Dashboard → Logs
2. **Metrics**: CPU, Memory, Response Time
3. **Alerts**: Configure email alerts for downtime

### Frontend Monitoring (Vercel)

1. **Analytics**: Vercel Analytics (built-in)
2. **Performance**: Web Vitals tracking
3. **Errors**: Error tracking in dashboard

### Database Monitoring (Supabase)

1. **Logs**: Supabase Dashboard → Database → Logs
2. **Performance**: Query performance insights
3. **Storage**: Monitor storage usage

### Redis Monitoring (Upstash)

1. **Dashboard**: View connections, operations/sec
2. **Metrics**: Memory usage, hit rate
3. **Alerts**: Email alerts for issues

### Qdrant Monitoring

1. **Dashboard**: Cluster health, collection stats
2. **Performance**: Query latency, throughput
3. **Storage**: Vector count, disk usage

---

## 🚨 Troubleshooting

### Backend Not Starting
- Check Render logs
- Verify all environment variables set
- Check build command completed successfully
- Verify PORT is not hardcoded (use `process.env.PORT`)

### Frontend Blank Page
- Check browser console for errors
- Verify VITE_API_URL points to correct backend
- Check Supabase credentials
- Clear browser cache

### Database Connection Failed
- Verify Supabase credentials
- Check if migrations ran successfully
- Ensure RLS policies don't block queries
- Check connection pooling settings

### Redis Connection Failed
- Verify REDIS_URL format
- Check Upstash dashboard for status
- Ensure Redis client installed: `npm install ioredis`
- Test connection locally first

### Qdrant Connection Failed
- Verify QDRANT_URL and API_KEY
- Check cluster status in dashboard
- Ensure collections exist
- Test with simple query first

---

## 📈 Scaling Considerations

### When to Upgrade

**Backend (Render)**:
- Free tier: Good for development/testing
- Starter ($7/month): Production with moderate traffic
- Standard ($25/month): High traffic, background workers

**Frontend (Vercel)**:
- Hobby (Free): Personal projects, low traffic
- Pro ($20/month): Production apps, custom domains
- Enterprise: High traffic, SLA guarantees

**Redis (Upstash)**:
- Free: 10K commands/day
- Pay-as-you-go: $0.2 per 100K commands
- Pro: Fixed pricing for high volume

**Qdrant (Cloud)**:
- Free: 1GB storage
- Paid: From $25/month for more storage
- Self-hosted: For full control

### Performance Optimization

1. **Enable CDN**: Vercel (automatic), Render (paid plans)
2. **Database Indexing**: Add indexes on frequently queried fields
3. **Redis Caching**: Cache expensive queries, API responses
4. **Rate Limiting**: Prevent API abuse
5. **Image Optimization**: Use Vercel Image Optimization
6. **Code Splitting**: Lazy load React components

---

## ✅ Final Checklist

Before going live:

- [ ] All migrations run successfully
- [ ] All environment variables configured
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Redis connected and caching
- [ ] Qdrant connected and indexing
- [ ] CORS configured correctly
- [ ] Auth redirects working
- [ ] Telegram bot responding
- [ ] All API endpoints tested
- [ ] PWA manifest serving correctly
- [ ] SSL certificates active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Monitoring/alerts set up
- [ ] Documentation updated
- [ ] Team notified

---

## 🎉 Success Metrics

**After deployment, you should see:**

✅ Frontend loading in < 2 seconds  
✅ API responses in < 500ms  
✅ Real-time updates working  
✅ File uploads/downloads working  
✅ Search returning results  
✅ AI chat responding  
✅ Telegram bot active  
✅ PWA installable  
✅ All auth flows working  
✅ 0 console errors  

---

## 📞 Support Resources

- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Upstash**: [upstash.com/docs](https://upstash.com/docs)
- **Qdrant**: [qdrant.tech/documentation](https://qdrant.tech/documentation)
- **Telegram Bot API**: [core.telegram.org/bots/api](https://core.telegram.org/bots/api)

---

## 🚀 Next Steps After Deployment

1. **Monitor for 24 hours**: Watch for errors, performance issues
2. **Load testing**: Use tools like Apache Bench or k6
3. **User testing**: Get real users to test all features
4. **Optimize**: Based on monitoring data
5. **Document**: Update internal documentation
6. **Marketing**: Announce launch!

---

**Deployment Complete! 🎊**

Your Amrikyy AIOS platform is now live and ready for users!
