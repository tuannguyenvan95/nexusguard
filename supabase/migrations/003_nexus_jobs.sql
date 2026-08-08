-- =============================================================================
-- 003_nexus_jobs.sql
-- -----------------------------------------------------------------------------
-- The dashboard job flow (create / list / detail / apply / submit / validate /
-- dispute / delete) reads and writes the `nexus_jobs` table, which was created
-- by hand in the Supabase dashboard during development and never captured in a
-- migration. This file makes a fresh Supabase setup reproducible end-to-end.
--
-- NOTE: `nexus_jobs` intentionally differs from the `jobs` table defined in
-- 001_initial_schema.sql. The UI stores contracts keyed by a short text id
-- (e.g. `job_48162`, generated client-side) with denormalized display fields
-- (`amount`, `provider`, `date`, ...) instead of the on-chain/team model used
-- by `jobs`. Both tables coexist:
--   - `jobs`        -> agent libs + GET /api/jobs
--   - `nexus_jobs`  -> every dashboard page and the jobs API routes
--
-- Column notes:
--   - `applicant` is TEXT holding a JSON string[] (e.g. '["0x123..."]').
--     The job detail page parses it with JSON.parse(), which breaks when
--     PostgREST already returns a parsed jsonb array, so keep it TEXT.
--   - `requirements` / `milestones` / `deliverables` / `payout_txs` /
--     `ai_reports` are JSONB. Inserts send JSON.stringify() strings, which
--     Postgres casts to jsonb; reads return parsed values that the app's
--     `typeof === 'string' ? JSON.parse(x) : x` pattern handles fine.
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

-- The only SQL-level filter the app uses on this table is the created_at
-- ordering (every page fetches all rows and filters client-side).
CREATE INDEX IF NOT EXISTS idx_nexus_jobs_created_at ON nexus_jobs (created_at DESC);

-- Row Level Security ----------------------------------------------------------
-- The dashboard sits behind the auth proxy (see src/proxy.ts), so every
-- read/write of this table happens in an authenticated session. Keep the
-- policies permissive across authenticated users — matching the wallet-based
-- identity model of the demo (jobs are keyed by provider address, not by
-- auth.uid()).
ALTER TABLE nexus_jobs ENABLE ROW LEVEL SECURITY;

-- DROP guards keep the migration re-runnable (e.g. `supabase db push` onto a
-- project where nexus_jobs was already created by hand with these names).
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
