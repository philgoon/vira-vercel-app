-- [R-QW2+C3] Migration 002: Multi-Service Vendor Support
-- Purpose: Allow vendors to have multiple service categories for better matching
-- Date: 2025-10-13
-- Sprint: 1 - Quick Wins + Foundation

-- =====================================
-- FORWARD MIGRATION
-- =====================================

-- Step 1: Add new array column for service_categories
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS service_categories TEXT[];

-- Step 2: Migrate existing data from service_category (TEXT) to service_categories (TEXT[])
-- Handle comma-separated values and convert to proper arrays
UPDATE vendors
SET service_categories =
  CASE
    -- If service_category contains commas, split into array
    WHEN service_category LIKE '%,%' THEN
      string_to_array(service_category, ',')
    -- If service_category is a single value, create single-element array
    WHEN service_category IS NOT NULL AND trim(service_category) != '' THEN
      ARRAY[trim(service_category)]
    -- If null or empty, set to empty array
    ELSE
      ARRAY[]::TEXT[]
  END
WHERE service_categories IS NULL; -- Only update if not already set

-- Step 3: Trim whitespace from all array elements
UPDATE vendors
SET service_categories = ARRAY(
  SELECT trim(unnest(service_categories))
)
WHERE service_categories IS NOT NULL AND array_length(service_categories, 1) > 0;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN vendors.service_categories IS
  'Array of service categories this vendor provides (e.g., ["Content Writing", "Copywriting"]). Enables multi-service vendor matching with primary/secondary scoring.';

-- Step 5: Keep old service_category column for backwards compatibility (can be removed later)
COMMENT ON COLUMN vendors.service_category IS
  'DEPRECATED: Use service_categories array instead. Kept for backwards compatibility.';

-- =====================================
-- DATA VALIDATION
-- =====================================

-- Verify migration success
DO $$
DECLARE
  total_vendors INT;
  migrated_vendors INT;
  empty_arrays INT;
  vendor_rec RECORD;
BEGIN
  SELECT COUNT(*) INTO total_vendors FROM vendors;
  SELECT COUNT(*) INTO migrated_vendors FROM vendors WHERE service_categories IS NOT NULL;
  SELECT COUNT(*) INTO empty_arrays FROM vendors WHERE service_categories = ARRAY[]::TEXT[];

  RAISE NOTICE '✅ Migration 002 completed:';
  RAISE NOTICE '   Total vendors: %', total_vendors;
  RAISE NOTICE '   Migrated vendors: %', migrated_vendors;
  RAISE NOTICE '   Empty service arrays: %', empty_arrays;
  RAISE NOTICE '   Vendors with services: %', (migrated_vendors - empty_arrays);

  -- Show sample of migrated data
  RAISE NOTICE 'Sample migrated data:';
  FOR vendor_rec IN
    SELECT v.vendor_name, v.service_category, v.service_categories::TEXT as service_categories_text
    FROM vendors v
    WHERE v.service_categories IS NOT NULL
    LIMIT 5
  LOOP
    RAISE NOTICE '   % : "%" -> %', vendor_rec.vendor_name, vendor_rec.service_category, vendor_rec.service_categories_text;
  END LOOP;
END $$;

-- =====================================
-- ROLLBACK PLAN (if needed)
-- =====================================

-- To rollback this migration, run:
-- ALTER TABLE vendors DROP COLUMN IF EXISTS service_categories;
-- COMMENT ON COLUMN vendors.service_category IS 'Primary service category for this vendor';
