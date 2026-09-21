-- Ripped City Coaching — coaching agreement acceptance
-- Run once in the Supabase SQL editor (project neyopskwxstqpoogqumy).
-- Date: 2026-09-21
--
-- Adds the timestamp column the client portal writes when a client accepts
-- the coaching agreement (Settings → editable terms text, F8).
-- RLS policies are table-level, so no policy changes are needed: the coach
-- (authenticated) can read/update all client rows as before.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS "agreementAcceptedAt" timestamptz;
