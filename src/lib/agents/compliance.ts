import { BaseAgent, AgentContext, AgentResult } from './base-agent';
import { createClient } from '@/lib/supabase/server';

export class ComplianceAgent extends BaseAgent {
  constructor() {
    super('NexusGuard Compliance', 'compliance');
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const action = context.payload?.action as string;

    try {
      switch (action) {
        case 'generateInvoice':
          if (!context.jobId) throw new Error('Job ID required');
          return await this.generateInvoice(
            context.jobId, 
            context.payload?.jurisdiction as 'VN' | 'US' || 'US'
          );
        case 'getInvoices':
          return await this.getInvoices(context.teamId);
        case 'getTaxSummary':
          return await this.getTaxSummary(
            context.teamId, 
            context.payload?.year as number || new Date().getFullYear()
          );
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error(`[${this.name}] Error executing action ${action}:`, error);
      return { success: false, message: 'Execution failed', data: { error } };
    }
  }

  private async generateInvoice(jobId: string, jurisdiction: 'VN' | 'US'): Promise<AgentResult> {
    const supabase = await createClient();
    
    // 1. Get job details
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) throw new Error('Job not found');

    // 2. Calculate tax
    let taxRate = 0;
    if (jurisdiction === 'VN') {
      taxRate = 0.10; // 10% VAT
    } else if (jurisdiction === 'US') {
      taxRate = 0; // Simplified for crypto
    }

    const amount = Number(job.budget);
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;

    // 3. Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // 4. Insert invoice into Supabase
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        team_id: job.team_id,
        job_id: job.id,
        invoice_number: invoiceNumber,
        jurisdiction,
        subtotal: amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: totalAmount,
        status: 'issued'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create invoice: ${error.message}`);

    // 5. Log action
    await this.logAction('generateInvoice', jobId, { invoiceNumber, jurisdiction, totalAmount });

    // 6. Return invoice
    return { success: true, message: 'Invoice generated', data: { invoice } };
  }

  private async getInvoices(teamId: string): Promise<AgentResult> {
    const supabase = await createClient();
    
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    return { success: true, message: 'Invoices retrieved', data: { invoices } };
  }

  private async getTaxSummary(teamId: string, year: number): Promise<AgentResult> {
    const supabase = await createClient();
    
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;

    // 1. Aggregate invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('team_id', teamId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!invoices) return { success: true, message: 'No invoices found', data: { summary: {} } };

    // 2. Calculate totals by jurisdiction
    const summary = invoices.reduce((acc: any, inv: any) => {
      const jur = inv.jurisdiction;
      if (!acc[jur]) {
        acc[jur] = { totalRevenue: 0, totalTax: 0, count: 0 };
      }
      acc[jur].totalRevenue += Number(inv.subtotal);
      acc[jur].totalTax += Number(inv.tax_amount);
      acc[jur].count += 1;
      return acc;
    }, {});

    const overall = {
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0),
      totalTax: invoices.reduce((sum, inv) => sum + Number(inv.tax_amount), 0),
      totalInvoices: invoices.length
    };

    // 3. Return summary
    return { 
      success: true, 
      message: 'Tax summary generated', 
      data: { year, overall, byJurisdiction: summary } 
    };
  }
}

export const complianceAgent = new ComplianceAgent();
