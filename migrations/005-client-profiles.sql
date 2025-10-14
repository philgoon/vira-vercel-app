-- Migration 005: Client Profile System
-- [M2] Sprint 3: Client Profiles & Review UX
-- Purpose: Add client profile fields for better vendor matching and client context
-- Date: 2025-10-14

-- ============================================================================
-- 1. CREATE CLIENT_PROFILES TABLE
-- ============================================================================
-- Separate table to store client profile data (since clients_summary is a view)

CREATE TABLE IF NOT EXISTS client_profiles (
  client_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  brand_voice TEXT,
  marketing_brief TEXT,
  budget_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add helpful comments
COMMENT ON TABLE client_profiles IS '[M2] Client profile information for enhanced vendor matching';
COMMENT ON COLUMN client_profiles.industry IS '[M2] Client industry/sector (e.g., Healthcare, Technology, Retail)';
COMMENT ON COLUMN client_profiles.target_audience IS '[M2] Client target audience description';
COMMENT ON COLUMN client_profiles.brand_voice IS '[M2] Brand voice/tone (e.g., Professional, Casual, Technical)';
COMMENT ON COLUMN client_profiles.marketing_brief IS '[M2] Marketing strategy and goals';
COMMENT ON COLUMN client_profiles.budget_range IS '[M2] Typical project budget range (e.g., $5k-$10k, $10k-$25k)';
COMMENT ON COLUMN client_profiles.notes IS '[M2] Additional client notes and context';

-- ============================================================================
-- 2. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_client_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_profiles_updated_at();

-- ============================================================================
-- 3. RECREATE clients_summary VIEW WITH PROFILE DATA
-- ============================================================================
-- Drop and recreate the view to include profile fields via LEFT JOIN

DROP VIEW IF EXISTS clients_summary CASCADE;

CREATE VIEW clients_summary AS
SELECT 
  COALESCE(cp.client_id, p.client_name) AS client_key,
  COALESCE(p.client_name, cp.client_name) AS client_name,
  cp.industry,
  cp.target_audience,
  cp.brand_voice,
  cp.marketing_brief,
  cp.budget_range,
  cp.notes,
  COUNT(DISTINCT p.project_id) AS total_projects,
  MAX(p.created_at) AS last_project_date
FROM projects p
FULL OUTER JOIN client_profiles cp ON p.client_name = cp.client_name
GROUP BY COALESCE(cp.client_id, p.client_name), COALESCE(p.client_name, cp.client_name),
         cp.industry, cp.target_audience, cp.brand_voice, 
         cp.marketing_brief, cp.budget_range, cp.notes;

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
-- Optimize queries by industry and budget range

CREATE INDEX IF NOT EXISTS idx_client_profiles_industry ON client_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_client_profiles_budget_range ON client_profiles(budget_range);
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_name ON client_profiles(client_name);

-- ============================================================================
-- 3. VALIDATION OUTPUT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration 005: Client Profiles ===';
  RAISE NOTICE 'Added profile fields to clients_summary table:';
  RAISE NOTICE '  - industry (client sector)';
  RAISE NOTICE '  - target_audience (audience description)';
  RAISE NOTICE '  - brand_voice (tone/style)';
  RAISE NOTICE '  - marketing_brief (strategy/goals)';
  RAISE NOTICE '  - budget_range (typical budget)';
  RAISE NOTICE '  - notes (additional context)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created indexes for performance optimization';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create ClientProfileModal component';
  RAISE NOTICE '2. Add "Edit Profile" button to clients page';
  RAISE NOTICE '3. Implement admin-only access control';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 005 complete ✓';
END $$;
