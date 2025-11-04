# Vercel Environment Variables Setup Guide
**For Amrikyy AI OS Frontend Deployment**

---

## 🔑 Environment Variables for Vercel

When setting up your project in Vercel, you need to add **EXACTLY 3 environment variables**.

### How to Add Environment Variables in Vercel:

1. During initial setup: Click **"Environment Variables"** section before deploying
2. After deployment: Go to **Project Settings** → **Environment Variables**

---

## 📋 Required Variables (Copy & Paste These)

### Variable 1: Google Gemini API Key

| Field | Value |
|-------|-------|
| **Name** | `VITE_API_KEY` |
| **Value** | `AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM` |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

---

### Variable 2: Supabase URL

| Field | Value |
|-------|-------|
| **Name** | `VITE_SUPABASE_URL` |
| **Value** | `https://yzfnjkwyxjnuzbggnlhc.supabase.co` |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

---

### Variable 3: Supabase Anonymous Key

| Field | Value |
|-------|-------|
| **Name** | `VITE_SUPABASE_ANON_KEY` |
| **Value** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM` |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

---

## 📸 Visual Guide

### Step-by-Step:

1. **Click "Add" button** for each variable
2. **Enter the Name** (e.g., `VITE_API_KEY`)
3. **Paste the Value** (copy from table above)
4. **Select ALL environments:**
   - ✅ Check "Production"
   - ✅ Check "Preview"
   - ✅ Check "Development"
5. **Click "Save"**
6. **Repeat** for all 3 variables

---

## ✅ Quick Checklist

After adding all variables, you should see:

```
✅ VITE_API_KEY                    (Production, Preview, Development)
✅ VITE_SUPABASE_URL               (Production, Preview, Development)
✅ VITE_SUPABASE_ANON_KEY          (Production, Preview, Development)
```

**Total: 3 environment variables**

---

## 🚨 Common Mistakes to Avoid

❌ **DON'T** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (this is ONLY for backend/Render)
❌ **DON'T** forget the `VITE_` prefix (Vite requires this)
❌ **DON'T** select only one environment (select all 3)
❌ **DON'T** add quotes around the values

✅ **DO** copy-paste the exact values from this guide
✅ **DO** select all three environments for each variable
✅ **DO** double-check spelling of variable names

---

## 📝 Copy-Paste Format (For Quick Setup)

If Vercel allows bulk import, you can use this format:

```
VITE_API_KEY=AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM
VITE_SUPABASE_URL=https://yzfnjkwyxjnuzbggnlhc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM
```

---

## 🎯 What These Variables Do

| Variable | Purpose |
|----------|---------|
| `VITE_API_KEY` | Connects to Google Gemini AI for all AI features (chat, image generation, etc.) |
| `VITE_SUPABASE_URL` | Points to your Supabase project for authentication and database |
| `VITE_SUPABASE_ANON_KEY` | Public key for Supabase client-side authentication (safe for frontend) |

---

## ⚡ After Adding Variables

1. Click **"Deploy"** (or if already deployed, trigger a redeploy)
2. Wait 2-5 minutes for build to complete
3. ✅ Your app should now work with AI features!

---

## 🔍 Verify Setup

After deployment, test these features to ensure variables are working:

- ✅ Open any AI agent (like Luna or Atlas)
- ✅ Try Gemini chat - should respond
- ✅ Try image generation - should work
- ✅ Authentication features should load

If any fail, double-check:
1. All 3 variables are added
2. Variable names are spelled correctly
3. Values are copied exactly (no extra spaces)
4. All environments are selected

---

**That's it!** These are the ONLY environment variables you need for Vercel.

---

**Note:** The backend (Render) uses DIFFERENT environment variables. This guide is ONLY for Vercel (frontend).
