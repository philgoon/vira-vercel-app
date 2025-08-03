-- Fresh Import Schema for ViRA - Replaces 4-table structure with 2-table design
-- Supports flexible CSV imports (project-only OR complete with ratings)
-- Auto-calculates vendor metrics from complete ratings only

-- =====================================
-- PHASE 1: DROP EXISTING TABLES (Clean Slate)
-- =====================================

-- Drop existing tables and dependencies
DROP TABLE IF EXISTS vendor_ratings CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- =====================================
-- PHASE 2: CREATE NEW OPTIMIZED SCHEMA
-- =====================================

-- Table 1: Enhanced Vendors (Master Reference)
CREATE TABLE vendors_enhanced (
  vendor_id TEXT PRIMARY KEY,                    -- slug: 'cristina-kocsis'
  vendor_name TEXT NOT NULL UNIQUE,              -- 'Cristina Kocsis'

  -- Auto-calculated performance metrics (ONLY from complete ratings)
  total_projects INTEGER DEFAULT 0,              -- All projects (rated + unrated)
  rated_projects INTEGER DEFAULT 0,              -- Projects with complete ratings only
  avg_project_success_rating DECIMAL(4,2),       -- From complete ratings only
  avg_quality_rating DECIMAL(4,2),               -- From complete ratings only
  avg_communication_rating DECIMAL(4,2),         -- From complete ratings only
  avg_overall_rating DECIMAL(4,2),               -- From complete ratings only
  recommendation_percentage DECIMAL(5,2),        -- % "Yes" from complete ratings only

  -- Optional vendor metadata (can be populated later)
  service_categories TEXT[],
  status TEXT DEFAULT 'active',
  primary_contact TEXT,
  email TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Consolidated Projects (Direct CSV Mapping + Flexible Import Support)
CREATE TABLE projects_consolidated (
  project_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- ===== REQUIRED PROJECT COLUMNS (Always present in imports) =====
  vendor_name TEXT NOT NULL,                     -- CSV Column 1: "Ticket Assignee"
  submitted_by TEXT,                             -- CSV Column 2: "Ticket Submitted By"
  project_title TEXT NOT NULL,                  -- CSV Column 3: "Ticket Title"
  client_company TEXT NOT NULL,                 -- CSV Column 4: "Ticket Company Name"
  status TEXT DEFAULT 'closed',                 -- CSV Column 5: "Ticket Status"

  -- ===== OPTIONAL RATING COLUMNS (Nullable for flexible imports) =====
  -- CSV Columns 6-8: Individual ratings (1-10 scale)
  project_success_rating INTEGER CHECK (project_success_rating BETWEEN 1 AND 10),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 10),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 10),

  -- CSV Columns 9-11: Feedback and recommendation
  what_went_well TEXT,                           -- CSV Column 9: "What went well?"
  areas_for_improvement TEXT,                    -- CSV Column 10: "Areas for improvement?"
  recommend_vendor_again BOOLEAN,                -- CSV Column 11: "Would you recommend..."
  recommendation_scope TEXT,                     -- 'general', 'client-specific', null

  -- ===== CALCULATED FIELDS =====
  -- CSV Column 12: Project Overall Rating (NULL unless all 3 ratings present)
  project_overall_rating DECIMAL(4,2),

  -- Foreign key relationship to vendors
  vendor_id TEXT REFERENCES vendors_enhanced(vendor_id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- PHASE 3: AUTO-CALCULATION LOGIC
-- =====================================

-- Function: Calculate project overall rating (STRICT - all 3 ratings required)
CREATE OR REPLACE FUNCTION calculate_project_overall_rating(
  success_rating INTEGER,
  quality_rating INTEGER,
  communication_rating INTEGER
) RETURNS DECIMAL(4,2) AS $$
BEGIN
  -- ONLY calculate when ALL THREE ratings are present (strict business rule)
  IF success_rating IS NOT NULL
     AND quality_rating IS NOT NULL
     AND communication_rating IS NOT NULL THEN
    RETURN (success_rating + quality_rating + communication_rating) / 3.0;
  ELSE
    RETURN NULL;  -- Incomplete ratings = no overall rating
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Parse recommendation text into boolean + scope
CREATE OR REPLACE FUNCTION parse_recommendation(
  recommendation_text TEXT
) RETURNS TABLE(recommend BOOLEAN, scope TEXT) AS $$
BEGIN
  IF recommendation_text IS NULL OR TRIM(recommendation_text) = '' THEN
    RETURN QUERY SELECT NULL::BOOLEAN, NULL::TEXT;
  ELSIF LOWER(TRIM(recommendation_text)) = 'yes' THEN
    RETURN QUERY SELECT true, 'general'::TEXT;
  ELSIF LOWER(recommendation_text) LIKE '%yes%for%only%'
        OR LOWER(recommendation_text) LIKE '%yes%-%' THEN
    RETURN QUERY SELECT true, 'client-specific'::TEXT;
  ELSE
    RETURN QUERY SELECT NULL::BOOLEAN, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate project overall rating on insert/update
CREATE OR REPLACE FUNCTION trigger_update_project_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate overall rating using strict logic
  NEW.project_overall_rating := calculate_project_overall_rating(
    NEW.project_success_rating,
    NEW.quality_rating,
    NEW.communication_rating
  );

  -- Update timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_overall_rating
  BEFORE INSERT OR UPDATE ON projects_consolidated
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_project_overall_rating();

-- Function: Update vendor aggregate metrics (ONLY from complete ratings)
CREATE OR REPLACE FUNCTION update_vendor_metrics(vendor_name_param TEXT)
RETURNS void AS $$
DECLARE
  vendor_record RECORD;
  vendor_id_value TEXT;
BEGIN
  -- Generate vendor_id from vendor name
  vendor_id_value := REPLACE(LOWER(TRIM(vendor_name_param)), ' ', '-');

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

  -- Insert or update vendor record
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
  ON CONFLICT (vendor_name) DO UPDATE SET
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

-- Trigger: Update vendor metrics when projects change
CREATE OR REPLACE FUNCTION trigger_update_vendor_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics for the affected vendor(s)
  IF TG_OP = 'DELETE' THEN
    PERFORM update_vendor_metrics(OLD.vendor_name);
    RETURN OLD;
  ELSE
    PERFORM update_vendor_metrics(NEW.vendor_name);
    -- If vendor name changed, update old vendor metrics too
    IF TG_OP = 'UPDATE' AND OLD.vendor_name != NEW.vendor_name THEN
      PERFORM update_vendor_metrics(OLD.vendor_name);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vendor_metrics
  AFTER INSERT OR UPDATE OR DELETE ON projects_consolidated
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_vendor_metrics();

-- Trigger: Update project vendor_id after vendor record is created
CREATE OR REPLACE FUNCTION trigger_update_project_vendor_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all projects for this vendor to reference the vendor_id
  UPDATE projects_consolidated
  SET vendor_id = NEW.vendor_id
  WHERE vendor_name = NEW.vendor_name AND vendor_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_vendor_id
  AFTER INSERT OR UPDATE ON vendors_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_project_vendor_id();

-- =====================================
-- PHASE 4: PERFORMANCE OPTIMIZATION
-- =====================================

-- Create indexes for optimal query performance
CREATE INDEX idx_projects_vendor_name ON projects_consolidated(vendor_name);
CREATE INDEX idx_projects_client_company ON projects_consolidated(client_company);
CREATE INDEX idx_projects_status ON projects_consolidated(status);
CREATE INDEX idx_projects_vendor_id ON projects_consolidated(vendor_id);
CREATE INDEX idx_projects_ratings ON projects_consolidated(project_success_rating, quality_rating, communication_rating);
CREATE INDEX idx_projects_overall_rating ON projects_consolidated(project_overall_rating);
CREATE INDEX idx_projects_created_at ON projects_consolidated(created_at);

CREATE INDEX idx_vendors_name ON vendors_enhanced(vendor_name);
CREATE INDEX idx_vendors_avg_rating ON vendors_enhanced(avg_overall_rating);
CREATE INDEX idx_vendors_status ON vendors_enhanced(status);

-- =====================================
-- PHASE 5: SECURITY & ACCESS CONTROL
-- =====================================

-- Enable Row Level Security
ALTER TABLE vendors_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_consolidated ENABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust based on your auth setup)
CREATE POLICY "Allow all operations for authenticated users" ON vendors_enhanced
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON projects_consolidated
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================
-- PHASE 6: AGGREGATION TABLES FOR ADMIN UI
-- =====================================

-- Table 3: Clients Aggregation (Auto-calculated from projects)
CREATE TABLE clients (
  client_id TEXT PRIMARY KEY,                        -- slug: 'acme-corp'
  client_name TEXT NOT NULL UNIQUE,                  -- 'Acme Corp'
  
  -- Aggregated project metrics
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  projects_with_ratings INTEGER DEFAULT 0,
  
  -- Client performance metrics
  avg_project_rating DECIMAL(4,2),                   -- Average across all rated projects
  total_spend_estimate DECIMAL(10,2),                -- If rate data available
  
  -- Client metadata (inferred from projects)
  industry TEXT,                                      -- Most common industry from projects
  primary_contact TEXT,                               -- Most recent contact
  contact_email TEXT,                                 -- Most recent email
  time_zone TEXT,                                     -- Most common timezone
  preferred_contact TEXT,                             -- Most common contact method
  
  -- Engagement metrics
  first_project_date DATE,
  last_project_date DATE,
  avg_project_duration_days INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Vendor Ratings Aggregation (Pre-calculated performance metrics)
CREATE TABLE vendor_ratings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id TEXT NOT NULL REFERENCES vendors_enhanced(vendor_id),
  vendor_name TEXT NOT NULL,
  
  -- Core rating metrics (matches vendors_enhanced for consistency)
  total_projects INTEGER DEFAULT 0,
  rated_projects INTEGER DEFAULT 0,
  unrated_projects INTEGER DEFAULT 0,
  
  -- Average ratings (from complete ratings only)
  avg_project_success DECIMAL(4,2),
  avg_quality DECIMAL(4,2),
  avg_communication DECIMAL(4,2),
  avg_overall_rating DECIMAL(4,2),
  
  -- Performance analytics
  recommendation_percentage DECIMAL(5,2),
  consistency_score DECIMAL(4,2),                    -- Standard deviation indicator
  improvement_trend TEXT,                             -- 'improving', 'declining', 'stable'
  
  -- Time-based metrics
  last_30_days_projects INTEGER DEFAULT 0,
  last_30_days_avg_rating DECIMAL(4,2),
  last_project_date DATE,
  
  -- Performance classification
  performance_tier TEXT,                              -- 'Excellent', 'Very Good', etc.
  risk_level TEXT,                                    -- 'Low', 'Medium', 'High'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(vendor_id)
);

-- =====================================
-- AGGREGATION TABLE MAINTENANCE FUNCTIONS
-- =====================================

-- Function: Update client aggregation metrics
CREATE OR REPLACE FUNCTION update_client_metrics(client_company_param TEXT)
RETURNS void AS $$
DECLARE
  client_record RECORD;
  client_id_value TEXT;
BEGIN
  -- Generate client_id from company name
  client_id_value := REPLACE(LOWER(TRIM(client_company_param)), ' ', '-');
  client_id_value := REPLACE(client_id_value, '.', '');
  client_id_value := REPLACE(client_id_value, '&', 'and');
  
  -- Calculate aggregated client metrics
  SELECT
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'active' OR status = 'in_progress') as active_projects,
    COUNT(*) FILTER (WHERE status = 'closed' OR status = 'completed') as completed_projects,
    COUNT(*) FILTER (WHERE project_overall_rating IS NOT NULL) as projects_with_ratings,
    AVG(project_overall_rating) as avg_rating,
    MIN(created_at::date) as first_project,
    MAX(created_at::date) as last_project
  INTO client_record
  FROM projects_consolidated
  WHERE client_company = client_company_param;
  
  -- Insert or update client record
  INSERT INTO clients (
    client_id,
    client_name,
    total_projects,
    active_projects,
    completed_projects,
    projects_with_ratings,
    avg_project_rating,
    first_project_date,
    last_project_date,
    updated_at
  ) VALUES (
    client_id_value,
    client_company_param,
    client_record.total_projects,
    client_record.active_projects,
    client_record.completed_projects,
    client_record.projects_with_ratings,
    client_record.avg_rating,
    client_record.first_project,
    client_record.last_project,
    NOW()
  )
  ON CONFLICT (client_name) DO UPDATE SET
    total_projects = client_record.total_projects,
    active_projects = client_record.active_projects,
    completed_projects = client_record.completed_projects,
    projects_with_ratings = client_record.projects_with_ratings,
    avg_project_rating = client_record.avg_rating,
    first_project_date = client_record.first_project,
    last_project_date = client_record.last_project,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Update vendor ratings aggregation
CREATE OR REPLACE FUNCTION update_vendor_ratings_metrics(vendor_name_param TEXT)
RETURNS void AS $$
DECLARE
  vendor_record RECORD;
  vendor_id_value TEXT;
  consistency DECIMAL(4,2);
  recent_trend TEXT;
BEGIN
  -- Get vendor_id from vendors_enhanced table
  SELECT vendor_id INTO vendor_id_value 
  FROM vendors_enhanced 
  WHERE vendor_name = vendor_name_param;
  
  IF vendor_id_value IS NULL THEN
    RETURN; -- Vendor doesn't exist yet, will be created by other trigger
  END IF;
  
  -- Calculate comprehensive vendor rating metrics
  SELECT
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE project_overall_rating IS NOT NULL) as rated_projects,
    COUNT(*) FILTER (WHERE project_overall_rating IS NULL) as unrated_projects,
    AVG(project_success_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_success,
    AVG(quality_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_quality,
    AVG(communication_rating) FILTER (WHERE project_overall_rating IS NOT NULL) as avg_communication,
    AVG(project_overall_rating) as avg_overall,
    (COUNT(*) FILTER (WHERE recommend_vendor_again = true AND project_overall_rating IS NOT NULL) * 100.0 /
     NULLIF(COUNT(*) FILTER (WHERE project_overall_rating IS NOT NULL), 0)) as recommendation_pct,
    STDDEV(project_overall_rating) as rating_stddev,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_projects,
    AVG(project_overall_rating) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_avg_rating,
    MAX(created_at::date) as last_project
  INTO vendor_record
  FROM projects_consolidated
  WHERE vendor_name = vendor_name_param;
  
  -- Calculate consistency score (inverse of standard deviation)
  consistency := CASE 
    WHEN vendor_record.rating_stddev IS NULL OR vendor_record.rating_stddev = 0 THEN 10.0
    ELSE GREATEST(0, 10.0 - (vendor_record.rating_stddev * 2))
  END;
  
  -- Determine performance tier
  recent_trend := CASE
    WHEN vendor_record.avg_overall >= 9.0 THEN 'Excellent'
    WHEN vendor_record.avg_overall >= 8.0 THEN 'Very Good'
    WHEN vendor_record.avg_overall >= 7.0 THEN 'Good'
    WHEN vendor_record.avg_overall >= 6.0 THEN 'Fair'
    ELSE 'Needs Improvement'
  END;
  
  -- Insert or update vendor ratings record
  INSERT INTO vendor_ratings (
    vendor_id,
    vendor_name,
    total_projects,
    rated_projects,
    unrated_projects,
    avg_project_success,
    avg_quality,
    avg_communication,
    avg_overall_rating,
    recommendation_percentage,
    consistency_score,
    performance_tier,
    last_30_days_projects,
    last_30_days_avg_rating,
    last_project_date,
    updated_at
  ) VALUES (
    vendor_id_value,
    vendor_name_param,
    vendor_record.total_projects,
    vendor_record.rated_projects,
    vendor_record.unrated_projects,
    vendor_record.avg_success,
    vendor_record.avg_quality,
    vendor_record.avg_communication,
    vendor_record.avg_overall,
    vendor_record.recommendation_pct,
    consistency,
    recent_trend,
    vendor_record.recent_projects,
    vendor_record.recent_avg_rating,
    vendor_record.last_project,
    NOW()
  )
  ON CONFLICT (vendor_id) DO UPDATE SET
    total_projects = vendor_record.total_projects,
    rated_projects = vendor_record.rated_projects,
    unrated_projects = vendor_record.unrated_projects,
    avg_project_success = vendor_record.avg_success,
    avg_quality = vendor_record.avg_quality,
    avg_communication = vendor_record.avg_communication,
    avg_overall_rating = vendor_record.avg_overall,
    recommendation_percentage = vendor_record.recommendation_pct,
    consistency_score = consistency,
    performance_tier = recent_trend,
    last_30_days_projects = vendor_record.recent_projects,
    last_30_days_avg_rating = vendor_record.recent_avg_rating,
    last_project_date = vendor_record.last_project,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- AGGREGATION TABLE TRIGGERS
-- =====================================

-- Updated trigger: Maintain both vendor metrics and aggregation tables
CREATE OR REPLACE FUNCTION trigger_update_all_aggregations()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics for the affected vendor(s) and client(s)
  IF TG_OP = 'DELETE' THEN
    PERFORM update_vendor_metrics(OLD.vendor_name);
    PERFORM update_vendor_ratings_metrics(OLD.vendor_name);
    PERFORM update_client_metrics(OLD.client_company);
    RETURN OLD;
  ELSE
    PERFORM update_vendor_metrics(NEW.vendor_name);
    PERFORM update_vendor_ratings_metrics(NEW.vendor_name);
    PERFORM update_client_metrics(NEW.client_company);
    
    -- If vendor or client changed, update old records too
    IF TG_OP = 'UPDATE' THEN
      IF OLD.vendor_name != NEW.vendor_name THEN
        PERFORM update_vendor_metrics(OLD.vendor_name);
        PERFORM update_vendor_ratings_metrics(OLD.vendor_name);
      END IF;
      IF OLD.client_company != NEW.client_company THEN
        PERFORM update_client_metrics(OLD.client_company);
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Replace the old trigger with the new comprehensive one
DROP TRIGGER IF EXISTS trigger_update_vendor_metrics ON projects_consolidated;
CREATE TRIGGER trigger_update_aggregations
  AFTER INSERT OR UPDATE OR DELETE ON projects_consolidated
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_all_aggregations();

-- Trigger: Update vendor_ratings when vendors_enhanced is updated
CREATE OR REPLACE FUNCTION trigger_sync_vendor_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Keep vendor_ratings in sync with vendors_enhanced
  UPDATE vendor_ratings 
  SET vendor_name = NEW.vendor_name,
      updated_at = NOW()
  WHERE vendor_id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_vendor_ratings
  AFTER UPDATE ON vendors_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_vendor_ratings();

-- =====================================
-- INDEXES FOR AGGREGATION TABLES
-- =====================================

-- Clients table indexes
CREATE INDEX idx_clients_name ON clients(client_name);
CREATE INDEX idx_clients_total_projects ON clients(total_projects);
CREATE INDEX idx_clients_avg_rating ON clients(avg_project_rating);
CREATE INDEX idx_clients_last_project ON clients(last_project_date);

-- Vendor ratings table indexes
CREATE INDEX idx_vendor_ratings_vendor_id ON vendor_ratings(vendor_id);
CREATE INDEX idx_vendor_ratings_vendor_name ON vendor_ratings(vendor_name);
CREATE INDEX idx_vendor_ratings_overall ON vendor_ratings(avg_overall_rating);
CREATE INDEX idx_vendor_ratings_tier ON vendor_ratings(performance_tier);
CREATE INDEX idx_vendor_ratings_recent ON vendor_ratings(last_30_days_avg_rating);

-- Enable RLS for aggregation tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON vendor_ratings
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================
-- PHASE 7: UTILITY VIEWS FOR EASY QUERYING
-- =====================================

-- View: Projects with vendor performance context
CREATE VIEW project_performance_view AS
SELECT
  p.*,
  v.avg_overall_rating as vendor_avg_rating,
  v.recommendation_percentage as vendor_recommendation_pct,
  v.total_projects as vendor_total_projects,
  v.rated_projects as vendor_rated_projects,
  -- Comparison to vendor average
  CASE
    WHEN p.project_overall_rating IS NOT NULL AND v.avg_overall_rating IS NOT NULL THEN
      p.project_overall_rating - v.avg_overall_rating
    ELSE NULL
  END as performance_vs_vendor_avg
FROM projects_consolidated p
LEFT JOIN vendors_enhanced v ON p.vendor_id = v.vendor_id;

-- View: Comprehensive dashboard with all metrics
CREATE VIEW admin_dashboard_view AS
SELECT
  'vendors' as table_type,
  COUNT(*) as record_count,
  AVG(avg_overall_rating) as avg_metric
FROM vendors_enhanced
UNION ALL
SELECT
  'projects' as table_type,
  COUNT(*) as record_count,
  AVG(project_overall_rating) as avg_metric
FROM projects_consolidated
UNION ALL
SELECT
  'clients' as table_type,
  COUNT(*) as record_count,
  AVG(avg_project_rating) as avg_metric
FROM clients
UNION ALL
SELECT
  'ratings' as table_type,
  COUNT(*) as record_count,
  AVG(avg_overall_rating) as avg_metric
FROM vendor_ratings;

-- =====================================
-- COMPLETION MESSAGE
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '✅ 4-Table Aggregation Schema Created Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Table Structure:';
  RAISE NOTICE '  • vendors_enhanced: Master vendor reference with auto-calculated metrics';
  RAISE NOTICE '  • projects_consolidated: All project data with nullable rating columns';
  RAISE NOTICE '  • clients: Aggregated client metrics (auto-calculated from projects)';
  RAISE NOTICE '  • vendor_ratings: Comprehensive vendor performance analytics';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Key Features:';
  RAISE NOTICE '  • Flexible imports: Project-only OR complete data supported';
  RAISE NOTICE '  • Auto-aggregation: All metrics update via triggers';
  RAISE NOTICE '  • Fast queries: Pre-calculated metrics for instant dashboard performance';
  RAISE NOTICE '  • Admin UI ready: 4-table structure matches existing interface';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for CSV import and admin dashboard!';
END $$;
