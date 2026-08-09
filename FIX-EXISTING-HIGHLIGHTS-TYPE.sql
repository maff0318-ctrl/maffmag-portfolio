-- Quick Fix: Update existing records to have type='highlight'
-- 
-- This script updates records that have the highlight-specific columns filled in
-- (metric, location_tag) but have the wrong type value.
--
-- Run this in your Supabase SQL Editor to fix the "Highlights coming soon" issue.

-- Update all records that have metric or location_tag set to type='highlight'
UPDATE travel_records
SET type = 'highlight'
WHERE (
  metric IS NOT NULL 
  OR location_tag IS NOT NULL
)
AND type != 'highlight';

-- Check the results
SELECT 
  id,
  type,
  metric,
  location_tag,
  year_tag,
  is_featured,
  is_visible,
  created_at
FROM travel_records
WHERE type = 'highlight'
ORDER BY display_order;
