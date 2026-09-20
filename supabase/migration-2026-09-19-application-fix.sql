-- Ripped City Coaching — application + lead-capture repair
-- Run once in the Supabase SQL editor (project neyopskwxstqpoogqumy).
-- Date: 2026-09-19

-- 1) The app's application form sends these columns, but they were never
--    created on public.clients, so every submission failed with PGRST204.
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS checkins            jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cardioLogs         jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS posingLogs         jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS communication      jsonb DEFAULT '{"messages":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS payments           jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS progress           jsonb DEFAULT '{}'::jsonb;

-- 2) Allow anonymous visitors to SUBMIT the public application form.
--    (Insert-only: anon still cannot read, update, or delete clients.)
DROP POLICY IF EXISTS "Public can submit applications" ON public.clients;
CREATE POLICY "Public can submit applications"
  ON public.clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 3) Lead capture for the free "Gut Health Blueprint" guide.
CREATE TABLE IF NOT EXISTS public.leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email      text NOT NULL,
  source     text NOT NULL DEFAULT 'gut-health-blueprint'
);

DROP POLICY IF EXISTS "Public can join lead magnet" ON public.leads;
CREATE POLICY "Public can join lead magnet"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
