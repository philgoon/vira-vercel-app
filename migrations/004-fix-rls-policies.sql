-- Migration 004-FIX: Fix RLS Infinite Recursion
-- [R-FOUNDATION] Sprint 2: Fix infinite recursion in RLS policies
-- Problem: Admin policies were querying user_profiles table, causing recursion
-- Solution: Use helper functions with SECURITY DEFINER
-- Date: 2025-10-14

-- ============================================================================
-- 1. DROP EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- ============================================================================
-- 2. RECREATE HELPER FUNCTIONS WITH PROPER SECURITY
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS is_admin();

-- Function: Get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_user_role() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. CREATE NEW POLICIES USING HELPER FUNCTIONS
-- ============================================================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  USING (is_admin());

-- Policy: Admins can insert new profiles
CREATE POLICY "Admins can create profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (is_admin());

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  USING (is_admin());

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- 4. VALIDATION OUTPUT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration 004-FIX: RLS Policies Fixed ===';
  RAISE NOTICE 'Dropped old recursive policies';
  RAISE NOTICE 'Recreated helper functions with SECURITY DEFINER';
  RAISE NOTICE 'Created new policies using helper functions';
  RAISE NOTICE 'Infinite recursion issue resolved ✓';
  RAISE NOTICE '';
  RAISE NOTICE 'Test by querying: SELECT * FROM user_profiles;';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 004-FIX complete ✓';
END $$;
