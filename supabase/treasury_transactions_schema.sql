-- =============================================================================
-- treasury_transactions schema — standalone, shareable setup script
-- -----------------------------------------------------------------------------
-- Reproduces the `treasury_transactions` table (the USDC ledger written by
-- /api/wallets/transfer and read by the treasury dashboard) on any Supabase
-- project. Canonical DDL: supabase/migrations/001_initial_schema.sql +
-- 002_treasury_insert_policy.sql
--
-- Usage:
--   1. Supabase Dashboard -> SQL Editor -> paste the whole file -> Run, OR
--   2. CLI:  psql "$DATABASE_URL" -f supabase/treasury_transactions_schema.sql
--
-- Idempotent: every statement is guarded with IF NOT EXISTS (or DROP-then-
-- CREATE for policies), so re-running is always safe. `teams` is included as
-- a prerequisite below because `treasury_transactions.team_id` references it.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PREREQUISITE: teams ----------------------------------------------------------
-- treasury_transactions.team_id references teams(id). This section is a copy
-- of the canonical DDL in 001_initial_schema.sql and is a no-op when teams
-- already exists.
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treasury_wallet_address TEXT,
  treasury_wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'contractor')),
  wallet_address TEXT,
  wallet_id TEXT,
  reputation_score INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own teams" ON teams;
CREATE POLICY "Users can read own teams" ON teams FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Members can read team" ON team_members;
CREATE POLICY "Members can read team" ON team_members FOR SELECT USING (user_id = auth.uid());

-- Treasury Transactions -------------------------------------------------------
CREATE TABLE IF NOT EXISTS treasury_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','payment','yield')),
  amount_usdc DECIMAL(20,6) NOT NULL,
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasury_team ON treasury_transactions(team_id);

-- Row Level Security ----------------------------------------------------------
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;

-- INSERT policy from 002_treasury_insert_policy.sql — teams may record their
-- own treasury ledger entries. (No SELECT policy is defined in the
-- migrations; reads go through the server-side client / service role.)
DROP POLICY IF EXISTS "Members can insert treasury transactions" ON treasury_transactions;
CREATE POLICY "Members can insert treasury transactions"
  ON treasury_transactions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM teams WHERE owner_id = auth.uid()
    )
  );

-- Reload PostgREST's schema cache so the REST API / supabase-js sees the
-- table immediately (fixes: "Could not find the table 'public.treasury_transactions'
-- in the schema cache" on freshly created or newly migrated tables).
NOTIFY pgrst, 'reload schema';
