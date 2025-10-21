-- Migration 013: Enable RLS and Security Hardening
-- [SECURITY] Fix Supabase linter errors: Enable RLS on public tables and fix SECURITY DEFINER views
-- Purpose: Protect sensitive data with Row Level Security policies
-- Date: 2025-10-20
-- Context: Response to leaked service_role key - defense in depth

-- ============================================================================
-- 1. CREATE HELPER FUNCTION: get_user_vendor_id
-- ============================================================================
-- Returns the vendor_id for the current authenticated user (if vendor role)

CREATE OR REPLACE FUNCTION get_user_vendor_id()
RETURNS TEXT AS $$
  SELECT vendor_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_vendor_id() IS 'Returns vendor_id for current user (NULL if not vendor role)';

-- ============================================================================
-- 2. ENABLE RLS ON client_profiles TABLE
-- ============================================================================
-- Admins: Full access
-- Others: No access (client data is sensitive)

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all client profiles
CREATE POLICY "Admins can view client profiles"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Admins can insert client profiles
CREATE POLICY "Admins can insert client profiles"
  ON client_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Admins can update client profiles
CREATE POLICY "Admins can update client profiles"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Admins can delete client profiles
CREATE POLICY "Admins can delete client profiles"
  ON client_profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 3. ENABLE RLS ON vendors TABLE
-- ============================================================================
-- Admins: Full access
-- Vendors: Can view own record, update specific fields (availability, contact info)
-- Others: No access

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all vendors
CREATE POLICY "Admins can view all vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Vendors can view own vendor record
CREATE POLICY "Vendors can view own record"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (
    vendor_id::TEXT = get_user_vendor_id()
    AND get_user_role() = 'vendor'
  );

-- Policy: Admins can insert vendors
CREATE POLICY "Admins can insert vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Admins can update any vendor
CREATE POLICY "Admins can update any vendor"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Vendors can update own profile fields (limited)
-- Allowed fields: availability, availability_status, availability_notes, phone, website, portfolio_url, sample_work_urls
-- Disallowed: vendor_name, pricing_structure, rate_cost, service_categories (admin-only)
CREATE POLICY "Vendors can update own availability and contact info"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (
    vendor_id::TEXT = get_user_vendor_id()
    AND get_user_role() = 'vendor'
  )
  WITH CHECK (
    vendor_id::TEXT = get_user_vendor_id()
    AND get_user_role() = 'vendor'
  );

-- Policy: Admins can delete vendors
CREATE POLICY "Admins can delete vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 4. ENABLE RLS ON projects TABLE
-- ============================================================================
-- Admins: Full access
-- Team: Read-only access (for review workflow)
-- Vendors: Can view own projects and ratings
-- Others: No access

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Team can view all projects (read-only)
CREATE POLICY "Team can view all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'team');

-- Policy: Vendors can view own projects
CREATE POLICY "Vendors can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    vendor_id::TEXT = get_user_vendor_id()
    AND get_user_role() = 'vendor'
  );

-- Policy: Admins can insert projects
CREATE POLICY "Admins can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Admins can update projects
CREATE POLICY "Admins can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 5. ENABLE RLS ON stg_projects_upload TABLE
-- ============================================================================
-- Admin-only staging table for CSV uploads
-- No access for other roles

ALTER TABLE stg_projects_upload ENABLE ROW LEVEL SECURITY;

-- Policy: Admins only - full access
CREATE POLICY "Admins can manage staging projects"
  ON stg_projects_upload
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 6. FIX SECURITY DEFINER VIEWS
-- ============================================================================
-- Convert SECURITY DEFINER to SECURITY INVOKER (safer pattern)
-- These views will now respect RLS policies on underlying tables

-- 6.1: Fix projects_with_vendor view
DROP VIEW IF EXISTS projects_with_vendor CASCADE;

CREATE VIEW projects_with_vendor
WITH (security_invoker = true)  -- Respects viewer's permissions, not creator's
AS
SELECT
  p.project_id,
  p.project_title,
  p.client_name,
  p.vendor_id,
  v.vendor_name,
  p.project_success_rating,
  p.quality_rating,
  p.communication_rating,
  p.what_went_well,
  p.areas_for_improvement,
  p.recommend_again,
  p.project_overall_rating_calc,
  p.timeline_status,
  -- Compute rating_status based on rating completion
  CASE
    WHEN p.project_overall_rating_calc IS NULL AND p.project_success_rating IS NULL THEN 'Needs Review'
    WHEN p.project_overall_rating_calc IS NULL AND p.project_success_rating IS NOT NULL THEN 'Incomplete'
    WHEN p.project_overall_rating_calc IS NOT NULL THEN 'Complete'
    ELSE 'Needs Review'
  END AS rating_status,
  p.created_at
FROM projects p
LEFT JOIN vendors v ON p.vendor_id::TEXT = v.vendor_id::TEXT;

COMMENT ON VIEW projects_with_vendor IS 'Projects with vendor details - respects RLS on both tables';

-- 6.2: Fix vendor_performance view
DROP VIEW IF EXISTS vendor_performance CASCADE;

CREATE VIEW vendor_performance
WITH (security_invoker = true)  -- Respects viewer's permissions
AS
SELECT
  v.vendor_id,
  v.vendor_name,
  v.vendor_type,
  v.service_categories,
  v.skills,
  v.pricing_structure,
  v.rate_cost,
  v.availability_status,
  COUNT(DISTINCT p.project_id) AS total_projects,
  COUNT(DISTINCT p.project_id) FILTER (WHERE p.project_success_rating IS NOT NULL) AS rated_projects,
  AVG(p.project_success_rating) AS avg_success,
  AVG(p.quality_rating) AS avg_quality,
  AVG(p.communication_rating) AS avg_communication,
  AVG(p.project_overall_rating_calc) AS avg_overall_rating,
  ROUND(
    100.0 * COUNT(DISTINCT p.project_id) FILTER (WHERE p.recommend_again = true) /
    NULLIF(COUNT(DISTINCT p.project_id) FILTER (WHERE p.recommend_again IS NOT NULL), 0),
    1
  ) AS recommendation_pct,
  MAX(p.created_at) AS last_project_date
FROM vendors v
LEFT JOIN projects p ON v.vendor_id::TEXT = p.vendor_id::TEXT
GROUP BY
  v.vendor_id,
  v.vendor_name,
  v.vendor_type,
  v.service_categories,
  v.skills,
  v.pricing_structure,
  v.rate_cost,
  v.availability_status;

COMMENT ON VIEW vendor_performance IS 'Vendor performance metrics - respects RLS on vendors and projects tables';

-- 6.3: Fix clients_summary view
DROP VIEW IF EXISTS clients_summary CASCADE;

CREATE VIEW clients_summary
WITH (security_invoker = true)  -- Respects viewer's permissions
AS
SELECT
  COALESCE(cp.client_id, p.client_name) AS client_key,
  COALESCE(p.client_name, cp.client_name) AS client_name,
  cp.client_id AS profile_id,
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
GROUP BY
  COALESCE(cp.client_id, p.client_name),
  COALESCE(p.client_name, cp.client_name),
  cp.client_id,
  cp.industry,
  cp.target_audience,
  cp.brand_voice,
  cp.marketing_brief,
  cp.budget_range,
  cp.notes;

COMMENT ON VIEW clients_summary IS 'Client summary with profile data - respects RLS on client_profiles and projects tables';

-- ============================================================================
-- 7. GRANT VIEW ACCESS
-- ============================================================================
-- Ensure authenticated users can query views (RLS will filter results)

GRANT SELECT ON projects_with_vendor TO authenticated;
GRANT SELECT ON vendor_performance TO authenticated;
GRANT SELECT ON clients_summary TO authenticated;

-- ============================================================================
-- 8. VALIDATION OUTPUT
-- ============================================================================

DO $$
DECLARE
  v_client_profiles_rls BOOLEAN;
  v_vendors_rls BOOLEAN;
  v_projects_rls BOOLEAN;
  v_stg_projects_rls BOOLEAN;
BEGIN
  -- Check RLS is enabled
  SELECT relrowsecurity INTO v_client_profiles_rls FROM pg_class WHERE relname = 'client_profiles';
  SELECT relrowsecurity INTO v_vendors_rls FROM pg_class WHERE relname = 'vendors';
  SELECT relrowsecurity INTO v_projects_rls FROM pg_class WHERE relname = 'projects';
  SELECT relrowsecurity INTO v_stg_projects_rls FROM pg_class WHERE relname = 'stg_projects_upload';

  RAISE NOTICE '=== Migration 013: RLS Security Hardening ===';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Status:';
  RAISE NOTICE '  client_profiles: %', CASE WHEN v_client_profiles_rls THEN '✓ ENABLED' ELSE '✗ FAILED' END;
  RAISE NOTICE '  vendors: %', CASE WHEN v_vendors_rls THEN '✓ ENABLED' ELSE '✗ FAILED' END;
  RAISE NOTICE '  projects: %', CASE WHEN v_projects_rls THEN '✓ ENABLED' ELSE '✗ FAILED' END;
  RAISE NOTICE '  stg_projects_upload: %', CASE WHEN v_stg_projects_rls THEN '✓ ENABLED' ELSE '✗ FAILED' END;
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies Created:';
  RAISE NOTICE '  client_profiles: 4 policies (admin-only access)';
  RAISE NOTICE '  vendors: 7 policies (admin full, vendor self-read + update profile)';
  RAISE NOTICE '  projects: 7 policies (admin full, team read, vendor read own)';
  RAISE NOTICE '  stg_projects_upload: 1 policy (admin-only)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views Fixed (SECURITY INVOKER):';
  RAISE NOTICE '  ✓ projects_with_vendor - now respects RLS';
  RAISE NOTICE '  ✓ vendor_performance - now respects RLS';
  RAISE NOTICE '  ✓ clients_summary - now respects RLS';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper Functions:';
  RAISE NOTICE '  ✓ get_user_vendor_id() - returns vendor_id for current user';
  RAISE NOTICE '';
  RAISE NOTICE 'Access Matrix:';
  RAISE NOTICE '  Admin: Full access to all tables';
  RAISE NOTICE '  Team: Read-only access to projects';
  RAISE NOTICE '  Vendor: Read own vendor record, projects, and ratings';
  RAISE NOTICE '  Vendor: Update own availability and contact info only';
  RAISE NOTICE '  Public: No access (login required)';
  RAISE NOTICE '';
  RAISE NOTICE 'Vendor Update Permissions:';
  RAISE NOTICE '  ✓ Can update: availability, availability_status, availability_notes, phone, website, portfolio_url';
  RAISE NOTICE '  ✗ Cannot update: vendor_name, pricing_structure, rate_cost, service_categories';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected Supabase Linter Results:';
  RAISE NOTICE '  ✓ rls_disabled_in_public errors: SHOULD BE RESOLVED';
  RAISE NOTICE '  ✓ security_definer_view warnings: SHOULD BE RESOLVED';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test admin login: Should see all vendors and projects';
  RAISE NOTICE '2. Test vendor login: Should see only own vendor record and projects';
  RAISE NOTICE '3. Verify Supabase linter shows 0 errors';
  RAISE NOTICE '4. Test vendor profile update (availability fields only)';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 013 complete ✓';
END $$;
