-- [R-CLERK-6]: Phase 1 - Add clerk_user_id alongside existing user_id (non-breaking)
-- Run this BEFORE cutover. Existing user_id column is preserved until mapping is confirmed.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Index for fast lookups by Clerk ID (used by all API routes post-migration)
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Phase 2 (run after all users have logged in via Clerk and clerk_user_id is populated):
-- ALTER TABLE user_profiles ALTER COLUMN clerk_user_id SET NOT NULL;
-- ALTER TABLE user_profiles DROP COLUMN user_id;
-- DROP INDEX IF EXISTS idx_user_profiles_user_id;
