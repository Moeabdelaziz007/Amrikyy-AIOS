# Supabase Setup Guide for Amrikyy AI OS

This guide will help you set up Supabase authentication for the Amrikyy AI OS application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Project Name**: `amrikyy-aios` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with the Free tier
5. Click **"Create New Project"**
6. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your Supabase Keys

Once your project is ready:

1. Go to your project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** in the Settings menu
4. You'll see two important keys:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
     - Example: `https://xyzcompany.supabase.co`
   - **anon/public key**: This is your `VITE_SUPABASE_ANON_KEY`
     - This is safe to use in your frontend code
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
     - Only use this in backend/server code

## Step 3: Configure Environment Variables

### For Local Development:

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase keys:
   ```env
   # Existing Google Gemini API Key
   VITE_API_KEY=your_google_gemini_api_key_here
   
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Save the file

### For Vercel Deployment (Frontend):

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `VITE_API_KEY`: Your Google Gemini API key
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Make sure to select all environments (Production, Preview, Development)

### For Render Deployment (Backend - Optional):

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add the following variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (secret!)
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `FRONTEND_URL`: Your Vercel deployment URL (for CORS)

## Step 4: Enable Authentication Providers

### Enable Email/Password Authentication:

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **enabled** (it should be by default)
4. Configure email templates if needed

### Enable OAuth Providers (Optional):

#### For Google OAuth:
1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. You'll need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret** to Supabase

#### For GitHub OAuth:
1. Go to **Authentication** → **Providers**
2. Find **GitHub** and click to expand
3. Toggle **Enable Sign in with GitHub**
4. Create a GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click **New OAuth App**
   - Fill in details:
     - **Application name**: Amrikyy AI OS
     - **Homepage URL**: Your app URL
     - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret** to Supabase

## Step 5: Configure Email Settings (Optional)

For production use, you should configure custom SMTP settings:

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
3. Go to **Project Settings** → **Auth** → **SMTP Settings**
4. Configure your SMTP provider (e.g., SendGrid, Mailgun, AWS SES)

## Step 6: Set Up Row Level Security (RLS) - Recommended

To secure your database:

1. Go to **Database** → **Tables**
2. Create any custom tables you need for your app
3. Enable Row Level Security (RLS) for each table
4. Create policies to control access:

Example policy for a `user_profiles` table:
```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

## Step 7: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your app
3. You should see the login form
4. Try signing up with an email/password
5. Check your email for the confirmation link
6. Try signing in

## Troubleshooting

### "Invalid API key" or similar errors:
- Double-check that your keys are correct
- Make sure you're using `VITE_` prefix for frontend environment variables
- Restart your development server after changing `.env.local`

### Email confirmation not arriving:
- Check your spam folder
- In development, check Supabase dashboard → **Authentication** → **Users** to manually confirm users
- For production, set up custom SMTP

### OAuth redirect errors:
- Verify the callback URLs are correctly configured
- Make sure the OAuth provider is enabled in Supabase
- Check that client ID and secret are correct

## Security Best Practices

1. **Never commit `.env.local` to version control** - it's already in `.gitignore`
2. **Keep your `service_role` key secret** - only use it server-side
3. **Use the `anon` key in frontend code** - it's safe for public use
4. **Enable Row Level Security** on all database tables
5. **Use environment variables** for all sensitive keys
6. **Rotate keys regularly** in production

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
