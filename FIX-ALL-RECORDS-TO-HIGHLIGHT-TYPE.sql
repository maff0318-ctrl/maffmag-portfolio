-- SIMPLE FIX: Update ALL existing records to type='highlight'
-- 
-- This will convert all your uploaded records (split, photo, data)
-- to the 'highlight' type so they appear in the Bento grid.
--
-- Run this in your Supabase SQL Editor.

-- Update all non-highlight records to type='highlight'
UPDATE travel_records
SET type = 'highlight'
WHERE type != 'highlight';

-- Verify the changes
SELECT 
  id,
  type,
  title_en,
  caption_en,
  metric,
  location_tag,
  is_visible,
  display_order
FROM travel_records
ORDER BY display_order;
