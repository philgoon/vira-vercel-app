-- Migration 006: Vendor Portal - Invites & Applications (SAFE VERSION)
-- [C1] Vendor onboarding system with invite-only registration
-- This version uses IF NOT EXISTS to avoid errors if already partially run

-- =====================================================
-- VENDOR INVITES TABLE
-- =====================================================
-- Stores invite tokens sent by admins to potential vendors

CREATE TABLE IF NOT EXISTS vendor_invites (
  invite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for fast token lookup (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_invites_token') THEN
    CREATE INDEX idx_vendor_invites_token ON vendor_invites(invite_token);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_invites_email') THEN
    CREATE INDEX idx_vendor_invites_email ON vendor_invites(email);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_invites_status') THEN
    CREATE INDEX idx_vendor_invites_status ON vendor_invites(status);
  END IF;
END $$;

-- =====================================================
-- VENDOR APPLICATIONS TABLE
-- =====================================================
-- Stores vendor application data before approval

CREATE TABLE IF NOT EXISTS vendor_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES vendor_invites(invite_id) ON DELETE CASCADE,
  
  -- Basic Information
  vendor_name TEXT NOT NULL,
  email TEXT NOT NULL,
  primary_contact TEXT,
  phone TEXT,
  website TEXT,
  
  -- Services & Expertise
  industry TEXT,
  service_category TEXT,
  skills TEXT,
  
  -- Pricing
  pricing_structure TEXT,
  rate_cost TEXT,
  
  -- Availability
  availability TEXT,
  availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Limited', 'On Leave', 'Unavailable')),
  available_from DATE,
  availability_notes TEXT,
  
  -- Portfolio & Samples
  portfolio_url TEXT,
  sample_work_urls TEXT,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
  
  -- Additional Notes
  notes TEXT
);

-- Indexes (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_applications_status') THEN
    CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_applications_email') THEN
    CREATE INDEX idx_vendor_applications_email ON vendor_applications(email);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_applications_invite') THEN
    CREATE INDEX idx_vendor_applications_invite ON vendor_applications(invite_id);
  END IF;
END $$;

-- =====================================================
-- VENDOR USERS TABLE (Link vendors to user accounts)
-- =====================================================
-- Maps approved vendors to their user accounts for portal access

CREATE TABLE IF NOT EXISTS vendor_users (
  vendor_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, user_id)
);

-- Indexes (safe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_users_vendor') THEN
    CREATE INDEX idx_vendor_users_vendor ON vendor_users(vendor_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendor_users_user') THEN
    CREATE INDEX idx_vendor_users_user ON vendor_users(user_id);
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE vendor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Admins can manage vendor invites" ON vendor_invites;
CREATE POLICY "Admins can manage vendor invites"
  ON vendor_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public can view invites by token" ON vendor_invites;
CREATE POLICY "Public can view invites by token"
  ON vendor_invites
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admins can view all vendor applications" ON vendor_applications;
CREATE POLICY "Admins can view all vendor applications"
  ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update vendor applications" ON vendor_applications;
CREATE POLICY "Admins can update vendor applications"
  ON vendor_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public can create vendor applications" ON vendor_applications;
CREATE POLICY "Public can create vendor applications"
  ON vendor_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage vendor users" ON vendor_users;
CREATE POLICY "Admins can manage vendor users"
  ON vendor_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Vendors can view their own user mapping" ON vendor_users;
CREATE POLICY "Vendors can view their own user mapping"
  ON vendor_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to check if invite is valid
CREATE OR REPLACE FUNCTION is_invite_valid(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vendor_invites
    WHERE invite_token = token
    AND status = 'pending'
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE vendor_invites IS 'Stores invite tokens for vendor onboarding';
COMMENT ON TABLE vendor_applications IS 'Stores vendor application data pending admin approval';
COMMENT ON TABLE vendor_users IS 'Maps approved vendors to user accounts for portal access';
COMMENT ON FUNCTION generate_invite_token() IS 'Generates a unique 64-character hex token for vendor invites';
COMMENT ON FUNCTION is_invite_valid(TEXT) IS 'Checks if an invite token is valid and not expired';
