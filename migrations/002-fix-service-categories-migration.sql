-- [R-QW2+C3] Migration 002-FIX: Correct service_categories migration from vendor_type
-- Purpose: Fix the migration to copy from vendor_type (not service_category)
-- Date: 2025-10-13
-- Sprint: 1 - Quick Wins + Foundation

-- =====================================
-- CORRECTIVE MIGRATION
-- =====================================

-- Update service_categories from vendor_type field (the actual source of data)
UPDATE vendors
SET service_categories =
  CASE
    -- If vendor_type contains commas, split into array
    WHEN vendor_type LIKE '%,%' THEN
      ARRAY(SELECT trim(unnest(string_to_array(vendor_type, ','))))
    -- If vendor_type is a single value, create single-element array
    WHEN vendor_type IS NOT NULL AND trim(vendor_type) != '' THEN
      ARRAY[trim(vendor_type)]
    -- If null or empty, set to empty array
    ELSE
      ARRAY[]::TEXT[]
  END;

-- Add comment
COMMENT ON COLUMN vendors.service_categories IS
  'Array of service categories this vendor provides. Migrated from vendor_type field for multi-service vendor support.';

-- =====================================
-- VALIDATION
-- =====================================

DO $$
DECLARE
  total_vendors INT;
  vendors_with_services INT;
  empty_arrays INT;
BEGIN
  SELECT COUNT(*) INTO total_vendors FROM vendors;
  SELECT COUNT(*) INTO vendors_with_services
    FROM vendors
    WHERE service_categories IS NOT NULL
      AND array_length(service_categories, 1) > 0;
  SELECT COUNT(*) INTO empty_arrays
    FROM vendors
    WHERE service_categories = ARRAY[]::TEXT[] OR service_categories IS NULL;

  RAISE NOTICE '✅ Migration 002-FIX completed:';
  RAISE NOTICE '   Total vendors: %', total_vendors;
  RAISE NOTICE '   Vendors with services: %', vendors_with_services;
  RAISE NOTICE '   Empty/null arrays: %', empty_arrays;
END $$;

-- Show sample of corrected data
SELECT vendor_name, vendor_type, service_categories
FROM vendors
LIMIT 10;
