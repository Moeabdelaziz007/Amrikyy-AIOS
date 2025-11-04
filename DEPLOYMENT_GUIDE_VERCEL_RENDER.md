# Deployment Guide - Vercel & Render
**For Amrikyy AI OS**  
**Developer:** Mohamed Hossameldin Abdelaziz

This guide will walk you through deploying the Amrikyy AI OS to Vercel (frontend) and Render (backend).

---

## 📋 Pre-Deployment Checklist

✅ All completed:
- [x] Code is built successfully (`npm run build` passes)
- [x] Environment variables configured locally
- [x] Supabase integration complete
- [x] Gemini API configured
- [x] Git repository is clean and pushed

---

## 🚀 Part 1: Deploy Frontend to Vercel

### Step 1: Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find and select **"Amrikyy-AIOS"** from your repositories
   - If you don't see it, click **"Adjust GitHub App Permissions"**
3. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:** Vite  
**Root Directory:** `./` (leave as default)

**Build & Development Settings:**
- Build Command: `pnpm install && pnpm --filter @auraos/ai run build && pnpm --filter @auraos/automation run build && pnpm run build`
- Output Directory: `dist`
- Install Command: `pnpm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_KEY` | `AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://yzfnjkwyxjnuzbggnlhc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM` | Production, Preview, Development |

**Important:** Make sure to select all three environments (Production, Preview, Development) for each variable.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for the deployment to complete
3. Once complete, you'll see:
   - ✅ **Deployment successful**
   - Your live URL (e.g., `amrikyy-aios.vercel.app`)

### Step 6: Verify Deployment

1. Click on the live URL
2. Test the application:
   - Check if the desktop loads
   - Try opening an AI agent (like Luna)
   - Test Gemini chat functionality
   - Verify Supabase authentication (if applicable)

### Step 7: Set Up Custom Domain (Optional)

1. In your Vercel project dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your custom domain
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours, usually much faster)

### Step 8: Enable Automatic Deployments

✅ This is already enabled by default!

Every time you push to your `main` branch, Vercel will automatically:
- Build your project
- Run tests (if configured)
- Deploy to production

---

## 🔧 Part 2: Deploy Backend to Render

### Step 1: Sign Up / Log In to Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started"** or **"Sign In"**
3. Choose **"Continue with GitHub"**
4. Authorize Render to access your GitHub account

### Step 2: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Find and select **"Amrikyy-AIOS"** from your repositories
   - If you don't see it, click **"Configure GitHub"** to grant access
3. Click **"Connect"**

### Step 3: Configure Service Settings

**Name:** `amrikyy-aios-backend` (or your preferred name)  
**Region:** Choose the closest region to your users  
**Branch:** `main`  
**Root Directory:** `backend`  
**Environment:** `Node`  
**Build Command:** `pnpm install && pnpm --filter @auraos/ai run build && pnpm --filter @auraos/automation run build && pnpm run build`
**Start Command:** `node dist/server.js`

**Instance Type:** Free (or choose paid for better performance)

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-vercel-url.vercel.app` ⚠️ UPDATE THIS |
| `SUPABASE_URL` | `https://yzfnjkwyxjnuzbggnlhc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE0Njk3MiwiZXhwIjoyMDc3NzIyOTcyfQ.OlSSM6BqhcKlNEQfc1a8R7zgbzrY9Aboj_6SdSRmzbI` |
| `GEMINI_API_KEY` | `AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM` |

**⚠️ IMPORTANT:** Replace `https://your-vercel-url.vercel.app` with your actual Vercel URL from Part 1.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for the deployment to complete
3. Once complete, you'll see:
   - ✅ **Live**
   - Your backend URL (e.g., `amrikyy-aios-backend.onrender.com`)

### Step 6: Update Frontend CORS Settings

**Important:** If your backend needs to communicate with the frontend, you may need to update CORS settings in your backend code to allow requests from your Vercel URL.

### Step 7: Verify Backend Deployment

1. Click on your backend URL
2. You should see a response from your backend (depends on your backend implementation)
3. Check the logs for any errors:
   - Click **"Logs"** tab in Render dashboard
   - Look for any error messages

---

## 🔗 Part 3: Connect Frontend and Backend

### Update Frontend to Use Backend URL (If Needed)

If your frontend needs to communicate with the backend API:

1. Go to your Vercel project
2. Go to **"Settings"** → **"Environment Variables"**
3. Add a new variable:
   - Name: `VITE_BACKEND_URL`
   - Value: `https://your-render-url.onrender.com`
   - Environments: All

4. Redeploy your frontend:
   - Go to **"Deployments"** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

### Update Backend CORS (If Needed)

In your backend code (`backend/src/index.js`), make sure CORS is configured to allow your Vercel URL:

```javascript
// Example CORS configuration (add if not present)
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL, // This should be your Vercel URL
  credentials: true
}));
```

---

## ✅ Part 4: Post-Deployment Testing

### Test Frontend (Vercel)
- [ ] Application loads successfully
- [ ] Desktop environment renders
- [ ] App launcher works
- [ ] AI agents respond (Luna, Atlas, etc.)
- [ ] Gemini chat works
- [ ] Image generation works
- [ ] Supabase authentication works (if implemented)
- [ ] Real-time features work (Nexus Chat, etc.)

### Test Backend (Render)
- [ ] Backend service is running
- [ ] API endpoints respond
- [ ] Supabase connection works
- [ ] Gemini API calls work from backend
- [ ] CORS allows frontend requests
- [ ] Logs show no errors

### Test Integration
- [ ] Frontend can communicate with backend
- [ ] API calls succeed
- [ ] Real-time updates work
- [ ] Authentication persists across refreshes

---

## 🔒 Security Checklist

- [ ] ✅ Environment variables are not in code
- [ ] ✅ `.env.local` is in `.gitignore`
- [ ] ✅ Service role key only in backend
- [ ] ✅ Anon key only in frontend
- [ ] ✅ HTTPS enabled (Vercel and Render handle this)
- [ ] Backend CORS configured correctly
- [ ] API keys have appropriate restrictions (optional)
- [ ] Supabase Row Level Security enabled (optional, but recommended)

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployments
- View analytics
- Check build logs
- Monitor bandwidth usage

### Render Dashboard
- Monitor service health
- View logs in real-time
- Check resource usage
- Set up alerts

### Supabase Dashboard
- Monitor API usage
- Check authentication activity
- View database metrics
- Monitor storage usage

---

## 🐛 Troubleshooting

### Frontend Not Loading
1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Check browser console for errors
4. Verify API keys are valid

### Backend Not Starting
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check if port is correct (should be 3000)
4. Verify build command completed successfully

### API Calls Failing
1. Check CORS configuration in backend
2. Verify `FRONTEND_URL` in backend matches Vercel URL
3. Check browser network tab for errors
4. Verify API endpoints are correct

### Authentication Not Working
1. Verify Supabase credentials are correct
2. Check Supabase dashboard for errors
3. Verify redirect URLs in Supabase settings
4. Check browser console for auth errors

---

## 🎯 Quick Links

| Service | URL | Purpose |
|---------|-----|---------|
| **Vercel Dashboard** | https://vercel.com/dashboard | Manage frontend deployments |
| **Render Dashboard** | https://dashboard.render.com | Manage backend service |
| **Supabase Dashboard** | https://supabase.com/dashboard | Manage database & auth |
| **GitHub Repository** | https://github.com/Moeabdelaziz007/Amrikyy-AIOS | Source code |
| **Gemini API Console** | https://makersuite.google.com/app/apikey | Manage API keys |

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs (Vercel/Render)
3. Check browser console for frontend errors
4. Review backend logs for API errors
5. Consult documentation:
   - [Vercel Documentation](https://vercel.com/docs)
   - [Render Documentation](https://render.com/docs)
   - [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 Success!

Once both deployments are complete and tested, you have successfully deployed Amrikyy AI OS!

**Your Live URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`

Share your deployed application with the world! 🚀

---

**Deployed By:** Mohamed Hossameldin Abdelaziz  
**Project:** Amrikyy AI OS  
**Date:** November 3, 2025
