import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { createClient } from '@/lib/supabase/server';
import { completeJob, rejectJob, giveFeedback } from '@/lib/circle/transactions';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export class ValidatorAgent extends BaseAgent {
  constructor() {
    super('NexusGuard Validator', 'validator');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const action = context.payload?.action as string;

    if (action === 'validate') {
      const { deliverableDescription, deliverableUrl } = context.payload || {};
      return await this.validateDeliverable(
        context.jobId!,
        deliverableDescription as string,
        deliverableUrl as string
      );
    }

    return { success: false, message: `Unknown action: ${action}` };
  }

  private async validateDeliverable(
    jobId: string, 
    deliverableDescription: string, 
    deliverableUrl?: string
  ): Promise<AgentResult> {
    const supabase = await createClient();
    
    // 1. Get job details from Supabase
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (!job) throw new Error('Job not found');

    let score = 85;
    let feedback = "Mock validation passed.";
    let breakdown = { completeness: 20, quality: 20, standards: 20, requirements: 25 };

    if (openai) {
      try {
        // 2. Call OpenAI with structured prompt
        const prompt = `You are a deliverable validator for a freelance job platform.
        Job: ${job.title}
        Description: ${job.description}
        Deliverable: ${deliverableDescription}
        Deliverable URL: ${deliverableUrl || 'None'}
        
        Score this deliverable 0-100 based on:
        - Completeness (0-25)
        - Quality (0-25)
        - Professional standards (0-25)
        - Meets requirements (0-25)
        
        Respond with JSON: { "score": number, "feedback": "string", "breakdown": { "completeness": number, "quality": number, "standards": number, "requirements": number } }`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message?.content || '{}');
        score = result.score || score;
        feedback = result.feedback || feedback;
        breakdown = result.breakdown || breakdown;
      } catch (err) {
        console.error('LLM Validation failed, falling back to mock:', err);
      }
    }

    const passed = score >= 70;
    let txHash = '';

    const { data: teamInfo } = await supabase.from('teams').select('treasury_wallet_id').eq('id', job.team_id).single();
    const walletId = teamInfo?.treasury_wallet_id || 'dummy_wallet_id';

    if (passed) {
      // 4. If score >= 70: call completeJob, update status
      const completeTx = await completeJob(walletId, job.onchain_job_id || '0', 'Mock validation passed');
      txHash = completeTx || 'mock_tx_hash';
      await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId);
    } else {
      // 5. If score < 70: call rejectJob, update status
      const rejectTx = await rejectJob(walletId, job.onchain_job_id || '0', 'Mock validation failed');
      txHash = rejectTx || 'mock_tx_hash';
      await supabase.from('jobs').update({ status: 'rejected' }).eq('id', jobId);
    }

    // 6. Record reputation via giveFeedback
    await giveFeedback(walletId, '0', String(score), 'validation');

    // 7. Log action with validation details
    await this.logAction('validate', jobId, { score, feedback, breakdown, passed }, txHash);

    // 8. Return result
    return {
      success: true,
      message: passed ? 'Validation passed' : 'Validation failed',
      data: { score, feedback, passed, breakdown },
      txHash
    };
  }
}

export const validatorAgent = new ValidatorAgent();
