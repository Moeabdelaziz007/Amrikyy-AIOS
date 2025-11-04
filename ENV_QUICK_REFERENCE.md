# Environment Variables Quick Reference
**Amrikyy AI OS - Vercel vs Render**

---

## 🎨 VERCEL (Frontend) - 3 Variables

```env
VITE_API_KEY=AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM

VITE_SUPABASE_URL=https://yzfnjkwyxjnuzbggnlhc.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDY5NzIsImV4cCI6MjA3NzcyMjk3Mn0.ynYWBK9yzwMXFwMgVa8GtpNwI42L7icpBoq3DUTepDM
```

**Note:** All 3 variables should be set for: Production, Preview, AND Development

---

## 🔧 RENDER (Backend) - 6 Variables

```env
PORT=3000

NODE_ENV=production

FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app

SUPABASE_URL=https://yzfnjkwyxjnuzbggnlhc.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Zm5qa3d5eGpudXpiZ2dubGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE0Njk3MiwiZXhwIjoyMDc3NzIyOTcyfQ.OlSSM6BqhcKlNEQfc1a8R7zgbzrY9Aboj_6SdSRmzbI

GEMINI_API_KEY=AIzaSyA8G5FjzDYWgV6ZzvU33gfYgKI7mu-ikgM
```

**⚠️ IMPORTANT:** Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL!

---

## 🔐 Security Notes

### ✅ Safe for Frontend (Vercel):
- `VITE_API_KEY` - Public, but should have usage limits
- `VITE_SUPABASE_URL` - Public
- `VITE_SUPABASE_ANON_KEY` - Public, limited permissions

### 🔒 Secret (Backend/Render ONLY):
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ NEVER expose to frontend!

---

## 📋 Quick Copy Table

| Platform | Variables Needed | Count |
|----------|-----------------|-------|
| **Vercel** | All start with `VITE_` | 3 |
| **Render** | No `VITE_` prefix | 6 |

---

## ⚡ Deployment Order

1. **Deploy to Vercel first** → Get your Vercel URL
2. **Then deploy to Render** → Use Vercel URL in `FRONTEND_URL`

---

**Created by:** Mohamed Hossameldin Abdelaziz
**Project:** Amrikyy AI OS
