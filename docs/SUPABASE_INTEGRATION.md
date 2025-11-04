# Supabase Integration Documentation

This document describes the Supabase integration implemented in the Amrikyy AIOS application.

## Overview

The application has been fully integrated with Supabase for:
- **Authentication**: User session management
- **Database**: CRUD operations for knowledge entries, agents, and file metadata
- **Storage**: File upload, download, and management
- **Real-time**: Live updates across all integrated features

## Architecture

### Authentication

- **AuthContext** (`contexts/AuthContext.tsx`): Manages user authentication state across the application
- Uses Supabase Auth for user session management
- Automatically handles session persistence and refresh

### Services

#### Knowledge Service (`services/knowledgeService.ts`)
Manages knowledge base entries for the ChronoVault app:
- Create, read, update, delete knowledge entries
- Search functionality
- Integrates with `knowledge_base` table in Supabase

#### Agent Service (`services/agentService.ts`)
Manages custom agent configurations for the AgentForge app:
- Create, read, update, delete agent configurations
- Integrates with `agents` table in Supabase

#### File Service (`services/fileService.ts`)
Manages file storage for the Files app:
- Upload files to Supabase Storage
- Download files
- Delete files
- Track file metadata in `file_metadata` table
- File size formatter utility

### Real-time Updates

All apps use Supabase real-time subscriptions to automatically update the UI when data changes:
- ChronoVaultApp: Listens to `knowledge_base` table changes
- AgentForgeApp: Listens to `agents` table changes
- FilesApp: Listens to `file_metadata` table changes

## Database Schema

### Tables Required

#### knowledge_base
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own entries
CREATE POLICY "Users can view their own knowledge entries"
  ON knowledge_base FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge entries"
  ON knowledge_base FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge entries"
  ON knowledge_base FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge entries"
  ON knowledge_base FOR DELETE
  USING (auth.uid() = user_id);
```

#### agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  icon TEXT NOT NULL,
  skill_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policies for agents table
CREATE POLICY "Users can view their own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);
```

#### file_metadata
```sql
CREATE TABLE file_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  folder_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- Policies for file_metadata table
CREATE POLICY "Users can view their own file metadata"
  ON file_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file metadata"
  ON file_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file metadata"
  ON file_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file metadata"
  ON file_metadata FOR DELETE
  USING (auth.uid() = user_id);
```

### Storage Buckets

Create a `user-files` bucket in Supabase Storage:
- Enable RLS on the bucket
- Configure policies to allow users to upload/download/delete their own files

## Environment Variables

Required environment variables (see `.env.example`):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

Comprehensive integration tests are available in `supabase_integration.test.ts`:

```bash
npm test
```

Tests cover:
- User authentication (sign up, sign in, sign out)
- Knowledge base CRUD operations
- Agent CRUD operations
- File storage operations

## Usage Examples

### Using AuthContext

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### Using Knowledge Service

```tsx
import { createKnowledgeEntry } from './services/knowledgeService';

async function createEntry(userId: string) {
  const entry = await createKnowledgeEntry(userId, {
    title: 'My Entry',
    content: 'Entry content',
    tags: ['tag1', 'tag2'],
  });
}
```

### Using Real-time Subscriptions

```tsx
import { subscribeToAllChanges } from './packages/supabase/src';

useEffect(() => {
  const channel = subscribeToAllChanges('knowledge_base', (payload) => {
    console.log('Change detected:', payload);
  });
  
  return () => {
    channel.unsubscribe();
  };
}, []);
```

## Security Considerations

- All database operations are protected by Row Level Security (RLS) policies
- Users can only access their own data
- File uploads are scoped to user directories
- Environment variables should never be committed to version control
- Use Supabase's built-in authentication flow for secure user management

## Future Enhancements

- Implement offline support with local caching
- Add batch operations for bulk data management
- Implement advanced search with full-text search
- Add file sharing capabilities between users
- Implement role-based access control for collaborative features
