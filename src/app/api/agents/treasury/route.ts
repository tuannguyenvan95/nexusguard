import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { treasuryAgent } from '@/lib/agents/treasury';

export async function POST(request: Request) {
  try {
    const { teamId, action, jobId, payload } = await request.json();
    
    if (!teamId || !action) {
      return NextResponse.json({ error: 'Missing teamId or action' }, { status: 400 });
    }

    const result = await treasuryAgent.execute({ teamId, jobId, payload: { action, ...payload } });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // In a real implementation, you would fetch balance from Circle and aggregate stats
    const { data: team } = await supabase.from('teams').select('treasury_wallet_id').eq('id', teamId).single();
    
    const { data: transactions } = await supabase
      .from('treasury_transactions')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    // Mock response for stats
    return NextResponse.json({
      balance: 0, // Get from circle
      totalPaid: 0,
      activeJobs: 0,
      completedJobs: 0,
      transactions: transactions || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
