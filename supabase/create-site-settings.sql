-- Create Site Settings Table for Logo and Other Configurations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Anyone can read settings"
  ON site_settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON site_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('site_logo_url', ''),
  ('site_name', 'Insurgents Store'),
  ('site_tagline', 'Premium Shoes & Apparel')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to get setting
CREATE OR REPLACE FUNCTION get_setting(key text)
RETURNS text AS $$
  SELECT setting_value FROM site_settings WHERE setting_key = key;
$$ LANGUAGE sql STABLE;

-- Function to update setting
CREATE OR REPLACE FUNCTION update_setting(key text, value text)
RETURNS void AS $$
  INSERT INTO site_settings (setting_key, setting_value, updated_at)
  VALUES (key, value, NOW())
  ON CONFLICT (setting_key)
  DO UPDATE SET setting_value = value, updated_at = NOW();
$$ LANGUAGE sql;

-- Verify
SELECT * FROM site_settings;
