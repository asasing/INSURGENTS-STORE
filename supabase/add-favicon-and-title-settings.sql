-- Add favicon and site title to site settings
-- Run this in Supabase SQL Editor

-- Add new settings for favicon and browser tab title
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('favicon_url', ''),
  ('site_title', 'REMAfy - Online Store')
ON CONFLICT (setting_key) DO NOTHING;

-- Verify
SELECT * FROM site_settings;
