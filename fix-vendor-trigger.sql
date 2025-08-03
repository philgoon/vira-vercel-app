-- Fix vendor auto-creation trigger to handle existing vendors
-- The issue is that vendor_id conflicts when vendors already exist

CREATE OR REPLACE FUNCTION update_vendor_metrics(vendor_name_param TEXT)
RETURNS VOID AS $$
DECLARE
  vendor_id_value TEXT;
  vendor_record RECORD;
BEGIN
  -- Generate vendor_id from vendor_name (same logic as import)
  vendor_id_value := LOWER(REGEXP_REPLACE(vendor_name_param, '[^a-zA-Z0-9\s]', '', 'g'));
  vendor_id_value := REPLACE(vendor_id_value, ' ', '-');
  vendor_id_value := SUBSTRING(vendor_id_value, 1, 50);

  -- Calculate aggregated metrics ONLY from projects with complete ratings
  SELECT
    COUNT(*) as total_projects,                                    -- All projects
    COUNT(*) FILTER (WHERE project_overall_rating IS NOT NULL) as rated_projects, -- Complete only
    AVG(project_success_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_success,
    AVG(quality_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_quality,
    AVG(communication_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_communication,
    AVG(project_overall_rating) as avg_overall,
    -- Recommendation percentage (only from complete ratings)
    (COUNT(*) FILTER (WHERE recommend_vendor_again = true AND project_overall_rating IS NOT NULL) * 100.0 /
     NULLIF(COUNT(*) FILTER (WHERE project_overall_rating IS NOT NULL), 0)) as recommendation_pct
  INTO vendor_record
  FROM projects_consolidated
  WHERE vendor_name = vendor_name_param;

  -- Insert or update vendor record using vendor_id as conflict target
  INSERT INTO vendors_enhanced (
    vendor_id,
    vendor_name,
    total_projects,
    rated_projects,
    avg_project_success_rating,
    avg_quality_rating,
    avg_communication_rating,
    avg_overall_rating,
    recommendation_percentage,
    updated_at
  ) VALUES (
    vendor_id_value,
    vendor_name_param,
    vendor_record.total_projects,
    vendor_record.rated_projects,
    vendor_record.avg_success,
    vendor_record.avg_quality,
    vendor_record.avg_communication,
    vendor_record.avg_overall,
    vendor_record.recommendation_pct,
    NOW()
  )
  ON CONFLICT (vendor_id) DO UPDATE SET
    vendor_name = vendor_name_param,  -- In case name changed
    total_projects = vendor_record.total_projects,
    rated_projects = vendor_record.rated_projects,
    avg_project_success_rating = vendor_record.avg_success,
    avg_quality_rating = vendor_record.avg_quality,
    avg_communication_rating = vendor_record.avg_communication,
    avg_overall_rating = vendor_record.avg_overall,
    recommendation_percentage = vendor_record.recommendation_pct,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;