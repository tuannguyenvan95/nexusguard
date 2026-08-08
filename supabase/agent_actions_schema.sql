-- =============================================================================
-- agent_actions schema — standalone, shareable setup script
-- -----------------------------------------------------------------------------
-- Reproduces the `agent_actions` table (the action ledger written by the
-- agent libs, e.g. src/lib/agents/base-agent.ts) on any Supabase project,
-- together with its prerequisites `agents` (FK agent_id) and `jobs` (FK
-- job_id). Canonical DDL: supabase/migrations/001_initial_schema.sql
--
-- Usage:
--   1. Supabase Dashboard -> SQL Editor -> paste the whole file -> Run, OR
--   2. CLI:  psql "$DATABASE_URL" -f supabase/agent_actions_schema.sql
--
-- Idempotent: every statement is guarded with IF NOT EXISTS (or DROP-then-
-- CREATE for policies), so re-running is always safe.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PREREQUISITE: teams ----------------------------------------------------------
-- Pulled in transitively via jobs.team_id. Copy of 001_initial_schema.sql.
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

-- PREREQUISITE: jobs -----------------------------------------------------------
-- agent_actions.job_id references jobs(id). Copy of 001_initial_schema.sql
-- (including its indexes).
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

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- PREREQUISITE: agents ---------------------------------------------------------
-- agent_actions.agent_id references agents(id). Includes the default agent
-- seed. Copy of 001_initial_schema.sql.
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onchain_agent_id BIGINT,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('guardian','escrow','validator','treasury','compliance')),
  wallet_address TEXT,
  wallet_id TEXT,
  metadata_uri TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','idle','error')),
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_type)
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read agents" ON agents;
CREATE POLICY "Anyone can read agents" ON agents FOR SELECT USING (true);

-- Seed default agents (idempotent via ON CONFLICT on the unique agent_type)
INSERT INTO agents (name, agent_type, status) VALUES
  ('NexusGuard Guardian', 'guardian', 'active'),
  ('NexusGuard Escrow', 'escrow', 'active'),
  ('NexusGuard Validator', 'validator', 'active'),
  ('NexusGuard Treasury', 'treasury', 'active'),
  ('NexusGuard Compliance', 'compliance', 'active')
ON CONFLICT (agent_type) DO NOTHING;

-- Agent Actions ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_job ON agent_actions(job_id);

-- Row Level Security ----------------------------------------------------------
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read agent actions" ON agent_actions;
CREATE POLICY "Anyone can read agent actions" ON agent_actions FOR SELECT USING (true);

-- Reload PostgREST's schema cache so the REST API / supabase-js sees the
-- tables immediately (fixes: "Could not find the table 'public.agent_actions'
-- in the schema cache" on freshly created or newly migrated tables).
NOTIFY pgrst, 'reload schema';
