# API Keys Setup Guide

## Required API Keys

### 1. Google OAuth (for Gmail, Calendar, Drive)

**Steps to get:**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable APIs: Gmail API, Calendar API, Drive API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

**Required env vars:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

### 2. Google Custom Search API

**Steps to get:**
1. Go to https://developers.google.com/custom-search/v1/overview
2. Enable Custom Search API
3. Create API key
4. Create Custom Search Engine at https://cse.google.com/cse/
5. Copy Search Engine ID

**Required env vars:**
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`

### 3. General Google API Key (for YouTube, etc.)

**Steps to get:**
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create API Key
4. Enable YouTube Data API v3

**Required env var:**
- `GOOGLE_API_KEY`

## Priority

**High Priority (needed for core features):**

- **GEMINI_API_KEY**
  - **Purpose:** Powers all core AI features (chat, analysis, image generation).
  - **How to get:**
    1. Visit [Google AI Studio](https://makersuite.google.com/).
    2. Sign in with your Google account.
    3. Click on **"Get API key"** in the top left corner.
    4. Click **"Create API key in new project"**.
    5. Copy the generated API key.
  - **Required env var:** `GEMINI_API_KEY`

- **SUPABASE credentials**
  - **Purpose:** Backend database, authentication, and storage.
  - **Required env vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

- **TELEGRAM_BOT_TOKEN**
  - **Purpose:** Powers the integrated Telegram bot.
  - **Required env var:** `TELEGRAM_BOT_TOKEN`

**Medium Priority (can work without initially):**
- GOOGLE_SEARCH_API_KEY
- GOOGLE_API_KEY (YouTube)

**Low Priority (can add later):**
- GOOGLE_CLIENT_ID (OAuth for Gmail/Calendar/Drive)
- `GOOGLE_CLIENT_SECRET`