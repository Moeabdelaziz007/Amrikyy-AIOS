COMMENT ON COLUMN agents.aix_format IS 'Serialized AIX format text content';
COMMENT ON COLUMN agents.dna IS 'Agent DNA configuration including role, skills, tools, workflows';
COMMENT ON COLUMN agents.persona IS 'Agent personality settings: tone, language, avatar';
COMMENT ON COLUMN agents.feelings IS 'Dynamic emotional state: valence, arousal, motivation';
COMMENT ON COLUMN agents.memory_config IS 'Memory management configuration';
COMMENT ON COLUMN agents.embedding_vector IS 'Vector embedding for semantic search';

-- Function to update feelings timestamp
CREATE OR REPLACE FUNCTION update_feelings_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.feelings = jsonb_set(
    NEW.feelings,
    '{lastUpdated}',
    to_jsonb(NOW()::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update feelings timestamp
CREATE TRIGGER feelings_timestamp_trigger BEFORE UPDATE OF feelings ON agents FOR EACH ROW EXECUTE FUNCTION update_feelings_timestamp();
-- Migration: Add AIX support to agents table
-- File: supabase/migrations/YYYYMMDDHHMMSS_add_aix_fields.sql

-- Add new columns for AIX format
ALTER TABLE agents ADD COLUMN IF NOT EXISTS aix_format TEXT,
ADD COLUMN IF NOT EXISTS dna JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS persona JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS feelings JSONB DEFAULT '{
  "valence": 0.0,
  "arousal": 0.5,
  "motivation": 0.8,
  "lastUpdated": null
}'::jsonb,
ADD COLUMN IF NOT EXISTS memory_config JSONB DEFAULT '{
  "storeToVectorDB": true,
  "vectorTTL": null,
  "memoryBias": "balanced",
  "useRedisCache": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS agents_embedding_idx
ON agents USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- Create index for JSONB fields
CREATE INDEX IF NOT EXISTS agents_dna_idx ON agents USING gin(dna);
CREATE INDEX IF NOT EXISTS agents_persona_idx ON agents USING gin(persona);

-- Add comments for documentation
