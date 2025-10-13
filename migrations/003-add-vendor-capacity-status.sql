-- Migration 003: Add Vendor Capacity Status Fields
-- [R-QW3] Feature 3: Vendor Capacity Status (Sprint 1 - QA Feedback Implementation)
-- Purpose: Track vendor availability and capacity for resource planning

-- Add capacity status fields to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS availability_status TEXT CHECK (availability_status IN ('Available', 'Limited', 'Unavailable', 'On Leave')),
ADD COLUMN IF NOT EXISTS availability_notes TEXT,
ADD COLUMN IF NOT EXISTS available_from DATE;

-- Add helpful comments
COMMENT ON COLUMN vendors.availability_status IS 'Current availability status: Available, Limited, Unavailable, On Leave';
COMMENT ON COLUMN vendors.availability_notes IS 'Optional notes about availability (e.g., "Available starting next week", "Only weekends")';
COMMENT ON COLUMN vendors.available_from IS 'Date when vendor will become available (for Unavailable/On Leave status)';

-- Create index for filtering by availability
CREATE INDEX IF NOT EXISTS idx_vendors_availability_status ON vendors(availability_status);

-- Validation: Show sample of vendors with new columns
DO $$
DECLARE
  vendor_rec RECORD;
  vendor_count INTEGER;
BEGIN
  RAISE NOTICE '=== Migration 003: Vendor Capacity Status ===';

  -- Count total vendors
  SELECT COUNT(*) INTO vendor_count FROM vendors;
  RAISE NOTICE 'Total vendors in database: %', vendor_count;

  -- Show structure validation
  RAISE NOTICE '';
  RAISE NOTICE 'New columns added to vendors table:';
  RAISE NOTICE '  - availability_status (TEXT with CHECK constraint)';
  RAISE NOTICE '  - availability_notes (TEXT)';
  RAISE NOTICE '  - available_from (DATE)';
  RAISE NOTICE '';

  -- Show sample vendors (first 5)
  RAISE NOTICE 'Sample vendors (showing new capacity fields):';
  FOR vendor_rec IN
    SELECT
      vendor_name,
      status,
      availability_status,
      availability_notes,
      available_from
    FROM vendors
    ORDER BY vendor_name
    LIMIT 5
  LOOP
    RAISE NOTICE '  % | Status: % | Availability: % | Notes: % | Available From: %',
      vendor_rec.vendor_name,
      vendor_rec.status,
      COALESCE(vendor_rec.availability_status, 'NULL'),
      COALESCE(vendor_rec.availability_notes, 'NULL'),
      COALESCE(vendor_rec.available_from::TEXT, 'NULL');
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== Migration 003 Complete ===';
  RAISE NOTICE 'All vendors now have capacity status fields (initially NULL).';
  RAISE NOTICE 'Use VendorModal UI to set availability status for each vendor.';
END $$;
