-- Run this once in Supabase (or with the Scripts panel) to resolve 42P01
-- Minimal schema – adjust columns as needed.
create table if not exists public.your_table (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text
);
