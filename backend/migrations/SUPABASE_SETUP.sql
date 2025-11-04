-- This script sets up the entire database schema for the Amrikyy AI OS backend.
-- It includes tables for agents, marketplace, chat, API management, and projects.
-- All tables are protected with Row Level Security (RLS) policies.

--
-- Store Agents Table
--
CREATE TABLE store_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    version TEXT DEFAULT '1.0.0',
    author TEXT,
    installs INT DEFAULT 0,
    aix_file TEXT, -- Stores the full AIX YAML/JSON
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view store agents" ON store_agents FOR SELECT USING (true);


--
-- Marketplace Listings Table
--
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES auth.users(id),
    asset_type TEXT NOT NULL, -- 'agent' or 'workflow'
    asset_id UUID, -- Can link to store_agents or a future workflows table
    price INT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view listings" ON marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own listings" ON marketplace_listings FOR ALL USING (auth.uid() = seller_id);

--
-- Marketplace Transactions Table
--
CREATE TABLE marketplace_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id),
    listing_id UUID REFERENCES marketplace_listings(id),
    amount INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON marketplace_transactions FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can create transactions" ON marketplace_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);


--
-- Chat Channels Table
--
CREATE TABLE chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view channels" ON chat_channels FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default channels
INSERT INTO chat_channels (name, description) VALUES ('general', 'General discussion'), ('ai-dev', 'AI development chat');


--
-- Chat Messages Table
--
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    channel_id UUID REFERENCES chat_channels(id),
    user_id UUID REFERENCES auth.users(id),
    username TEXT, -- Denormalized for performance
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view messages" ON chat_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);


--
-- Direct Messages Table
--
CREATE TABLE direct_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own direct messages" ON direct_messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);


--
-- User Presence Table
--
CREATE TABLE user_presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    last_seen TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'offline'
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own presence" ON user_presence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view presence" ON user_presence FOR SELECT USING (auth.role() = 'authenticated');


--
-- API Keys Table
--
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    key_hash TEXT NOT NULL UNIQUE, -- Store a hash, not the key itself
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);


--
-- API Usage Table
--
CREATE TABLE api_usage (
    id BIGSERIAL PRIMARY KEY,
    key_id UUID REFERENCES api_keys(id),
    endpoint TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    status_code INT
);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own API usage" ON api_usage FOR SELECT USING (
    EXISTS (SELECT 1 FROM api_keys WHERE api_keys.id = api_usage.key_id AND api_keys.user_id = auth.uid())
);


--
-- Projects Table (re-defined to ensure consistency)
--
DROP TABLE IF EXISTS projects; -- Drop if it exists from previous migration
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own projects" ON projects FOR ALL USING (auth.uid() = user_id);


--
-- Update Agents Table to include AIX format
--
ALTER TABLE agents ADD COLUMN aix_file TEXT;


--
-- Helper Functions
--
CREATE OR REPLACE FUNCTION increment_agent_installs(agent_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE store_agents
  SET installs = installs + 1
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION transfer_credits(buyer_id_in UUID, seller_id_in UUID, amount_in INT)
RETURNS void AS $$
BEGIN
  -- This is a placeholder. In a real system, you'd have a 'profiles' or 'wallets' table
  -- to manage user credits. This function simulates the transfer.
  RAISE NOTICE 'Transferring % credits from % to %', amount_in, buyer_id_in, seller_id_in;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
