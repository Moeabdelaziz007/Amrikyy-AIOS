# Quick Start Guide - Supabase Auth + Vercel + Render Deployment

This quick start guide helps you set up authentication with Supabase and deploy your application to Vercel (frontend) and Render (backend).

## 📋 Overview

- **Frontend**: React + Vite app deployed on **Vercel**
- **Backend**: Node.js/Express API deployed on **Render**
- **Authentication**: **Supabase** (email/password + OAuth)
- **AI**: Google Gemini API

## 🔑 Required Keys

You'll need the following keys:

### 1. **Supabase Keys** (Get from [supabase.com](https://supabase.com))
   - `VITE_SUPABASE_URL` - Your project URL
   - `VITE_SUPABASE_ANON_KEY` - Public/anonymous key (frontend safe)
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only, secret!)

### 2. **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))
   - `VITE_API_KEY` - For direct frontend calls (optional)
   - `GEMINI_API_KEY` - For backend API calls (recommended)

### 3. **Deployment URLs**
   - `VITE_API_URL` - Your Render backend URL (after deploying)
   - `FRONTEND_URL` - Your Vercel frontend URL (for CORS)

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in details:
   - Name: `amrikyy-aios`
   - Database Password: (create a strong password)
   - Region: (closest to your users)
4. Wait for project to be created (~2 minutes)
5. Go to **Settings** → **API** and copy:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY`

**📚 Detailed guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `Amrikyy-AIOS` repository
4. Add environment variables:
   - `VITE_API_KEY`: Your Google Gemini API key
   - `VITE_SUPABASE_URL`: From Step 1
   - `VITE_SUPABASE_ANON_KEY`: From Step 1
5. Click **"Deploy"**
6. Wait for deployment (~3 minutes)
7. Copy your Vercel URL: `https://your-app.vercel.app`

**📚 Detailed guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_URL`: Your Vercel URL from Step 2
   - `SUPABASE_URL`: From Step 1
   - `SUPABASE_SERVICE_ROLE_KEY`: From Step 1 (secret!)
   - `GEMINI_API_KEY`: Your Google Gemini API key
6. Click **"Create Web Service"**
7. Wait for deployment (~5 minutes)
8. Copy your Render URL: `https://your-backend.onrender.com`

**📚 Detailed guide**: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

### Step 4: Connect Frontend to Backend

1. Go back to Vercel dashboard
2. Navigate to your project → **Settings** → **Environment Variables**
3. Add new variable:
   - `VITE_API_URL`: Your Render URL from Step 3
4. **Redeploy** your Vercel app to apply changes

### Step 5: Enable OAuth Providers (Optional)

To enable Google/GitHub sign-in:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. For **Google**:
   - Enable the provider
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. For **GitHub**:
   - Enable the provider
   - Create OAuth app in [GitHub Settings](https://github.com/settings/developers)
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`

**📚 Detailed guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#enable-oauth-providers-optional)

## ✅ Verify Setup

### Test Authentication:

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the login form
3. Try signing up with email/password
4. Check your email for confirmation link
5. Sign in with confirmed account

### Test Backend Connection:

1. Open browser DevTools (F12)
2. Try an action that calls the backend
3. Check Network tab for API calls to your Render backend
4. Verify requests include `Authorization: Bearer <token>` header

### Test AI Features:

1. Once logged in, try using AI features
2. Prompts should be processed via your backend
3. Check Render logs to see API requests

## 📁 Project Structure

```
Amrikyy-AIOS/
├── backend/                    # Backend API (deployed to Render)
│   ├── src/
│   │   └── index.js           # Express server with auth & API
│   ├── package.json
│   └── .env.example
├── src/                        # Frontend (deployed to Vercel)
│   ├── lib/
│   │   └── supabaseClient.ts  # Supabase initialization
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   └── components/
│       └── Auth/
│           └── LoginForm.tsx  # Login/signup form
├── .env.example               # Frontend environment variables template
├── vercel.json                # Vercel configuration
├── SUPABASE_SETUP.md          # Detailed Supabase guide
├── VERCEL_DEPLOYMENT.md       # Detailed Vercel guide
├── RENDER_DEPLOYMENT.md       # Detailed Render guide
└── QUICK_START.md             # This file
```

## 🔐 Security Checklist

- [ ] Never commit `.env` or `.env.local` files
- [ ] Use `VITE_` prefix only for frontend-safe variables
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (backend only)
- [ ] Keep `GEMINI_API_KEY` secret (backend only)
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Configure CORS to only allow your frontend domain
- [ ] Use HTTPS for all deployments (automatic on Vercel/Render)
- [ ] Rotate API keys regularly

## 🆘 Troubleshooting

### "Supabase URL or Anon Key is missing"
- Check environment variables are set in Vercel
- Verify variables have `VITE_` prefix
- Redeploy after adding variables

### "CORS error" or "Failed to fetch"
- Verify `FRONTEND_URL` is set correctly in Render
- Check backend CORS configuration allows your Vercel domain
- Ensure `VITE_API_URL` is set in Vercel

### Authentication not working
- Check Supabase keys are correct
- Verify email confirmation (check spam folder)
- Check browser console for errors
- Verify `AuthProvider` wraps your app

### Backend not responding
- Free tier on Render spins down after inactivity (30-60s cold start)
- Check Render logs for errors
- Verify all environment variables are set
- Test health endpoint: `https://your-backend.onrender.com/health`

## 💰 Cost Breakdown

### Free Tier (Development/Testing):
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **Render**: Free (750 hours/month, spins down after 15min inactivity)
- **Supabase**: Free (500MB database, 50MB file storage, 2GB bandwidth)
- **Google Gemini**: Free tier available (rate limits apply)

**Total**: $0/month for small projects

### Production (Low Traffic):
- **Vercel**: $20/month (Pro plan)
- **Render**: $7/month (Starter - always on, no cold starts)
- **Supabase**: $25/month (Pro - 8GB database, 100GB storage)
- **Google Gemini**: Pay per use (~$0.01-0.10 per 1000 requests)

**Total**: ~$52-55/month

## 📚 Additional Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase configuration guide
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel deployment and management
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Render backend deployment
- **[README.md](./README.md)** - Main project documentation
- **[deployment-guide.md](./deployment-guide.md)** - Google Cloud Run deployment (alternative)

## 🎉 Next Steps

After setup is complete:

1. **Customize authentication UI** - Update `LoginForm.tsx`
2. **Set up user profiles** - Create tables in Supabase
3. **Add authorization** - Implement role-based access control
4. **Enable RLS** - Secure your database tables
5. **Custom domain** - Add your domain to Vercel and Render
6. **Monitoring** - Set up alerts and logging
7. **Backups** - Enable database backups in Supabase

## 🤝 Need Help?

- **Supabase Issues**: [Supabase Discord](https://discord.supabase.com)
- **Vercel Issues**: [Vercel Support](https://vercel.com/support)
- **Render Issues**: [Render Community](https://community.render.com)
- **Project Issues**: Open an issue in this repository

---

**Happy deploying! 🚀**
