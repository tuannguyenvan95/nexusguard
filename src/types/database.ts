export type AgentType = 'guardian' | 'escrow' | 'validator' | 'treasury' | 'compliance';

export type JobStatus = 'draft' | 'open' | 'funded' | 'submitted' | 'completed' | 'rejected' | 'expired';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  treasury_wallet_address?: string;
  treasury_wallet_id?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'contractor';
  wallet_address?: string;
  wallet_id?: string;
  reputation_score: number;
  joined_at: string;
  // Joined fields
  email?: string;
  display_name?: string;
}

export interface Job {
  id: string;
  onchain_job_id?: number;
  team_id: string;
  title: string;
  description?: string;
  client_address?: string;
  provider_address?: string;
  provider_user_id?: string;
  evaluator_address?: string;
  budget_usdc?: number;
  status: JobStatus;
  milestones: Milestone[];
  deliverable_hash?: string;
  tx_hash?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  provider_name?: string;
}

export interface Milestone {
  name: string;
  percentage: number;
  completed: boolean;
}

export interface Agent {
  id: string;
  onchain_agent_id?: number;
  name: string;
  agent_type: AgentType;
  wallet_address?: string;
  wallet_id?: string;
  metadata_uri?: string;
  status: 'active' | 'idle' | 'error';
  reputation_score: number;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agent_id: string;
  action_type: string;
  job_id?: string;
  details?: Record<string, unknown>;
  tx_hash?: string;
  created_at: string;
  // Joined
  agent_name?: string;
  agent_type?: AgentType;
}

export interface Invoice {
  id: string;
  job_id: string;
  team_id: string;
  invoice_number: string;
  from_name: string;
  to_name: string;
  amount_usdc: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  jurisdiction: 'VN' | 'US';
  pdf_url?: string;
  created_at: string;
}

export interface TreasuryTransaction {
  id: string;
  team_id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'yield';
  amount_usdc: number;
  from_address?: string;
  to_address?: string;
  tx_hash?: string;
  description?: string;
  created_at: string;
}
