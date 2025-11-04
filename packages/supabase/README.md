# @auraos/supabase

🔥 Centralized Supabase integration package for Amrikyy AI OS.

## 🎯 Features

- ✅ **Authentication** - Email/password, OAuth, session management
- ✅ **Storage** - File uploads, downloads, signed URLs  
- ✅ **Realtime** - Live subscriptions, presence tracking
- ✅ **TypeScript** - Full type safety with exported types

## 📦 Installation

```bash
npm install @supabase/supabase-js
```

## 🚀 Quick Start

### 1. Setup Environment Variables

Add to your `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Import and Use

```typescript
import { supabase, signIn, uploadFile } from '../../packages/supabase/src';

// Authentication
const { user, error } = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Storage
await uploadFile({
  bucket: 'avatars',
  path: 'user-123/avatar.png',
  file: fileObject
});

// Direct database access
const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('user_id', user.id);
```

## 📚 API Reference

See full documentation in [packages/supabase/README.md](./README.md)

---

**Author:** Mohamed Hossameldin Abdelaziz  
**License:** MIT
