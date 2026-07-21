import { createClient } from '@/lib/supabase/server';
import type { AgentType, AgentAction } from '@/types/database';

export interface AgentContext {
  teamId: string;
  jobId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  txHash?: string;
}

export abstract class BaseAgent {
  name: string;
  type: AgentType;
  walletAddress?: string;
  walletId?: string;

  constructor(name: string, type: AgentType) {
    this.name = name;
    this.type = type;
  }

  /** Execute the agent's main logic */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /** Log an action to the database */
  protected async logAction(
    actionType: string,
    jobId?: string,
    details?: Record<string, unknown>,
    txHash?: string
  ): Promise<void> {
    try {
      const supabase = await createClient();
      // First get or create agent record
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('agent_type', this.type)
        .single();

      if (agent) {
        await supabase.from('agent_actions').insert({
          agent_id: agent.id,
          action_type: actionType,
          job_id: jobId || null,
          details: details || {},
          tx_hash: txHash || null,
        });
      }
    } catch (error) {
      console.error(`[${this.name}] Failed to log action:`, error);
    }
  }

  /** Get agent status info */
  async getStatus(): Promise<{ status: string; lastAction?: string }> {
    try {
      const supabase = await createClient();
      const { data: agent } = await supabase
        .from('agents')
        .select('id, status')
        .eq('agent_type', this.type)
        .single();

      const { data: lastAction } = await supabase
        .from('agent_actions')
        .select('created_at')
        .eq('agent_id', agent?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        status: agent?.status || 'idle',
        lastAction: lastAction?.created_at,
      };
    } catch {
      return { status: 'idle' };
    }
  }
}
