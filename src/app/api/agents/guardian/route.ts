import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { guardianAgent } from '@/lib/agents/guardian';

export async function POST(request: Request) {
  try {
    const { teamId, action, payload } = await request.json();
    
    if (!teamId || !action) {
      return NextResponse.json({ error: 'Missing teamId or action' }, { status: 400 });
    }

    const result = await guardianAgent.execute({ teamId, payload: { action, ...payload } });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('agent_type', 'guardian')
      .single();

    if (!agent) {
      return NextResponse.json({ error: 'Guardian agent not found' }, { status: 404 });
    }

    const { data: lastAction } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ status: agent.status, lastAction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
