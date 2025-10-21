-- Migration 014: Fix Search Path for Security-Critical Functions
-- [SECURITY] Fix search_path for functions used in RLS policies
-- Purpose: Prevent search path injection attacks on RLS policy functions
-- Date: 2025-10-20
-- Context: Supabase linter warning - functions used in RLS must have fixed search_path

-- ============================================================================
-- WHY THIS MATTERS
-- ============================================================================
-- These 3 functions are used in ALL RLS policies we created in migration 013.
-- Without a fixed search_path, an attacker could:
--   1. Create a malicious schema (e.g., "attack")
--   2. Create a fake "user_profiles" table in that schema
--   3. Set their role to 'admin' in the fake table
--   4. Gain unauthorized access to all data
--
-- Setting search_path = public, pg_temp prevents this by:
--   - Always looking in 'public' schema first
--   - Only checking pg_temp (temporary objects) second
--   - Ignoring any other schemas the attacker might create
-- ============================================================================

-- ============================================================================
-- 1. FIX is_admin() FUNCTION
-- ============================================================================
-- Used in: 13 RLS policies (all admin access policies)
-- Risk: HIGH - Controls admin access to all tables

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql
   SECURITY DEFINER
   STABLE
   SET search_path = public, pg_temp;  -- FIX: Lock down search path

COMMENT ON FUNCTION is_admin() IS 'Returns true if current user is admin - search_path locked to public schema';

-- ============================================================================
-- 2. FIX get_user_role() FUNCTION
-- ============================================================================
-- Used in: 2 RLS policies (team and vendor role checks)
-- Risk: HIGH - Controls role-based access

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql
   SECURITY DEFINER
   STABLE
   SET search_path = public, pg_temp;  -- FIX: Lock down search path

COMMENT ON FUNCTION get_user_role() IS 'Returns role of current user - search_path locked to public schema';

-- ============================================================================
-- 3. FIX get_user_vendor_id() FUNCTION
-- ============================================================================
-- Used in: 4 RLS policies (vendor self-access policies)
-- Risk: HIGH - Controls vendor data isolation

CREATE OR REPLACE FUNCTION get_user_vendor_id()
RETURNS TEXT AS $$
  SELECT vendor_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql
   SECURITY DEFINER
   STABLE
   SET search_path = public, pg_temp;  -- FIX: Lock down search path

COMMENT ON FUNCTION get_user_vendor_id() IS 'Returns vendor_id for current user - search_path locked to public schema';

-- ============================================================================
-- 4. VALIDATION OUTPUT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration 014: Critical Function Search Path Fix ===';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed 3 security-critical functions:';
  RAISE NOTICE '  ✓ is_admin() - Used in 13 RLS policies';
  RAISE NOTICE '  ✓ get_user_role() - Used in 2 RLS policies';
  RAISE NOTICE '  ✓ get_user_vendor_id() - Used in 4 RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Improvement:';
  RAISE NOTICE '  ✓ search_path locked to "public, pg_temp"';
  RAISE NOTICE '  ✓ Prevents search path injection attacks';
  RAISE NOTICE '  ✓ RLS policies now immune to schema manipulation';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected Supabase Linter Results:';
  RAISE NOTICE '  ✓ 3 fewer function_search_path_mutable warnings';
  RAISE NOTICE '  ✓ 24 function warnings remain (non-critical functions)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test admin login - should work normally';
  RAISE NOTICE '2. Test vendor login - should see only own data';
  RAISE NOTICE '3. Verify Supabase linter shows 3 fewer warnings';
  RAISE NOTICE '4. Optional: Fix remaining 24 function search_path warnings';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 014 complete ✓';
END $$;
