 copilot/fix-200681198-1084474298-419673e8-adf9-458e-97cd-deb07c9d6f2d
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
=======
# Amrikyy AI OS - Quick Start Guide for Developers

**Created by: Mohamed Hossameldin Abdelaziz**

This is a quick reference guide to get you up and running with Amrikyy AI OS development.

---

## ⚡ Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Moeabdelaziz007/Amrikyy-AIOS.git
cd Amrikyy-AIOS

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Google Gemini API key

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

---

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste in `.env.local` as `VITE_API_KEY=your_key_here`

---

## 📁 Project Structure Quick Reference

```
Amrikyy-AIOS/
├── components/
│   ├── apps/           # 50+ application components
│   ├── widgets/        # Dashboard widgets
│   ├── Dock.tsx        # Bottom dock
│   └── Window.tsx      # Window manager
├── contexts/           # React Context providers
├── data/              # Static data (agents, skills, etc.)
├── services/          # API integrations (Gemini, etc.)
├── utils/             # Utility functions
├── App.tsx            # Main application
├── types.ts           # TypeScript definitions
└── i18n.ts            # Internationalization
```

---

## 🎨 Creating a New App

1. **Create the component file**:
   ```bash
   # Create file: components/apps/MyNewApp.tsx
   ```

2. **Use this template**:
   ```typescript
   import React from 'react';

   const MyNewApp: React.FC = () => {
     return (
       <div className="h-full w-full flex flex-col bg-bg-tertiary text-text-primary p-6 overflow-y-auto">
         <h1 className="text-2xl font-bold mb-4">My New App</h1>
         {/* Your content here */}
       </div>
     );
   };

   export default MyNewApp;
   ```

3. **Register in types.ts**:
   ```typescript
   export enum AppID {
     // ... existing apps
     myNewApp = 'myNewApp',
   }
   ```

4. **Add to App.tsx**:
   ```typescript
   const appComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
     // ... existing apps
     [AppID.myNewApp]: lazy(() => import('./components/apps/MyNewApp.tsx')),
   };
   ```

5. **Add to i18n.ts**:
   ```typescript
   'app_titles.myNewApp': 'My New App',
   ```

---

## 🤖 Using Gemini AI

### Generate Text

```typescript
import { generateText } from './services/geminiService';

const response = await generateText(
  'Gemini 2.0 Flash',
  'Your prompt here'
);
```

### Generate Image

```typescript
import { generateImage } from './services/geminiService';

const imageUrl = await generateImage(
  'A futuristic city at sunset',
  { aspectRatio: '16:9' }
);
```

### Multi-turn Conversation

```typescript
import { startConversation } from './services/geminiAdvancedService';

const chat = await startConversation([
  { role: 'user', parts: [{ text: 'Hello!' }] }
]);
```

---

## 🎨 Styling Guidelines

### Use Tailwind CSS Classes

```typescript
// ✅ Good
<div className="flex flex-col gap-4 p-6 bg-bg-tertiary rounded-lg">

// ❌ Avoid inline styles
<div style={{display: 'flex', padding: '24px'}}>
```

### Common Color Classes

- Background: `bg-bg-primary`, `bg-bg-secondary`, `bg-bg-tertiary`
- Text: `text-text-primary`, `text-text-secondary`
- Accents: `text-primary-purple`, `text-primary-cyan`, `text-primary-pink`
- Borders: `border-white/10`, `border-white/20`

### Spacing Scale

- `gap-1` = 4px
- `gap-2` = 8px
- `gap-4` = 16px
- `gap-6` = 24px
- `gap-8` = 32px

---

## 🧪 Testing Your Code

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage
```

### Writing a Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyNewApp from './MyNewApp';

describe('MyNewApp', () => {
  it('renders the app title', () => {
    render(<MyNewApp />);
    expect(screen.getByText('My New App')).toBeInTheDocument();
  });
});
```

---

## 🔍 Debugging Tips

### Check Browser Console

1. Open DevTools (F12)
2. Look for errors in Console tab
3. Check Network tab for API calls
4. Use React DevTools extension

### Common Issues

**API Key Not Working?**
- Restart dev server after changing `.env.local`
- Make sure it's `VITE_API_KEY` (not just `API_KEY`)
- Check API key is valid at Google AI Studio

**Build Errors?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist .vite`

**TypeScript Errors?**
- Make sure types are imported: `import { AppID } from './types'`
- Check for missing properties in interfaces

---

## 🚀 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main application logic, window management |
| `types.ts` | All TypeScript interfaces and types |
| `i18n.ts` | Translations (English/Arabic) |
| `data/agents.ts` | AI agent definitions |
| `data/skills.ts` | Available AI skills |
| `services/geminiService.ts` | Gemini API integration |

---

## 🎯 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   npm test
   npm run lint
   ```

3. **Commit with clear message**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/my-new-feature
   ```

---

## 🤝 Getting Help

- 📖 Read the full [README.md](README.md)
- 📝 Check [KOMABI_FRONTEND_TASKS.md](KOMABI_FRONTEND_TASKS.md) for pending tasks
- 🐛 Report bugs in [GitHub Issues](https://github.com/Moeabdelaziz007/Amrikyy-AIOS/issues)
- 💬 Ask questions in [Discussions](https://github.com/Moeabdelaziz007/Amrikyy-AIOS/discussions)

---

## ⚡ Pro Tips

1. **Use Code Snippets**: Install React/TypeScript extensions in your editor
2. **Hot Reload**: Vite auto-refreshes when you save files
3. **Component Reuse**: Check existing apps before creating new components
4. **TypeScript**: Let it guide you - follow the type errors
5. **Git Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

---

## 🎨 Design System Quick Reference

### Buttons

```typescript
// Primary Button
<button className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-600 transition-colors">
  Click Me
</button>

// Secondary Button
<button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
  Cancel
</button>
```

### Cards

```typescript
<div className="bg-bg-secondary rounded-lg border border-white/10 p-6">
  <h3 className="text-lg font-bold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Inputs

```typescript
<input
  type="text"
  className="w-full px-4 py-2 bg-bg-tertiary border border-white/20 rounded-lg text-text-primary focus:border-primary-purple focus:outline-none"
  placeholder="Enter text..."
/>
```

---

## 🔥 Must-Know Shortcuts

- **Cmd/Ctrl + K**: Open command palette (when implemented)
- **Cmd/Ctrl + Space**: Voice assistant
- **F12**: Open DevTools
- **Cmd/Ctrl + Shift + C**: Inspect element

---

**Happy Coding! 🚀**

*Created by Mohamed Hossameldin Abdelaziz*
*For questions: GitHub @Moeabdelaziz007*
 main
