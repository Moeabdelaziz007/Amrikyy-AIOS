# Vercel Deployment Guide for Amrikyy AI OS

This guide provides step-by-step instructions for deploying the Amrikyy AI OS frontend to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- Your GitHub repository with the Amrikyy-AIOS code
- Supabase project set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Google Gemini API key

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click **"Add New..." → "Project"**
   - Select **"Import Git Repository"**
   - Find and select `Moeabdelaziz007/Amrikyy-AIOS`
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Should auto-detect as "Vite"
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click on **"Environment Variables"** and add:
   
   | Name | Value | Notes |
   |------|-------|-------|
   | `VITE_API_KEY` | Your Google Gemini API key | Required |
   | `VITE_SUPABASE_URL` | Your Supabase project URL | e.g., `https://xxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Safe to use in frontend |

   **Important**: Add these for all environments (Production, Preview, Development)

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**
   ```bash
   cd /path/to/Amrikyy-AIOS
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `amrikyy-aios`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

5. **Add Environment Variables**
   ```bash
   vercel env add VITE_API_KEY
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   
   For each command, paste the value when prompted and select all environments.

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Automatic Deployments

Once set up, Vercel automatically deploys your app:

- **Production Deployments**: Every push to `main` branch
- **Preview Deployments**: Every push to other branches or pull requests

### Configure Auto-Deploy:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Git**
3. Verify **"Production Branch"** is set to `main`
4. Enable **"Automatic Deployments from Git"**

## Custom Domain Setup

### Add a Custom Domain:

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain name (e.g., `amrikyy.com`)
5. Click **"Add"**

### Configure DNS:

Vercel will provide DNS records. Add these to your domain registrar:

**For Root Domain** (`amrikyy.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www Subdomain** (`www.amrikyy.com`):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Verify Domain:

- DNS changes may take 24-48 hours to propagate
- Check status in Vercel dashboard
- Once verified, your site will be accessible at your custom domain

## Environment Variables Management

### View Environment Variables:

1. Go to **Settings** → **Environment Variables**
2. View all configured variables

### Update Environment Variables:

1. Go to **Settings** → **Environment Variables**
2. Find the variable you want to update
3. Click the **"Edit"** button
4. Update the value
5. Click **"Save"**
6. **Redeploy** your application for changes to take effect

### Environment-Specific Variables:

You can set different values for different environments:
- **Production**: Live app
- **Preview**: Pull request previews
- **Development**: Local development with `vercel dev`

## Build Settings

### Override Build Command:

If you need to customize the build:

1. Go to **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Override:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Build Environment:

- **Node.js Version**: 20.x (automatically detected from `package.json` engines field if specified)
- You can override in **Settings** → **General** → **Node.js Version**

## Deployment Troubleshooting

### Build Fails with "Module not found":

**Solution**: Make sure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working:

**Check**:
- Variables are prefixed with `VITE_`
- Variables are set for correct environment (Production/Preview/Development)
- Redeploy after adding/changing variables

**Test locally**:
```bash
vercel env pull .env.local
npm run dev
```

### Build Succeeds but App Shows Errors:

1. Check the **"Functions"** tab in Vercel dashboard for runtime errors
2. Check browser console for client-side errors
3. Verify environment variables are set correctly

### Deployment is Slow:

- **Install Cache**: Enabled by default
- **Build Cache**: Managed automatically
- To clear cache: Redeploy with **"Clear cache and redeploy"** option

## Performance Optimization

### Enable Edge Network:

Vercel automatically serves your static assets via their global Edge Network. No configuration needed!

### Image Optimization:

If using images, consider using Vercel's Image Optimization:

```tsx
import Image from 'next/image'; // If migrating to Next.js

// Or use native img with srcset for Vite
```

### Analytics:

Enable Vercel Analytics to monitor performance:

1. Go to **Analytics** tab
2. Click **"Enable Analytics"**
3. Add `@vercel/analytics` to your project:
   ```bash
   npm install @vercel/analytics
   ```
4. Update your app entry point:
   ```tsx
   import { inject } from '@vercel/analytics';
   inject();
   ```

## Monitoring & Debugging

### View Deployment Logs:

1. Go to **Deployments** tab
2. Click on a deployment
3. Click **"Building"** or **"View Logs"**

### Real-time Logs:

```bash
vercel logs [deployment-url] --follow
```

### Runtime Logs (for functions):

```bash
vercel logs [deployment-url] --follow --output
```

## Rollback Deployments

If a deployment has issues:

1. Go to **Deployments** tab
2. Find a previous working deployment
3. Click the **"⋯"** menu
4. Select **"Promote to Production"**

Or via CLI:
```bash
vercel rollback
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use VITE_ prefix** - Only for frontend-safe variables
3. **Keep anon key public** - Supabase anon key is safe for frontend
4. **Rotate keys regularly** - Update in Vercel settings
5. **Use Vercel's environment tiers** - Different keys for different environments

## Preview Deployments

Every pull request gets a unique preview URL:

1. Push changes to a branch
2. Create a pull request
3. Vercel automatically deploys to a preview URL
4. Preview URL is posted as a comment on the PR
5. Share with team for review before merging

### Disable Preview Deployments:

If you don't want preview deployments:

1. Go to **Settings** → **Git**
2. Toggle **"Preview Deployments"** off

## CLI Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [url]

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add [name]

# Remove deployment
vercel remove [deployment-id]

# List deployments
vercel ls

# Login
vercel login

# Logout
vercel logout
```

## Integration with Render (Backend)

If you're also deploying a backend to Render:

1. Set `VITE_API_URL` environment variable in Vercel:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

2. Update your API calls to use this URL:
   ```tsx
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   ```

3. Configure CORS in your Render backend to allow your Vercel domain

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review deployment logs
3. Contact [Vercel Support](https://vercel.com/support)
4. Open an issue in this repository
