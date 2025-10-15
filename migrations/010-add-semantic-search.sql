-- Migration 010: Add Semantic Search with Vector Embeddings
-- Purpose: Enable AI-powered semantic matching for ViRA Match
-- Uses OpenAI embeddings + pgvector for similarity search

-- ============================================================================
-- 1. ENABLE PGVECTOR EXTENSION
-- ============================================================================
-- Enable vector similarity search (pgvector extension)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. ADD EMBEDDING COLUMNS
-- ============================================================================

-- Add embedding column to projects table
-- OpenAI text-embedding-3-small produces 1536-dimensional vectors
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS description_embedding vector(1536);

-- Add embedding column to vendors table for skill/service matching
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS skills_embedding vector(1536);

-- ============================================================================
-- 3. CREATE INDEXES FOR VECTOR SIMILARITY SEARCH
-- ============================================================================

-- Index for fast similarity search on project descriptions
CREATE INDEX IF NOT EXISTS idx_projects_description_embedding 
ON projects USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for fast similarity search on vendor skills
CREATE INDEX IF NOT EXISTS idx_vendors_skills_embedding 
ON vendors USING ivfflat (skills_embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- 4. CREATE SIMILARITY SEARCH FUNCTIONS
-- ============================================================================

-- Function: Find similar projects based on description embedding
CREATE OR REPLACE FUNCTION match_similar_projects(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  project_id text,
  project_title text,
  project_description text,
  vendor_id text,
  vendor_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.project_id,
    p.project_title,
    p.project_description,
    p.vendor_id,
    p.vendor_name,
    1 - (p.description_embedding <=> query_embedding) as similarity
  FROM projects p
  WHERE p.description_embedding IS NOT NULL
    AND 1 - (p.description_embedding <=> query_embedding) > match_threshold
  ORDER BY p.description_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Find vendors with similar skills/services
CREATE OR REPLACE FUNCTION match_vendors_by_skills(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  vendor_id text,
  vendor_name text,
  service_categories text[],
  skills text,
  avg_overall_rating decimal,
  availability_status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.vendor_id,
    v.vendor_name,
    v.service_categories,
    v.skills,
    vp.avg_overall_rating,
    v.availability_status,
    1 - (v.skills_embedding <=> query_embedding) as similarity
  FROM vendors v
  LEFT JOIN vendor_performance vp ON v.vendor_id = vp.vendor_id
  WHERE v.skills_embedding IS NOT NULL
    AND v.status = 'active'
    AND 1 - (v.skills_embedding <=> query_embedding) > match_threshold
  ORDER BY v.skills_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Hybrid match (combines semantic search + performance + availability)
CREATE OR REPLACE FUNCTION match_vendors_hybrid(
  query_embedding vector(1536),
  service_category text DEFAULT NULL,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  vendor_id text,
  vendor_name text,
  service_categories text[],
  skills text,
  avg_overall_rating decimal,
  availability_status text,
  semantic_score float,
  performance_score float,
  availability_score float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.vendor_id,
    v.vendor_name,
    v.service_categories,
    v.skills,
    vp.avg_overall_rating,
    v.availability_status,
    -- Semantic similarity (0-1)
    GREATEST(1 - (v.skills_embedding <=> query_embedding), 0)::float as semantic_score,
    -- Performance score (0-1, normalized from 0-10 rating)
    COALESCE(vp.avg_overall_rating / 10.0, 0.5)::float as performance_score,
    -- Availability score (0-1)
    CASE 
      WHEN v.availability_status = 'Available' THEN 1.0
      WHEN v.availability_status = 'Limited' THEN 0.7
      WHEN v.availability_status = 'Unavailable' THEN 0.3
      ELSE 0.5
    END::float as availability_score,
    -- Combined score (weighted average)
    (
      GREATEST(1 - (v.skills_embedding <=> query_embedding), 0) * 0.4 +  -- 40% semantic
      COALESCE(vp.avg_overall_rating / 10.0, 0.5) * 0.4 +                -- 40% performance
      CASE 
        WHEN v.availability_status = 'Available' THEN 1.0
        WHEN v.availability_status = 'Limited' THEN 0.7
        WHEN v.availability_status = 'Unavailable' THEN 0.3
        ELSE 0.5
      END * 0.2                                                           -- 20% availability
    )::float as combined_score
  FROM vendors v
  LEFT JOIN vendor_performance vp ON v.vendor_id = vp.vendor_id
  WHERE v.status = 'active'
    AND v.skills_embedding IS NOT NULL
    -- Optional category filter
    AND (service_category IS NULL OR service_category = ANY(v.service_categories))
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- 5. COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN projects.description_embedding IS 'OpenAI text-embedding-3-small (1536 dimensions) - For semantic project matching';
COMMENT ON COLUMN vendors.skills_embedding IS 'OpenAI text-embedding-3-small (1536 dimensions) - For semantic vendor skill matching';

COMMENT ON FUNCTION match_similar_projects IS 'Find projects similar to query using cosine similarity on embeddings';
COMMENT ON FUNCTION match_vendors_by_skills IS 'Find vendors with similar skills using semantic search';
COMMENT ON FUNCTION match_vendors_hybrid IS 'Hybrid vendor matching: 40% semantic + 40% performance + 20% availability';

-- ============================================================================
-- 6. VALIDATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration 010: Semantic Search Foundation ===';
  RAISE NOTICE 'Extension enabled: vector (pgvector)';
  RAISE NOTICE 'Columns added: description_embedding (projects), skills_embedding (vendors)';
  RAISE NOTICE 'Indexes created: ivfflat indexes for fast similarity search';
  RAISE NOTICE 'Functions created: match_similar_projects, match_vendors_by_skills, match_vendors_hybrid';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Generate embeddings for existing projects via API';
  RAISE NOTICE '2. Generate embeddings for vendor skills';
  RAISE NOTICE '3. Test similarity search functions';
  RAISE NOTICE '4. Integrate with ViRA Match API';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 010 complete ✓';
END $$;
