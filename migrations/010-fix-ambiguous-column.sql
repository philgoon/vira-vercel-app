-- Fix: Ambiguous column reference in match_vendors_hybrid function
-- Issue: Parameter name 'service_category' conflicts with column 'service_categories'
-- Solution: Rename parameter to 'p_service_category' to avoid ambiguity

CREATE OR REPLACE FUNCTION match_vendors_hybrid(
  query_embedding vector(1536),
  p_service_category text DEFAULT NULL,
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
    -- Optional category filter (using p_service_category parameter)
    AND (p_service_category IS NULL OR p_service_category = ANY(v.service_categories))
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_vendors_hybrid IS 'Hybrid vendor matching: 40% semantic + 40% performance + 20% availability';
