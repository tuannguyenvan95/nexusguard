-- =============================================================================
-- jobs schema — standalone, shareable setup script
-- -----------------------------------------------------------------------------
-- Reproduces the `jobs` table (the on-chain/team job model used by the agent
-- libs + GET /api/jobs) on any Supabase project. `jobs` differs from the
-- dashboard-focused `nexus_jobs` table — see supabase/nexus_jobs_schema.sql.
-- Canonical DDL: supabase/migrations/001_initial_schema.sql
--
-- Usage:
--   1. Supabase Dashboard -> SQL Editor -> paste the whole file -> Run, OR
--   2. CLI:  psql "$DATABASE_URL" -f supabase/jobs_schema.sql
--
-- Idempotent: every statement is guarded with IF NOT EXISTS (or DROP-then-
-- CREATE for policies), so re-running is always safe. `teams` is included as
-- a prerequisite below because `jobs.team_id` references it.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PREREQUISITE: teams ----------------------------------------------------------
-- jobs.team_id references teams(id). This section is a copy of the canonical
-- DDL in 001_initial_schema.sql and is a no-op when teams already exists.
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treasury_wallet_address TEXT,
  treasury_wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own teams" ON teams;
CREATE POLICY "Users can read own teams" ON teams FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Jobs ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_job_id BIGINT,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client_address TEXT,
  provider_address TEXT,
  provider_user_id UUID REFERENCES auth.users(id),
  evaluator_address TEXT,
  budget_usdc DECIMAL(20,6),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','open','funded','submitted','completed','rejected','expired')),
  milestones JSONB DEFAULT '[]'::jsonb,
  deliverable_hash TEXT,
  deliverable_description TEXT,
  validation_score INTEGER,
  validation_feedback TEXT,
  tx_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_team ON jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Row Level Security ----------------------------------------------------------
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- NOTE: 001_initial_schema.sql defines no policies for `jobs` — reads/writes
-- go through the server-side client (service role), which bypasses RLS.
-- Add permissive authenticated policies here only if you move these calls
-- to the browser client.

-- Reload PostgREST's schema cache so the REST API / supabase-js sees the
-- table immediately (fixes: "Could not find the table 'public.jobs' in the
-- schema cache" on freshly created or newly migrated tables).
NOTIFY pgrst, 'reload schema';
