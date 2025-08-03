-- Update vendors_enhanced table to match vendor CSV structure
-- Add all missing columns from vendors.csv

ALTER TABLE vendors_enhanced 
ADD COLUMN IF NOT EXISTS vendor_type TEXT,
ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS time_zone TEXT,
ADD COLUMN IF NOT EXISTS contact_preference TEXT,
ADD COLUMN IF NOT EXISTS onboarding_date TEXT,
ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS sample_work_urls TEXT,
ADD COLUMN IF NOT EXISTS pricing_structure TEXT,
ADD COLUMN IF NOT EXISTS rate_cost TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT;