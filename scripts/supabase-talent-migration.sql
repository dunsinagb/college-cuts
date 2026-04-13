-- Talent profiles table for the supply side of the Skills Gap Intelligence marketplace
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution TEXT NOT NULL,
  institution_slug TEXT,
  department TEXT,
  role_title TEXT NOT NULL,
  degree_level TEXT,
  years_experience INTEGER,
  specializations TEXT[] DEFAULT '{}',
  open_to TEXT[] DEFAULT '{}',
  state TEXT,
  linkedin_url TEXT,
  bio TEXT,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by institution
CREATE INDEX IF NOT EXISTS talent_profiles_institution_slug_idx ON talent_profiles(institution_slug);

-- Index for filtering by state
CREATE INDEX IF NOT EXISTS talent_profiles_state_idx ON talent_profiles(state);

-- Index for visible profiles only
CREATE INDEX IF NOT EXISTS talent_profiles_visible_idx ON talent_profiles(visible) WHERE visible = TRUE;

-- RLS: Enable row-level security
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (register)
CREATE POLICY "Anyone can register a talent profile"
  ON talent_profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can read all, public can only read visible profiles
CREATE POLICY "Public can read visible profiles"
  ON talent_profiles FOR SELECT
  USING (visible = TRUE);
