-- Run this once in your Supabase SQL Editor (dashboard.supabase.com → SQL Editor)
-- Creates the alert_subscriptions table for institution-level email alerts

CREATE TABLE IF NOT EXISTS public.alert_subscriptions (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  institution_slug TEXT NOT NULL,
  institution_name TEXT,
  state         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, institution_slug)
);

-- Row-level security (same pattern as subscribers table)
ALTER TABLE public.alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow the service role (used by the API server) full access
CREATE POLICY "service role full access"
  ON public.alert_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups by institution slug
CREATE INDEX IF NOT EXISTS alert_subs_slug_idx ON public.alert_subscriptions (institution_slug);
CREATE INDEX IF NOT EXISTS alert_subs_email_idx ON public.alert_subscriptions (email);
