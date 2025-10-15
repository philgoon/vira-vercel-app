-- Migration 008: Add Project Description & Enhanced CSV Fields
-- Strategic Impact: Enables better ViRA Match algorithm and richer project context

-- =====================================================
-- ADD PROJECT DESCRIPTION & AI SUMMARY COLUMNS
-- =====================================================
-- project_description: Full original description from CSV
-- project_summary: AI-generated 20-30 word summary for ViRA Match optimization

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_description TEXT;

-- AI-generated summary (20-30 words) - optimized for vector matching
-- Generated during CSV import via OpenAI API
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_summary TEXT;

-- Add submitted_by for tracking who requested the work
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS submitted_by TEXT;

-- Add ticket status for tracking (closed, open, in-progress, etc.)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS ticket_status TEXT DEFAULT 'closed';

-- Add date tracking
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS closed_date TIMESTAMPTZ;

-- =====================================================
-- UPDATE COMMENTS
-- =====================================================
COMMENT ON COLUMN projects.project_description IS 'Full original description from CSV - used for human review context';
COMMENT ON COLUMN projects.project_summary IS 'AI-generated 20-30 word summary optimized for ViRA Match algorithm - dense vector representation';
COMMENT ON COLUMN projects.submitted_by IS 'Person who submitted/requested the project (from Ticket Submitted By)';
COMMENT ON COLUMN projects.ticket_status IS 'Original ticket status from import system (open, closed, in-progress)';
COMMENT ON COLUMN projects.closed_date IS 'Date when ticket/project was marked as closed';

-- =====================================================
-- CREATE INDEXES FOR SEARCH & MATCHING
-- =====================================================
-- Full-text search on descriptions (human search)
CREATE INDEX IF NOT EXISTS idx_projects_description_search 
ON projects USING gin(to_tsvector('english', COALESCE(project_description, '')));

-- Full-text search on summaries (ViRA Match uses this)
CREATE INDEX IF NOT EXISTS idx_projects_summary_search 
ON projects USING gin(to_tsvector('english', COALESCE(project_summary, '')));

-- B-tree index for quick summary lookups
CREATE INDEX IF NOT EXISTS idx_projects_summary_btree
ON projects(project_summary) WHERE project_summary IS NOT NULL;

-- =====================================================
-- STRATEGIC NOTES
-- =====================================================
-- CSV Format (New):
-- - Ticket Title → project_title
-- - Ticket Description → project_description (NEW!)
--   └─→ OpenAI API → project_summary (AI-generated 20-30 words)
-- - Ticket Assignee → vendor lookup
-- - Ticket Submitted By → submitted_by (NEW!)
-- - Ticket Company Name → client_name
-- - Ticket Status → ticket_status (NEW!)
-- - Ticket Created Date → created_at
-- - Ticket Closed Date → closed_date (NEW!)
--
-- AI Summary Strategy:
-- - Purpose: Optimize ViRA Match performance & accuracy
-- - Generated: During CSV import via OpenAI API
-- - Length: 20-30 words (manageable context window)
-- - Focus: Extract key project signals for vector matching
-- - Benefits:
--   1. Reduced token usage in ViRA Match API calls
--   2. Better vector embeddings (focused, dense information)
--   3. Faster semantic matching
--   4. Consistent format for ML processing
--
-- Impact Areas:
-- 1. CSV Import: Call OpenAI API to generate summaries
-- 2. ViRA Match: Use project_summary for semantic matching
-- 3. Review UI: Display full description for context
-- 4. Search: Full-text search on both fields
-- 5. Analytics: Better understanding of project types
-- 6. Future: Store vector embeddings for instant matching
