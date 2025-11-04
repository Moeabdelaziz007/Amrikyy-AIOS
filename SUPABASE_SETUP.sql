-- =====================================================
-- SUPABASE SQL - Run this in Supabase SQL Editor
-- =====================================================
-- Copy and paste this entire file into your Supabase SQL Editor
-- and click "Run" to create all necessary tables
-- =====================================================

-- =====================================================
-- STEP 1: CREATE TABLES
-- =====================================================

-- Store Agents (Community Marketplace)
CREATE TABLE IF NOT EXISTS store_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    role TEXT,
    icon TEXT,
    category TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Installed Agents
CREATE TABLE IF NOT EXISTS user_installed_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    store_agent_id uuid REFERENCES store_agents(id) ON DELETE CASCADE NOT NULL,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, store_agent_id)
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_data JSONB,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace Transactions
CREATE TABLE IF NOT EXISTS marketplace_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_id uuid REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat Channels
CREATE TABLE IF NOT EXISTS chat_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id uuid REFERENCES chat_channels(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Direct Messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Presence
CREATE TABLE IF NOT EXISTS user_presence (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Usage
CREATE TABLE IF NOT EXISTS api_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects (Creator Studio)
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    earnings NUMERIC DEFAULT 0,
    tasks JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add AIX format column to existing agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS aix_format TEXT;

-- =====================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE store_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_installed_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: CREATE RLS POLICIES
-- =====================================================

-- Store Agents Policies
DROP POLICY IF EXISTS "Anyone can view published store agents" ON store_agents;
CREATE POLICY "Anyone can view published store agents"
    ON store_agents FOR SELECT
    USING (published = true);

DROP POLICY IF EXISTS "Authors can manage their store agents" ON store_agents;
CREATE POLICY "Authors can manage their store agents"
    ON store_agents FOR ALL
    USING (auth.uid() = author_id);

-- User Installed Agents Policies
DROP POLICY IF EXISTS "Users can view their installed agents" ON user_installed_agents;
CREATE POLICY "Users can view their installed agents"
    ON user_installed_agents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can install agents" ON user_installed_agents;
CREATE POLICY "Users can install agents"
    ON user_installed_agents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can uninstall their agents" ON user_installed_agents;
CREATE POLICY "Users can uninstall their agents"
    ON user_installed_agents FOR DELETE
    USING (auth.uid() = user_id);

-- Marketplace Listings Policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON marketplace_listings;
CREATE POLICY "Anyone can view active listings"
    ON marketplace_listings FOR SELECT
    USING (status = 'active');

DROP POLICY IF EXISTS "Sellers can manage their listings" ON marketplace_listings;
CREATE POLICY "Sellers can manage their listings"
    ON marketplace_listings FOR ALL
    USING (auth.uid() = seller_id);

-- Marketplace Transactions Policies
DROP POLICY IF EXISTS "Users can view their transactions" ON marketplace_transactions;
CREATE POLICY "Users can view their transactions"
    ON marketplace_transactions FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can create transactions" ON marketplace_transactions;
CREATE POLICY "Users can create transactions"
    ON marketplace_transactions FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Chat Channels Policies
DROP POLICY IF EXISTS "Anyone can view public channels" ON chat_channels;
CREATE POLICY "Anyone can view public channels"
    ON chat_channels FOR SELECT
    USING (is_private = false OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create channels" ON chat_channels;
CREATE POLICY "Users can create channels"
    ON chat_channels FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view messages in accessible channels" ON chat_messages;
CREATE POLICY "Users can view messages in accessible channels"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_channels
            WHERE id = channel_id
            AND (is_private = false OR created_by = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
CREATE POLICY "Users can send messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;
CREATE POLICY "Users can delete their own messages"
    ON chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Direct Messages Policies
DROP POLICY IF EXISTS "Users can view their direct messages" ON direct_messages;
CREATE POLICY "Users can view their direct messages"
    ON direct_messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send direct messages" ON direct_messages;
CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- User Presence Policies
DROP POLICY IF EXISTS "Anyone can view user presence" ON user_presence;
CREATE POLICY "Anyone can view user presence"
    ON user_presence FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;
CREATE POLICY "Users can update their own presence"
    ON user_presence FOR ALL
    USING (auth.uid() = user_id);

-- API Keys Policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
CREATE POLICY "Users can view their own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
CREATE POLICY "Users can manage their own API keys"
    ON api_keys FOR ALL
    USING (auth.uid() = user_id);

-- API Usage Policies
DROP POLICY IF EXISTS "Users can view their own API usage" ON api_usage;
CREATE POLICY "Users can view their own API usage"
    ON api_usage FOR SELECT
    USING (auth.uid() = user_id);

-- Projects Policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_store_agents_category ON store_agents(category);
CREATE INDEX IF NOT EXISTS idx_store_agents_rating ON store_agents(rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_agents_published ON store_agents(published);
CREATE INDEX IF NOT EXISTS idx_user_installed_agents_user ON user_installed_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- =====================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION increment_agent_installs(agent_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE store_agents
    SET install_count = install_count + 1
    WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION transfer_credits(from_user uuid, to_user uuid, amount numeric)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET ai_credits = ai_credits - amount
    WHERE id = from_user;
    
    UPDATE users
    SET ai_credits = ai_credits + amount
    WHERE id = to_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: INSERT DEFAULT DATA
-- =====================================================

INSERT INTO chat_channels (name, description, is_private, created_by)
VALUES 
    ('general', 'General discussion', false, NULL),
    ('support', 'Get help and support', false, NULL),
    ('marketplace', 'Discuss marketplace listings', false, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! 
-- =====================================================
-- All tables, policies, and indexes created successfully.
-- Your backend APIs are now ready to use.
-- =====================================================
