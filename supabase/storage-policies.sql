-- ====================================
-- STORAGE BUCKET POLICIES
-- Run this AFTER creating the 'product-images' bucket
-- ====================================

-- First, create the bucket (run this in Supabase Dashboard → Storage)
-- Or use this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update images" ON storage.objects;

-- Policy 1: Public Read
-- Allows anyone to view product images
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Admin Upload
-- Allows admins to upload new images
CREATE POLICY "Admins upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Policy 3: Admin Update
-- Allows admins to update existing images
CREATE POLICY "Admins update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Policy 4: Admin Delete
-- Allows admins to delete images
CREATE POLICY "Admins delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ====================================
-- VERIFICATION
-- ====================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- List all policies for storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
