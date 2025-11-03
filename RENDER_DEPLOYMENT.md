# Render Deployment Guide for Amrikyy AI OS Backend

This guide provides step-by-step instructions for deploying the Amrikyy AI OS backend API server to Render.

## Prerequisites

- A [Render account](https://render.com/register) (free tier available)
- Your GitHub repository with the Amrikyy-AIOS code (including the backend folder)
- Supabase project set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Google Gemini API key
- Frontend deployed on Vercel (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md))

## What is the Backend For?

The backend server:
- **Secures API keys**: Keeps your Gemini API key server-side (not exposed in frontend)
- **Authenticates requests**: Validates user tokens from Supabase
- **Proxies AI requests**: Forwards authenticated requests to Google Gemini API
- **Manages user data**: Handles user profile and app data storage

## Quick Deploy

### Option 1: Deploy via Render Dashboard (Recommended)

#### Step 1: Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Select `Moeabdelaziz007/Amrikyy-AIOS`
   - Click **"Connect"**

#### Step 2: Configure Service

Fill in the following details:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `amrikyy-aios-backend` | Or your preferred name |
| **Region** | Choose closest to your users | e.g., Oregon (US West) |
| **Branch** | `main` | Or your production branch |
| **Root Directory** | `backend` | **Important: Must specify!** |
| **Runtime** | `Node` | Should auto-detect |
| **Build Command** | `npm install` | Auto-detected |
| **Start Command** | `npm start` | Auto-detected from package.json |
| **Instance Type** | `Free` or `Starter` | Free tier available |

#### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `10000` | Render uses port 10000 by default |
| `NODE_ENV` | `production` | Set environment |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (for CORS) |
| `SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | **Secret!** From Supabase → Settings → API |
| `GEMINI_API_KEY` | Your Gemini API key | From Google AI Studio |

**Important Security Notes:**
- Use the **service_role** key (not anon key) for backend
- Never expose the service_role key in frontend code
- Keep GEMINI_API_KEY server-side only

#### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your app
   - Deploy it
3. Wait for deployment to complete (2-5 minutes)
4. Your API will be live at: `https://amrikyy-aios-backend.onrender.com`

### Option 2: Deploy via render.yaml (Infrastructure as Code)

Create a `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: amrikyy-aios-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: FRONTEND_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```

Then:
1. Push `render.yaml` to your repository
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will auto-detect `render.yaml`
5. Add the secret environment variables via dashboard
6. Click **"Apply"**

## Update Frontend to Use Backend

After deploying the backend, update your frontend to use it:

### 1. Add Backend URL to Vercel

In Vercel, add environment variable:
```
VITE_API_URL=https://amrikyy-aios-backend.onrender.com
```

### 2. Update Frontend API Calls

Example API utility in frontend:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateWithGemini(prompt: string, token: string) {
  const response = await fetch(`${API_URL}/api/gemini/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
}
```

### 3. Pass User Token

```typescript
// In your component
import { useAuth } from './contexts/AuthContext';
import { generateWithGemini } from './lib/api';

function MyComponent() {
  const { session } = useAuth();

  const handleGenerate = async () => {
    if (!session) return;
    
    const result = await generateWithGemini(
      'Your prompt here',
      session.access_token
    );
    console.log(result.text);
  };

  // ...
}
```

## Automatic Deployments

Render automatically deploys when you push to your connected branch:

1. Make changes to `backend/` folder
2. Commit and push to GitHub
3. Render automatically detects changes and redeploys

### Configure Auto-Deploy:

- Go to your service dashboard
- Navigate to **Settings** → **Build & Deploy**
- Verify **Auto-Deploy** is enabled for your branch

## Custom Domain Setup

### Add a Custom Domain:

1. Go to your service dashboard on Render
2. Navigate to **Settings** → **Custom Domain**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `api.amrikyy.com`)

### Configure DNS:

Add a CNAME record to your domain registrar:

```
Type: CNAME
Name: api (or your subdomain)
Value: [your-service].onrender.com
```

### SSL Certificate:

- Render automatically provisions SSL certificates
- Your API will be accessible via HTTPS
- Certificate auto-renews

## Environment Variables Management

### View Variables:

1. Go to service dashboard
2. Navigate to **Environment** tab
3. View all configured variables (values are hidden for security)

### Update Variables:

1. Go to **Environment** tab
2. Click **"Edit"** on a variable
3. Update the value
4. Click **"Save Changes"**
5. Service will automatically redeploy

### Add New Variables:

1. Go to **Environment** tab
2. Click **"Add Environment Variable"**
3. Enter key and value
4. Click **"Save Changes"**

## Monitoring & Logs

### View Logs:

1. Go to service dashboard
2. Click **"Logs"** tab
3. See real-time logs

### Filter Logs:

- Use the search box to filter logs
- Select time range
- Download logs for offline analysis

### Set up Alerts:

1. Go to **Settings** → **Alerts**
2. Configure alerts for:
   - Deploy failures
   - Service downtime
   - High resource usage

## Scaling

### Free Tier Limitations:

- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month free

### Upgrade to Paid Plan:

1. Go to **Settings** → **Instance Type**
2. Select a paid plan:
   - **Starter**: Always on, no cold starts ($7/month)
   - **Standard**: More resources ($25/month)
   - **Pro**: High performance ($85/month)
3. Click **"Change Instance Type"**

### Horizontal Scaling:

For high traffic:
1. Upgrade to Pro or higher
2. Go to **Settings** → **Scaling**
3. Enable auto-scaling or set instance count

## Troubleshooting

### Build Fails:

**Check**:
- `package.json` is in `backend/` directory
- `rootDir` is set to `backend` in Render settings
- Node version is compatible (18+)

**Solution**:
```bash
# Test build locally
cd backend
npm install
npm start
```

### Service Crashes on Start:

**Check logs** for errors:
- Missing environment variables
- Port binding issues (should use `process.env.PORT`)
- Database connection failures

**Solution**: Verify all required env vars are set

### CORS Errors:

**Symptom**: Frontend can't connect to backend

**Solution**:
1. Verify `FRONTEND_URL` is set correctly in Render
2. Update CORS configuration in `backend/src/index.js`:
   ```javascript
   app.use(cors({
     origin: [
       process.env.FRONTEND_URL,
       'http://localhost:5173' // for local dev
     ],
     credentials: true
   }));
   ```

### Authentication Fails:

**Check**:
- `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Token is being sent from frontend
- Token format is `Bearer <token>`

**Test authentication**:
```bash
# Get user token from frontend console
# Then test with curl
curl -X POST https://your-backend.onrender.com/api/gemini/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"Hello"}'
```

### Slow Performance:

**Free tier spins down**: Upgrade to Starter or higher for always-on service

**Optimize**:
- Add caching for frequent requests
- Use connection pooling for database
- Enable compression middleware

## Database Setup (Optional)

If you need a database for your backend:

### Add PostgreSQL:

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database
3. Get connection string from database dashboard
4. Add to your backend env vars:
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   ```

### Use Supabase Database:

Supabase already provides PostgreSQL - use it!
- Connection string in Supabase → Settings → Database
- Use Supabase client library (already installed)

## Health Checks

Render automatically monitors your service:

### Default Health Check:

- Endpoint: `/` or `/health`
- Render pings every few minutes
- Service restarts if unhealthy

### Custom Health Check:

The backend includes `/health` endpoint:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

Configure in Render:
1. Go to **Settings** → **Health Check**
2. Set **Health Check Path**: `/health`

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Only allow your frontend domain
3. **Authentication**: Always verify JWT tokens
4. **Rate Limiting**: Add rate limiting for production
5. **HTTPS Only**: Render provides this automatically
6. **Input Validation**: Validate all request data
7. **Service Role Key**: Never expose in frontend

## Cost Optimization

### Free Tier Tips:

- Use free tier for development/testing
- Combine multiple services in one repo
- Use Render's free PostgreSQL for small databases

### Reduce Costs:

1. **Shut down unused services**
2. **Use appropriate instance size**
3. **Enable auto-scaling** only when needed
4. **Monitor usage** in billing dashboard

## CLI Commands (Optional)

Install Render CLI:
```bash
npm install -g @render/cli
```

Useful commands:
```bash
# Login
render login

# List services
render services list

# View logs
render logs [service-id]

# Deploy manually
render deploy [service-id]
```

## Integration with Frontend (Summary)

1. **Deploy backend to Render** (this guide)
2. **Get backend URL**: `https://amrikyy-aios-backend.onrender.com`
3. **Add to Vercel** environment variables: `VITE_API_URL`
4. **Update frontend** to make API calls to backend
5. **Test authentication** flow end-to-end

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

## Support

For issues:
1. Check [Render Status](https://status.render.com/)
2. Review service logs in dashboard
3. Visit [Render Community](https://community.render.com/)
4. Open an issue in this repository
