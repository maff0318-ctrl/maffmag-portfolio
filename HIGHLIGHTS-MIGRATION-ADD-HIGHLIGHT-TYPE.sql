-- Migration: Add 'highlight' record type + supporting columns to travel_records
-- Purpose: Support the Bento "Travel Extreme" cards (HighlightCard.vue) so real
--          records/photos can be managed via the new Admin > Highlights page,
--          instead of only the hardcoded sample data in RecordsView.vue.
--
-- Run this in the Supabase SQL Editor.

-- 1. Allow 'highlight' as a valid type value
ALTER TABLE travel_records
  DROP CONSTRAINT IF EXISTS travel_records_type_check;

ALTER TABLE travel_records
  ADD CONSTRAINT travel_records_type_check
  CHECK (type IN ('data', 'photo', 'split', 'highlight'));

-- 2. Add columns used by the 'highlight' type
ALTER TABLE travel_records
  ADD COLUMN IF NOT EXISTS metric TEXT,                 -- e.g. "-18°C", "5,364m", "10,400km"
  ADD COLUMN IF NOT EXISTS location_tag TEXT,            -- e.g. "Oymyakon, Russia"
  ADD COLUMN IF NOT EXISTS year_tag TEXT,                 -- e.g. "2024"
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false, -- wider grid span + larger metric text
  ADD COLUMN IF NOT EXISTS image_placeholder_b64 TEXT;    -- LQIP blur placeholder for image_url

COMMENT ON COLUMN travel_records.metric IS 'Oversized hero metric for highlight cards, e.g. "-18°C"';
COMMENT ON COLUMN travel_records.location_tag IS 'Location label for highlight cards, e.g. "Oymyakon, Russia"';
COMMENT ON COLUMN travel_records.year_tag IS 'Year label for highlight cards, e.g. "2024"';
COMMENT ON COLUMN travel_records.is_featured IS 'When true, highlight card spans 2 columns and uses larger metric typography';
COMMENT ON COLUMN travel_records.image_placeholder_b64 IS 'LQIP: Base64-encoded 10x10px WebP placeholder for the highlight card background photo';

-- 3. Create the storage bucket for highlight card photos (run once).
--    Skip this step in the SQL editor if the bucket already exists -
--    create it via Supabase Dashboard > Storage > New Bucket named
--    "record-images" (Public bucket) if the INSERT below fails silently.
INSERT INTO storage.buckets (id, name, public)
VALUES ('record-images', 'record-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for the record-images bucket (mirrors album-covers policies)
CREATE POLICY "Allow public to read record images"
ON storage.objects FOR SELECT
USING (bucket_id = 'record-images');

CREATE POLICY "Allow authenticated users to upload record images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'record-images');

CREATE POLICY "Allow authenticated users to update record images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'record-images');

CREATE POLICY "Allow authenticated users to delete record images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'record-images');
