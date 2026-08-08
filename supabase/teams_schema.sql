-- =============================================================================
-- teams schema — standalone, shareable setup script
-- -----------------------------------------------------------------------------
-- Reproduces the `teams` table (plus its companion `team_members` table) on
-- any Supabase project. Canonical DDL: supabase/migrations/001_initial_schema.sql
--
-- Usage:
--   1. Supabase Dashboard -> SQL Editor -> paste the whole file -> Run, OR
--   2. CLI:  psql "$DATABASE_URL" -f supabase/teams_schema.sql
--
-- Idempotent: every statement is guarded with IF NOT EXISTS (or DROP-then-
-- CREATE for policies), so re-running is always safe.
--
-- Used by: dashboard team pages, /api/team and /api/team/invite routes.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treasury_wallet_address TEXT,
  treasury_wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (companion table — members belong to a team) -------------------
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

-- Row Level Security ----------------------------------------------------------
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own teams" ON teams;
CREATE POLICY "Users can read own teams" ON teams FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Members can read team" ON team_members;
CREATE POLICY "Members can read team" ON team_members FOR SELECT USING (user_id = auth.uid());

-- Reload PostgREST's schema cache so the REST API / supabase-js sees the
-- tables immediately (fixes: "Could not find the table 'public.teams' in the
-- schema cache" on freshly created or newly migrated tables).
NOTIFY pgrst, 'reload schema';
