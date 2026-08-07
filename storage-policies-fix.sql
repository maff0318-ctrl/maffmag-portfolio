-- ============================================
-- STORAGE BUCKET POLICIES FIX
-- ============================================
-- Run this in Supabase SQL Editor to allow uploads
-- ============================================

-- Policies for album-covers bucket
CREATE POLICY "Allow public to read album covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'album-covers');

CREATE POLICY "Allow authenticated users to upload album covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'album-covers');

CREATE POLICY "Allow authenticated users to update album covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'album-covers');

CREATE POLICY "Allow authenticated users to delete album covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'album-covers');

-- Policies for photos bucket
CREATE POLICY "Allow public to read photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
