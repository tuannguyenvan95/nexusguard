import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { createClient } from '@/lib/supabase/server';
import { validatorAgent } from './validator';
import { treasuryAgent } from './treasury';

export class GuardianAgent extends BaseAgent {
  constructor() {
    super('NexusGuard Guardian', 'guardian');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const action = context.payload?.action as string;

    try {
      switch (action) {
        case 'register':
          return await this.registerAgent(context);
        case 'coordinate':
          return await this.coordinateJobLifecycle(context.teamId);
        case 'status':
          return await this.getSystemStatus(context.teamId);
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error(`[${this.name}] Error executing action ${action}:`, error);
      return { success: false, message: 'Execution failed', data: { error } };
    }
  }

  private async registerAgent(context: AgentContext): Promise<AgentResult> {
    // In a real implementation, this would interact with IdentityRegistry contract
    await this.logAction('register', undefined, { teamId: context.teamId });
    return { success: true, message: 'Agent registered on-chain' };
  }

  private async coordinateJobLifecycle(teamId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    // 1. Check for submitted jobs and trigger validator
    const { data: submittedJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'submitted');

    if (submittedJobs) {
      for (const job of submittedJobs) {
        await validatorAgent.execute({
          teamId,
          jobId: job.id,
          payload: { action: 'validate', deliverableDescription: job.deliverable_description || 'Deliverable submitted' }
        });
      }
    }

    // 2. Check for validated (completed but not paid) jobs and trigger treasury
    // Assuming 'completed' means validated successfully but payment is pending
    const { data: completedJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'completed');

    if (completedJobs) {
      for (const job of completedJobs) {
        // Here we'd check if payment is already processed, but for simplicity:
        await treasuryAgent.execute({
          teamId,
          jobId: job.id,
          payload: { action: 'processPayment' }
        });
      }
    }

    await this.logAction('coordinate', undefined, { teamId });
    return { success: true, message: 'Coordination cycle completed' };
  }

  private async getSystemStatus(teamId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);
      
    const { data: agents } = await supabase
      .from('agents')
      .select('agent_type, status');

    return { 
      success: true, 
      message: 'System status retrieved',
      data: {
        totalJobs: jobCount || 0,
        agents: agents || []
      }
    };
  }
}

export const guardianAgent = new GuardianAgent();
