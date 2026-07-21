import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { escrowAgent } from '@/lib/agents/escrow';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    let query = supabase.from('jobs').select('*').eq('team_id', teamId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: jobs, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(jobs || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { teamId, title, description, providerUserId, budgetUSDC, expiryHours, milestones } = await request.json();
    
    if (!teamId || !title || !budgetUSDC) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delegate creation to escrow agent
    const result = await escrowAgent.execute({
      teamId,
      payload: {
        action: 'createJob',
        title,
        description,
        providerUserId,
        budgetUSDC,
        expiryHours,
        milestones
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
