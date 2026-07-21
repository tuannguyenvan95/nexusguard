import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { createClient } from '@/lib/supabase/server';
// Assuming circle/wallets.ts or equivalent exports getUSDCBalance
// Alternatively, this can interact with a read helper in arc/contracts.ts
import { getWalletBalance } from '@/lib/circle/wallets'; 

export class TreasuryAgent extends BaseAgent {
  constructor() {
    super('NexusGuard Treasury', 'treasury');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const action = context.payload?.action as string;

    try {
      switch (action) {
        case 'getBalance':
          return await this.getTeamBalance(context.teamId);
        case 'processPayment':
          if (!context.jobId) throw new Error('Job ID required');
          return await this.processPayment(context.jobId);
        case 'getHistory':
          return await this.getTransactionHistory(context.teamId);
        case 'getStats':
          return await this.getDashboardStats(context.teamId);
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error(`[${this.name}] Error executing action ${action}:`, error);
      return { success: false, message: 'Execution failed', data: { error } };
    }
  }

  private async getTeamBalance(teamId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    // 1. Get team from Supabase
    const { data: team } = await supabase
      .from('teams')
      .select('treasury_wallet_id')
      .eq('id', teamId)
      .single();

    if (!team?.treasury_wallet_id) throw new Error('Team wallet not found');

    let balance: string | number = 0;
    try {
      // 2. Get USDC balance via Circle wallets
      balance = await getWalletBalance(team.treasury_wallet_id);
    } catch (err) {
      console.warn('Failed to fetch balance, using fallback 0:', err);
    }

    // 3. Return balance
    return { success: true, message: 'Balance retrieved', data: { balance } };
  }

  private async processPayment(jobId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    // 1. Get job from Supabase
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) throw new Error('Job not found');

    // 2. Record treasury_transaction
    const { data: tx } = await supabase
      .from('treasury_transactions')
      .insert({
        team_id: job.team_id,
        job_id: job.id,
        amount: job.budget,
        type: 'payment',
        status: 'completed'
      })
      .select()
      .single();

    // 3. Log action
    await this.logAction('processPayment', jobId, { amount: job.budget, txId: tx?.id });

    return { success: true, message: 'Payment processed', data: { transaction: tx } };
  }

  private async getTransactionHistory(teamId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    const { data: transactions } = await supabase
      .from('treasury_transactions')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    return { success: true, message: 'History retrieved', data: { transactions } };
  }

  private async getDashboardStats(teamId: string): Promise<AgentResult> {
    const balanceRes = await this.getTeamBalance(teamId);
    const balance = balanceRes.data?.balance || 0;

    const supabase = await createClient();
    
    const { count: activeJobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .in('status', ['open', 'funded', 'submitted']);

    const { count: completedJobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'completed');

    const { data: payments } = await supabase
      .from('treasury_transactions')
      .select('amount')
      .eq('team_id', teamId)
      .eq('type', 'payment')
      .eq('status', 'completed');

    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return {
      success: true,
      message: 'Stats retrieved',
      data: {
        balance,
        activeJobs: activeJobsCount || 0,
        completedJobs: completedJobsCount || 0,
        totalPaid
      }
    };
  }
}

export const treasuryAgent = new TreasuryAgent();
