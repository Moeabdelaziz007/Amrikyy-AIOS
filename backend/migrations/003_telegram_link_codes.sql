-- Telegram Link Codes Table
CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  telegram_user_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all codes
CREATE POLICY "Service can manage link codes"
  ON telegram_link_codes
  FOR ALL
  TO service_role
  USING (true);