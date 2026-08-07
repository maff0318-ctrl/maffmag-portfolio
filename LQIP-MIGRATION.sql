-- Migration: Add LQIP (Low-Quality Image Placeholder) support
-- Date: 2026-07-10
-- Purpose: Add Base64-encoded 10×10px WebP placeholder for instant image loading

-- ============================================
-- PART 1: ADD LQIP COLUMN TO PHOTOS TABLE
-- ============================================

-- Add placeholder_b64 column for Base64 data URI
ALTER TABLE photos
ADD COLUMN placeholder_b64 TEXT;

-- Add comment for documentation
COMMENT ON COLUMN photos.placeholder_b64 IS 'Base64-encoded 10×10px WebP placeholder (data:image/webp;base64,...) for instant blur loading, typically <500 bytes';

-- ============================================
-- PART 2: ADD LQIP COLUMN TO ALBUMS TABLE
-- ============================================

-- Add placeholder for album cover images
ALTER TABLE albums
ADD COLUMN cover_placeholder_b64 TEXT;

COMMENT ON COLUMN albums.cover_placeholder_b64 IS 'Base64-encoded 10×10px WebP placeholder for album cover image';

-- ============================================
-- PART 3: CREATE INDEX FOR PERFORMANCE
-- ============================================

-- Index for finding photos with missing placeholders (for batch generation)
CREATE INDEX IF NOT EXISTS idx_photos_missing_placeholder 
ON photos(id) 
WHERE placeholder_b64 IS NULL AND storage_type = 'r2';

-- ============================================
-- PART 4: HELPER FUNCTIONS
-- ============================================

-- Function to check if photo has LQIP
CREATE OR REPLACE FUNCTION has_lqip(photo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM photos 
    WHERE id = photo_id 
    AND placeholder_b64 IS NOT NULL
    AND placeholder_b64 != ''
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get photos without LQIP (for migration/backfill)
CREATE OR REPLACE FUNCTION get_photos_without_lqip()
RETURNS TABLE (
  id UUID,
  album_id UUID,
  image_url TEXT,
  storage_type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.album_id, p.image_url, p.storage_type, p.created_at
  FROM photos p
  WHERE p.placeholder_b64 IS NULL
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to count LQIP statistics
CREATE OR REPLACE FUNCTION get_lqip_stats()
RETURNS TABLE (
  total_photos BIGINT,
  with_lqip BIGINT,
  without_lqip BIGINT,
  lqip_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_photos,
    COUNT(CASE WHEN placeholder_b64 IS NOT NULL THEN 1 END)::BIGINT as with_lqip,
    COUNT(CASE WHEN placeholder_b64 IS NULL THEN 1 END)::BIGINT as without_lqip,
    ROUND(
      (COUNT(CASE WHEN placeholder_b64 IS NOT NULL THEN 1 END)::NUMERIC / 
       NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
      2
    ) as lqip_percentage
  FROM photos;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: EXAMPLE QUERIES
-- ============================================

-- Check if migration was successful
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'photos' 
-- AND column_name = 'placeholder_b64';

-- Get LQIP statistics
-- SELECT * FROM get_lqip_stats();

-- Find photos without LQIP (for backfill)
-- SELECT * FROM get_photos_without_lqip() LIMIT 10;

-- Sample LQIP data format (for reference)
-- Example placeholder_b64 value:
-- 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoKAAoAPm0skkWkIqGYCACADYlpbt0PdAD++hj+AAAA'
-- Size: ~120-500 bytes (10×10px WebP, highly compressed)

-- ============================================
-- PART 6: ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ============================================

-- To rollback this migration (USE WITH CAUTION):
-- DROP FUNCTION IF EXISTS get_lqip_stats();
-- DROP FUNCTION IF EXISTS get_photos_without_lqip();
-- DROP FUNCTION IF EXISTS has_lqip(UUID);
-- DROP INDEX IF EXISTS idx_photos_missing_placeholder;
-- ALTER TABLE albums DROP COLUMN IF EXISTS cover_placeholder_b64;
-- ALTER TABLE photos DROP COLUMN IF EXISTS placeholder_b64;

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- BACKWARD COMPATIBILITY:
-- - placeholder_b64 is NULLABLE, so existing photos continue working
-- - Old photos without LQIP will skip the blur effect gracefully
-- - New uploads automatically generate LQIP

-- PERFORMANCE IMPACT:
-- - Minimal: TEXT column stores ~200-500 bytes per photo
-- - 10,000 photos × 300 bytes avg = ~3 MB additional database storage
-- - Much faster than loading images for perceived performance

-- LQIP BENEFITS:
-- - Instant visual feedback (0ms, from database query)
-- - Beautiful blur-to-sharp transition
-- - Reduced perceived loading time
-- - Better UX on slow connections
-- - Prevents layout shift (CLS improvement)

-- TECHNICAL DETAILS:
-- - Format: data:image/webp;base64,[BASE64_STRING]
-- - Dimensions: 10×10px (100 pixels)
-- - Compression: WebP at 20-40% quality
-- - Average size: 200-400 bytes
-- - Blur effect: CSS blur(20px) scale(1.1)
-- - Transition: 700ms opacity fade

-- EXAMPLE USAGE IN CODE:
-- const photo = await supabase.from('photos').select('*').single()
-- <div style="background-image: url(${photo.placeholder_b64}); filter: blur(20px)">
--   <img src="${photo.large_url}" onload="this.style.opacity=1" />
-- </div>
