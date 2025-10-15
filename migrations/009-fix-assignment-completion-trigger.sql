-- Migration 009: Fix Assignment Auto-Completion Trigger
-- Problem: Trigger looks for 'overall_rating' but column is 'project_overall_rating_calc'
-- Fix: Update trigger function to use correct column name

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS trigger_mark_assignment_completed ON projects;
DROP FUNCTION IF EXISTS mark_assignment_completed();

-- Recreate function with correct column name
CREATE OR REPLACE FUNCTION mark_assignment_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- When project gets a calculated overall rating (review completed)
  IF NEW.project_overall_rating_calc IS NOT NULL 
     AND (OLD.project_overall_rating_calc IS NULL OR OLD.project_overall_rating_calc != NEW.project_overall_rating_calc) THEN
    
    -- Mark all review assignments for this project as completed
    UPDATE review_assignments
    SET status = 'completed',
        completed_at = NOW()
    WHERE project_id = NEW.project_id
      AND status != 'completed';
    
    RAISE NOTICE 'Auto-completed review assignments for project %', NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_mark_assignment_completed
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION mark_assignment_completed();

COMMENT ON FUNCTION mark_assignment_completed() IS 'Auto-completes review assignments when project receives a rating (project_overall_rating_calc updated)';

-- Validation
DO $$
BEGIN
  RAISE NOTICE '=== Migration 009: Assignment Auto-Completion Trigger Fixed ===';
  RAISE NOTICE 'Updated trigger to watch project_overall_rating_calc column';
  RAISE NOTICE 'Assignments will now auto-complete when reviews are submitted';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 009 complete ✓';
END $$;
