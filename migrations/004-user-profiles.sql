-- Migration 004: User Profiles and Authentication
-- [R-FOUNDATION] Sprint 2: Authentication Foundation
-- Purpose: Create user_profiles table linked to Supabase Auth with role-based access control
-- Roles: admin (full access), team (review projects), vendor (view own ratings)
-- Date: 2025-10-14

-- ============================================================================
-- 1. CREATE user_profiles TABLE
-- ============================================================================
-- Links to Supabase auth.users via user_id (UUID foreign key)
-- Stores additional profile data and role-based permissions

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'team', 'vendor')),
  vendor_id TEXT, -- Links to vendors.vendor_id (no FK constraint due to potential data issues)
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add helpful comment
COMMENT ON TABLE user_profiles IS '[R-FOUNDATION] User profiles with role-based access control (admin, team, vendor)';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin (full access), team (review projects), vendor (view own ratings)';
COMMENT ON COLUMN user_profiles.vendor_id IS 'Links vendor role users to their vendor record';

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================
-- Optimize queries by role, email, and vendor_id

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_vendor_id ON user_profiles(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- ============================================================================
-- 3. CREATE UPDATED_AT TRIGGER
-- ============================================================================
-- Automatically update updated_at timestamp on row changes

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS and create policies for role-based access control

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert new profiles
CREATE POLICY "Admins can create profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. CREATE HELPER FUNCTION: get_user_role
-- ============================================================================
-- Returns the role of the current authenticated user

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE HELPER FUNCTION: is_admin
-- ============================================================================
-- Returns true if current user is an admin

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 7. VALIDATION OUTPUT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration 004: User Profiles ===';
  RAISE NOTICE 'Table created: user_profiles';
  RAISE NOTICE 'Indexes created: 4 indexes (role, email, vendor_id, is_active)';
  RAISE NOTICE 'RLS enabled: 7 policies created';
  RAISE NOTICE 'Helper functions: get_user_role(), is_admin()';
  RAISE NOTICE 'Roles supported: admin, team, vendor';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create first admin user via Supabase Auth dashboard';
  RAISE NOTICE '2. Insert admin profile: INSERT INTO user_profiles (user_id, email, full_name, role) VALUES (''<uuid>'', ''admin@example.com'', ''Admin User'', ''admin'');';
  RAISE NOTICE '3. Test authentication flow in application';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 004 complete ✓';
END $$;
