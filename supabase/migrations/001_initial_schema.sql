-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treasury_wallet_address TEXT,
  treasury_wallet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
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

-- Jobs
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

-- Agents
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

-- Agent Actions
CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  amount_usdc DECIMAL(20,6) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(20,6) DEFAULT 0,
  total DECIMAL(20,6) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid')),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('VN','US')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury Transactions
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_team ON jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_job ON agent_actions(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_team ON invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_treasury_team ON treasury_transactions(team_id);

-- Seed default agents
INSERT INTO agents (name, agent_type, status) VALUES
  ('NexusGuard Guardian', 'guardian', 'active'),
  ('NexusGuard Escrow', 'escrow', 'active'),
  ('NexusGuard Validator', 'validator', 'active'),
  ('NexusGuard Treasury', 'treasury', 'active'),
  ('NexusGuard Compliance', 'compliance', 'active')
ON CONFLICT (agent_type) DO NOTHING;

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;

-- Policies (simplified for MVP - team members can read/write their team's data)
CREATE POLICY "Users can read own teams" ON teams FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Members can read team" ON team_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Anyone can read agent actions" ON agent_actions FOR SELECT USING (true);
