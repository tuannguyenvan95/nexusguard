-- =============================================================================
-- nexus_jobs schema — standalone, shareable setup script
-- -----------------------------------------------------------------------------
-- A single file to reproduce the `nexus_jobs` table on any Supabase project:
-- works for a fresh setup AND for patching an existing hand-created table
-- (like the live project, which was missing the `deadline` and `milestones`
-- columns).
--
-- Usage:
--   1. Supabase Dashboard -> SQL Editor -> paste the whole file -> Run, OR
--   2. CLI:  psql "$DATABASE_URL" -f supabase/nexus_jobs_schema.sql
--
-- The script is idempotent: every statement is guarded with IF NOT EXISTS
-- (or DROP-then-CREATE for policies), so re-running it is always safe and a
-- no-op when everything already exists.
--
-- Table summary: `nexus_jobs` stores the dashboard job flow (create / list /
-- detail / apply / submit / validate / dispute / delete), keyed by a short
-- text id (e.g. 'job_48162', generated client-side) with denormalized
-- display fields. It intentionally differs from the `jobs` table in
-- 001_initial_schema.sql (used by the agent libs + GET /api/jobs); both
-- tables coexist.
-- =============================================================================

CREATE TABLE IF NOT EXISTS nexus_jobs (
  id           TEXT PRIMARY KEY,             -- e.g. 'job_48162' (generated client-side)
  title        TEXT NOT NULL,
  amount       TEXT,                         -- display string, e.g. '2500 USDC'
  status       TEXT NOT NULL DEFAULT 'Open', -- 'Open' | 'Draft' | 'Funded' | 'In Progress' | 'Submitted' | 'Completed' | ...
  provider     TEXT,                         -- JSON: { "address": "0x1234...5678", "name": "...", "avatar": "..." }
  date         TEXT,                         -- display deadline, e.g. 'Oct 24, 2026'
  deadline     TEXT,                         -- ISO date picked in the create form
  agent        TEXT,                         -- assigned AI agent / swarm label
  description  TEXT,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,   -- string[] of acceptance criteria
  payouttype   TEXT NOT NULL DEFAULT 'winner_takes_all',
  maxwinners   TEXT NOT NULL DEFAULT '1',
  milestones   JSONB NOT NULL DEFAULT '[]'::jsonb,   -- {name, amount, percent, status, disputeOpen, disputeResult}[]
  applicant    TEXT NOT NULL DEFAULT '[]',   -- JSON string[] of applicant addresses
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,   -- {submitterWallet, githubUrl, previewUrl, socialHandle}[]
  payout_txs   JSONB NOT NULL DEFAULT '[]'::jsonb,   -- {address, txHash}[]
  ai_reports   JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { "<submitterWallet>": "<report>" }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PATCH (idempotent) ---------------------------------------------------------
-- Hand-created tables may predate later-added columns (`deadline` and
-- `milestones` were both confirmed missing on the live project). The CREATE
-- TABLE above does nothing when the table already exists, so the ALTERs
-- below repair it. `milestones` gets NOT NULL + default so existing rows are
-- backfilled with an empty array.
ALTER TABLE nexus_jobs ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE nexus_jobs ADD COLUMN IF NOT EXISTS milestones JSONB NOT NULL DEFAULT '[]'::jsonb;

-- The only SQL-level filter the app uses on this table is the created_at
-- ordering (every page fetches all rows and filters client-side).
CREATE INDEX IF NOT EXISTS idx_nexus_jobs_created_at ON nexus_jobs (created_at DESC);

-- Row Level Security ----------------------------------------------------------
-- The dashboard sits behind the auth proxy (see src/proxy.ts), so every
-- read/write of this table happens in an authenticated session. Keep the
-- policies permissive across authenticated users — matching the wallet-based
-- identity model (jobs are keyed by provider address, not by auth.uid()).
ALTER TABLE nexus_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read jobs" ON nexus_jobs;
CREATE POLICY "Authenticated users can read jobs"
  ON nexus_jobs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create jobs" ON nexus_jobs;
CREATE POLICY "Authenticated users can create jobs"
  ON nexus_jobs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update jobs" ON nexus_jobs;
CREATE POLICY "Authenticated users can update jobs"
  ON nexus_jobs FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON nexus_jobs;
CREATE POLICY "Authenticated users can delete jobs"
  ON nexus_jobs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Reload PostgREST's schema cache so the REST API / supabase-js sees new
-- columns immediately (fixes: "Could not find the '<column>' column of
-- 'nexus_jobs' in the schema cache"). No-op when the schema didn't change.
NOTIFY pgrst, 'reload schema';
