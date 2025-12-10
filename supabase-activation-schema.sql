-- Activation Requests Schema
-- Add activation tracking to user_profiles table

-- Add activation columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS activation_request_data JSONB,
ADD COLUMN IF NOT EXISTS discord_message_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_activated ON user_profiles(activated);
CREATE INDEX IF NOT EXISTS idx_user_profiles_discord_message_id ON user_profiles(discord_message_id);

-- Update RLS policies to allow activation status checks
CREATE POLICY "Users can view activation status" ON user_profiles
  FOR SELECT USING (true);

COMMENT ON COLUMN user_profiles.activated IS 'Whether the user has been activated by staff';
COMMENT ON COLUMN user_profiles.activated_at IS 'Timestamp when user was activated';
COMMENT ON COLUMN user_profiles.rejected_at IS 'Timestamp when user was rejected';
COMMENT ON COLUMN user_profiles.rejection_reason IS 'Reason for rejection if applicable';
COMMENT ON COLUMN user_profiles.activation_request_data IS 'JSON data of the activation request (age, steam link, RP experience, etc.)';
COMMENT ON COLUMN user_profiles.discord_message_id IS 'Discord message ID for the activation request in staff channel';
