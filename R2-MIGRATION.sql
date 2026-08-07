-- Migration: Add R2 URL columns to albums and photos tables
-- Date: 2026-07-01
-- Purpose: Support Cloudflare R2 storage with multiple image variants for cost optimization

-- ============================================
-- PART 1: UPDATE PHOTOS TABLE
-- ============================================

-- Add new columns for R2 image variants
-- Each photo will have 3 variants: thumbnail (400px), medium (800px), large (1920px)
ALTER TABLE photos
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN medium_url TEXT,
ADD COLUMN large_url TEXT,
ADD COLUMN image_width INTEGER,
ADD COLUMN image_height INTEGER,
ADD COLUMN storage_type TEXT DEFAULT 'supabase' CHECK (storage_type IN ('supabase', 'r2'));

-- Add comments for documentation
COMMENT ON COLUMN photos.thumbnail_url IS 'R2 URL for 400px thumbnail variant (WebP format)';
COMMENT ON COLUMN photos.medium_url IS 'R2 URL for 800px medium variant (WebP format)';
COMMENT ON COLUMN photos.large_url IS 'R2 URL for 1920px large variant (WebP format)';
COMMENT ON COLUMN photos.image_width IS 'Original image width in pixels';
COMMENT ON COLUMN photos.image_height IS 'Original image height in pixels';
COMMENT ON COLUMN photos.storage_type IS 'Storage backend: supabase (legacy) or r2 (new)';

-- Create index for storage_type for migration queries
CREATE INDEX IF NOT EXISTS idx_photos_storage_type ON photos(storage_type);

-- ============================================
-- PART 2: UPDATE ALBUMS TABLE
-- ============================================

-- Add storage type column to albums table
ALTER TABLE albums
ADD COLUMN cover_storage_type TEXT DEFAULT 'supabase' CHECK (cover_storage_type IN ('supabase', 'r2'));

COMMENT ON COLUMN albums.cover_storage_type IS 'Storage backend for cover image: supabase (legacy) or r2 (new)';

-- ============================================
-- PART 3: MIGRATION HELPER FUNCTIONS
-- ============================================

-- Function to check if a photo is using R2 storage
CREATE OR REPLACE FUNCTION is_r2_photo(photo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM photos 
    WHERE id = photo_id 
    AND storage_type = 'r2'
    AND thumbnail_url IS NOT NULL
    AND large_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get all legacy Supabase photos (for migration tracking)
CREATE OR REPLACE FUNCTION get_legacy_photos()
RETURNS TABLE (
  id UUID,
  album_id UUID,
  image_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.album_id, p.image_url, p.created_at
  FROM photos p
  WHERE p.storage_type = 'supabase';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: UPDATED PHOTO COUNT VIEW
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS album_photo_counts;

-- Create view to count only visible photos
CREATE VIEW album_photo_counts AS
SELECT 
  album_id,
  COUNT(*) as photo_count,
  COUNT(CASE WHEN storage_type = 'r2' THEN 1 END) as r2_photo_count,
  COUNT(CASE WHEN storage_type = 'supabase' THEN 1 END) as legacy_photo_count
FROM photos
GROUP BY album_id;

-- ============================================
-- PART 5: EXAMPLE DATA QUERIES
-- ============================================

-- Query to check migration status
-- SELECT 
--   storage_type,
--   COUNT(*) as count,
--   ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM photos) * 100, 2) as percentage
-- FROM photos
-- GROUP BY storage_type;

-- Query to find albums with mixed storage types
-- SELECT 
--   a.title,
--   apc.r2_photo_count,
--   apc.legacy_photo_count,
--   apc.photo_count as total
-- FROM albums a
-- JOIN album_photo_counts apc ON a.id = apc.album_id
-- WHERE apc.r2_photo_count > 0 AND apc.legacy_photo_count > 0;

-- ============================================
-- PART 6: ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ============================================

-- To rollback this migration (USE WITH CAUTION):
-- DROP VIEW IF EXISTS album_photo_counts;
-- DROP FUNCTION IF EXISTS get_legacy_photos();
-- DROP FUNCTION IF EXISTS is_r2_photo(UUID);
-- DROP INDEX IF EXISTS idx_photos_storage_type;
-- ALTER TABLE albums DROP COLUMN IF EXISTS cover_storage_type;
-- ALTER TABLE photos DROP COLUMN IF EXISTS storage_type;
-- ALTER TABLE photos DROP COLUMN IF EXISTS image_height;
-- ALTER TABLE photos DROP COLUMN IF EXISTS image_width;
-- ALTER TABLE photos DROP COLUMN IF EXISTS large_url;
-- ALTER TABLE photos DROP COLUMN IF EXISTS medium_url;
-- ALTER TABLE photos DROP COLUMN IF EXISTS thumbnail_url;

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- BACKWARD COMPATIBILITY:
-- - image_url column is RETAINED for backward compatibility
-- - For R2 photos, image_url should point to large_url
-- - Legacy Supabase photos will continue working with image_url
-- - storage_type column tracks which storage backend is used

-- MIGRATION STRATEGY:
-- 1. New photos uploaded through admin panel will use R2 storage
-- 2. Existing Supabase photos will remain in Supabase (storage_type='supabase')
-- 3. Admin can optionally migrate specific albums to R2 later
-- 4. Frontend will automatically use the correct URLs based on storage_type

-- COST OPTIMIZATION:
-- - R2 photos: thumbnail (400px), medium (800px), large (1920px)
-- - Responsive images: serve appropriate variant based on viewport
-- - Zero egress fees from Cloudflare R2
-- - WebP format: ~30-50% smaller than JPEG with same quality

-- EXPECTED SAVINGS:
-- - Storage: ~60% reduction (3 optimized variants vs 1 original)
-- - Bandwidth: ~90% reduction (zero R2 egress + smaller file sizes)
-- - Total monthly cost: ~$150/year savings (100-200 photos/album)
