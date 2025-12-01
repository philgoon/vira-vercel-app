-- Migration 015: Fix Rating Trigger Column Name
-- [R-FIX] The trigger from migration 007 references 'overall_rating' but the actual column is 'project_overall_rating_calc'
-- This causes "record has no field overall_rating" error when submitting ratings
-- Date: 2024-12-01

-- Drop the broken trigger first
DROP TRIGGER IF EXISTS trigger_mark_assignment_completed ON projects;

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION mark_assignment_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- [R-FIX] Changed from overall_rating to project_overall_rating_calc
  IF NEW.project_overall_rating_calc IS NOT NULL AND OLD.project_overall_rating_calc IS NULL THEN
    UPDATE review_assignments
    SET status = 'completed',
        completed_at = NOW()
    WHERE project_id = NEW.project_id
      AND status != 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_mark_assignment_completed
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION mark_assignment_completed();

-- Validation
DO $$
BEGIN
  RAISE NOTICE '=== Migration 015: Fix Rating Trigger Column Name ===';
  RAISE NOTICE 'Fixed: mark_assignment_completed() now references project_overall_rating_calc';
  RAISE NOTICE 'Rating submissions should now work correctly';
  RAISE NOTICE 'Migration 015 complete ✓';
END $$;
