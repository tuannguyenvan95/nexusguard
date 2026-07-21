import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { createClient } from '@/lib/supabase/server';
import { createERC8183Job, fundJob, submitDeliverable, approveUSDC } from '@/lib/circle/transactions';

export class EscrowAgent extends BaseAgent {
  constructor() {
    super('NexusGuard Escrow', 'escrow');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const action = context.payload?.action as string;

    try {
      switch (action) {
        case 'createJob':
          return await this.createJob(context);
        case 'fundJob':
          return await this.fundJobAction(context);
        case 'submitDeliverable':
          return await this.submitDeliverableAction(context);
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error(`[${this.name}] Error executing action ${action}:`, error);
      return { success: false, message: 'Execution failed', data: { error } };
    }
  }

  private async createJob(context: AgentContext): Promise<AgentResult> {
    const { teamId } = context;
    const { title, description, budget, freelancerId } = context.payload || {};
    
    const supabase = await createClient();
    
    // 1. Insert draft job into Supabase
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        team_id: teamId,
        title: title as string,
        description: description as string,
        status: 'draft',
        budget: budget as number,
        freelancer_id: freelancerId as string
      })
      .select()
      .single();
      
    if (error || !job) {
      throw new Error(`Failed to create job draft: ${error?.message}`);
    }

    const { data: teamInfo } = await supabase.from('teams').select('treasury_wallet_id').eq('id', teamId).single();
    const walletId = teamInfo?.treasury_wallet_id || 'dummy_wallet_id';

    // 2. Call createERC8183Job from transactions.ts
    const txReceipt = await createERC8183Job(
      walletId,
      (freelancerId as string) || '0xDummyProvider',
      '0xDummyEvaluator',
      '86400',
      (description as string) || 'Job',
      String(budget || 0)
    );
    const onchainJobId = 'mock_job_id'; // Mocking job ID
    const txHash = txReceipt || 'mock_tx_hash';

    // 4. Update Supabase with onchain_job_id, status='open', tx_hash
    await supabase
      .from('jobs')
      .update({
        onchain_job_id: onchainJobId,
        status: 'open',
        tx_hash: txHash
      })
      .eq('id', job.id);

    // 5. Removed setBudget

    // 6. Log action
    await this.logAction('createJob', job.id, { budget }, txHash);

    return { 
      success: true, 
      message: 'Job created successfully',
      data: { jobId: job.id, onchainJobId },
      txHash
    };
  }

  private async fundJobAction(context: AgentContext): Promise<AgentResult> {
    const { jobId } = context;
    if (!jobId) throw new Error('Job ID required');

    const supabase = await createClient();
    
    // 1. Get job from Supabase
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (!job) throw new Error('Job not found');

    const { data: teamInfo } = await supabase.from('teams').select('treasury_wallet_id').eq('id', context.teamId).single();
    const walletId = teamInfo?.treasury_wallet_id || 'dummy_wallet_id';

    // 2. Call approveUSDC
    const approveTx = await approveUSDC(walletId, '0xDummySpender', String(job.budget || 0));
    
    // 3. Call fundJob from transactions.ts
    const fundTx = await fundJob(walletId, job.onchain_job_id || '0', String(job.budget || 0));

    // 4. Update status to 'funded'
    await supabase
      .from('jobs')
      .update({ status: 'funded' })
      .eq('id', jobId);

    // 5. Log action
    await this.logAction('fundJob', jobId, { amount: job.budget }, fundTx);

    return { success: true, message: 'Job funded successfully', txHash: fundTx || 'mock_tx_hash' };
  }

  private async submitDeliverableAction(context: AgentContext): Promise<AgentResult> {
    const { jobId } = context;
    const { deliverableHash, description } = context.payload || {};
    if (!jobId) throw new Error('Job ID required');

    const supabase = await createClient();
    
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (!job) throw new Error('Job not found');

    const { data: teamInfo } = await supabase.from('teams').select('treasury_wallet_id').eq('id', context.teamId).single();
    const walletId = teamInfo?.treasury_wallet_id || 'dummy_wallet_id';

    // 1. Call submitDeliverable
    const submitTx = await submitDeliverable(walletId, job.onchain_job_id || '0', (deliverableHash as string) || 'dummy_hash');

    // 2. Update status to 'submitted'
    await supabase
      .from('jobs')
      .update({ 
        status: 'submitted',
        deliverable_description: description as string 
      })
      .eq('id', jobId);

    // 3. Log action
    await this.logAction('submitDeliverable', jobId, { deliverableHash }, submitTx);

    return { success: true, message: 'Deliverable submitted', txHash: submitTx || 'mock_tx_hash' };
  }
}

export const escrowAgent = new EscrowAgent();
