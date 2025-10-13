-- [R-QW1] Migration 001: Add Timeline Status Field to Projects
-- Purpose: Allow admin to manually mark projects as Early/On-Time/Late
-- Date: 2025-10-13
-- Sprint: 1 - Quick Wins

-- =====================================
-- FORWARD MIGRATION
-- =====================================

-- Add timeline_status field to projects table (CORRECTED TABLE NAME)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS timeline_status TEXT
  CHECK (timeline_status IN ('Early', 'On-Time', 'Late'));

-- Add comment for documentation
COMMENT ON COLUMN projects.timeline_status IS
  'Admin-set project timeline performance: Early (before deadline), On-Time (met deadline), Late (after deadline)';

-- =====================================
-- ROLLBACK PLAN (if needed)
-- =====================================

-- To rollback this migration, run:
-- ALTER TABLE projects DROP COLUMN IF EXISTS timeline_status;

-- =====================================
-- VALIDATION
-- =====================================

-- Verify column was added successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
    AND column_name = 'timeline_status'
  ) THEN
    RAISE NOTICE '✅ Migration 001 completed: timeline_status column added successfully';
  ELSE
    RAISE EXCEPTION '❌ Migration 001 failed: timeline_status column not found';
  END IF;
END $$;
