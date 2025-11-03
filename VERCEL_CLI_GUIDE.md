# Vercel CLI Deployment Guide
**Deploy Amrikyy AI OS using Vercel CLI**

---

## 🚀 Quick Start with Vercel CLI

This guide shows you how to deploy using the Vercel Command Line Interface (CLI) instead of the web dashboard.

---

## 📦 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or using yarn:
```bash
yarn global add vercel
```

---

## 🔐 Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate. Choose your preferred method (GitHub, GitLab, Bitbucket, or Email).

---

## ⚙️ Step 3: Set Environment Variables

You have two options:

### Option A: Using CLI Commands (Recommended)

```bash
# Navigate to your project directory
cd /path/to/Amrikyy-AIOS

# Add environment variables
vercel env add VITE_API_KEY
# When prompted, paste: AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM
# Select environments: Production, Preview, Development (use space to select, enter to confirm)

vercel env add VITE_SUPABASE_URL
# When prompted, paste: https://yzfnjkwyxjnuzbggnlhc.supabase.co
# Select environments: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM
# Select environments: Production, Preview, Development
```

### Option B: Using .env File (Quick Method)

```bash
# The .env.local file already has all variables
# Pull environment variables from the file
vercel env pull
```

Or manually add from .env.local:
```bash
# Read your .env.local and add each variable
cat .env.local

# Then use vercel env add for each one
```

---

## 🚢 Step 4: Deploy to Vercel

### First Time Deployment

```bash
vercel
```

You'll be asked several questions:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No (or Yes if you already created one)
4. **What's your project's name?** → amrikyy-aios (or your preferred name)
5. **In which directory is your code located?** → ./ (press Enter)
6. **Want to override the settings?** → No (vercel.json is already configured)

The CLI will:
- Build your project
- Deploy to a preview URL
- Give you a URL like: `https://amrikyy-aios-xxx.vercel.app`

### Deploy to Production

```bash
vercel --prod
```

This deploys directly to your production domain.

---

## 🔍 Step 5: Verify Deployment

### Check Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables to verify
vercel env pull .env.vercel
cat .env.vercel
```

### Check Deployment Status

```bash
# List recent deployments
vercel ls

# Get deployment details
vercel inspect <deployment-url>
```

### View Logs

```bash
# View real-time logs
vercel logs <deployment-url>

# Or for production
vercel logs --prod
```

---

## 🛠️ Useful CLI Commands

### Project Management

```bash
# List all your projects
vercel projects ls

# Link current directory to existing project
vercel link

# Remove project link
vercel unlink
```

### Environment Variables

```bash
# List all environment variables
vercel env ls

# Remove an environment variable
vercel env rm VITE_API_KEY

# Pull environment variables to local .env file
vercel env pull
```

### Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific name
vercel --name my-custom-name

# Deploy and open in browser
vercel --open
```

### Domains

```bash
# List domains
vercel domains ls

# Add a custom domain
vercel domains add yourdomain.com

# Remove a domain
vercel domains rm yourdomain.com
```

---

## 📋 Complete Deployment Workflow

Here's the complete workflow from start to finish:

```bash
# 1. Navigate to project
cd /home/runner/work/Amrikyy-AIOS/Amrikyy-AIOS

# 2. Install Vercel CLI (if not already installed)
npm install -g vercel

# 3. Login
vercel login

# 4. Add environment variables (one-time setup)
vercel env add VITE_API_KEY
# Paste: AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM
# Select: Production, Preview, Development

vercel env add VITE_SUPABASE_URL
# Paste: https://yzfnjkwyxjnuzbggnlhc.supabase.co
# Select: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM
# Select: Production, Preview, Development

# 5. Verify environment variables
vercel env ls

# 6. Deploy to preview
vercel

# 7. Test the preview URL
# Open the URL shown in terminal

# 8. If everything works, deploy to production
vercel --prod

# 9. Your app is live!
```

---

## 🔧 Troubleshooting

### "Environment Variable references Secret which does not exist"

**Problem:** This error occurs when vercel.json tries to reference secrets that aren't created.

**Solution:** ✅ **FIXED!** The vercel.json no longer references secrets. Environment variables are now set directly via CLI or dashboard.

### Build Fails

```bash
# Check build logs
vercel logs <deployment-url>

# Test build locally
npm run build

# Deploy with debug mode
vercel --debug
```

### Environment Variables Not Working

```bash
# Verify variables are set
vercel env ls

# Pull and check values
vercel env pull .env.check
cat .env.check

# Re-add if needed
vercel env rm VITE_API_KEY
vercel env add VITE_API_KEY
```

### Wrong Project Linked

```bash
# Unlink current project
vercel unlink

# Link to correct project
vercel link
```

---

## 🎯 Environment Variables Quick Reference

Add these 3 variables using `vercel env add`:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `VITE_API_KEY` | `AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://yzfnjkwyxjnuzbggnlhc.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM` | Production, Preview, Development |

---

## 💡 Pro Tips

1. **Use `vercel dev` for local development** - Simulates Vercel environment locally
   ```bash
   vercel dev
   ```

2. **Preview deployments** - Every git push creates a preview deployment automatically

3. **Production alias** - Set up a custom domain alias
   ```bash
   vercel alias set <deployment-url> yourdomain.com
   ```

4. **Rollback** - Instantly rollback to previous deployment
   ```bash
   vercel rollback
   ```

5. **Team collaboration** - Invite team members
   ```bash
   vercel teams invite user@example.com
   ```

---

## 🌐 Web Dashboard Alternative

If you prefer using the web dashboard instead of CLI:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import from GitHub
4. Add environment variables in project settings
5. Deploy

**Note:** The CLI gives you more control and is faster for repeated deployments.

---

## 📚 Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Deployment Configuration](https://vercel.com/docs/deployments/configuration)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

**Created by:** Mohamed Hossameldin Abdelaziz  
**Project:** Amrikyy AI OS  
**Date:** November 3, 2025
