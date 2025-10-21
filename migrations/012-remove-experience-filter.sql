-- Revert: Remove the experience filter - algorithm should consider ALL vendors
-- Vendors with no experience will naturally score lower in Performance component

DROP FUNCTION IF EXISTS match_vendors_hybrid(vector(1536), text, integer);

CREATE OR REPLACE FUNCTION match_vendors_hybrid(
  query_embedding vector(1536),
  p_service_category text DEFAULT NULL,
  match_count int DEFAULT 20  -- Increased to 20 for more LLM analysis
)
RETURNS TABLE (
  vendor_id uuid,
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
    GREATEST(1 - (v.skills_embedding <=> query_embedding), 0)::float as semantic_score,
    COALESCE(vp.avg_overall_rating / 10.0, 0.5)::float as performance_score,
    CASE 
      WHEN v.availability_status = 'Available' THEN 1.0
      WHEN v.availability_status = 'Limited' THEN 0.7
      WHEN v.availability_status = 'Unavailable' THEN 0.3
      ELSE 0.5
    END::float as availability_score,
    (
      GREATEST(1 - (v.skills_embedding <=> query_embedding), 0) * 0.4 +
      COALESCE(vp.avg_overall_rating / 10.0, 0.5) * 0.4 +
      CASE 
        WHEN v.availability_status = 'Available' THEN 1.0
        WHEN v.availability_status = 'Limited' THEN 0.7
        WHEN v.availability_status = 'Unavailable' THEN 0.3
        ELSE 0.5
      END * 0.2
    )::float as combined_score
  FROM vendors v
  LEFT JOIN vendor_performance vp ON v.vendor_id = vp.vendor_id
  WHERE v.status = 'active'
    AND v.skills_embedding IS NOT NULL
    -- NO FILTER for rated_projects - include everyone
    AND (p_service_category IS NULL OR p_service_category = ANY(v.service_categories))
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_vendors_hybrid IS 'Hybrid vendor matching: Returns top 20 candidates for LLM analysis. Includes vendors with and without experience - LLM will factor experience into scoring.';
