-- Create AssetsYour storage bucket for logos and other assets
-- This needs to be run in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('AssetsYour', 'AssetsYour', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "AssetsYour: Public Access" ON storage.objects;
DROP POLICY IF EXISTS "AssetsYour: Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "AssetsYour: Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "AssetsYour: Authenticated Delete" ON storage.objects;

-- Set up RLS policies for the AssetsYour bucket
-- Allow public read access
CREATE POLICY "AssetsYour: Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'AssetsYour');

-- Allow authenticated users to upload
CREATE POLICY "AssetsYour: Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'AssetsYour' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "AssetsYour: Authenticated Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'AssetsYour' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "AssetsYour: Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'AssetsYour' AND auth.role() = 'authenticated');
