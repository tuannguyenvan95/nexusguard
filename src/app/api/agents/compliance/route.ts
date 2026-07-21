import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { complianceAgent } from '@/lib/agents/compliance';

export async function POST(request: Request) {
  try {
    const { teamId, action, jobId, jurisdiction, year } = await request.json();
    
    if (!teamId || !action) {
      return NextResponse.json({ error: 'Missing teamId or action' }, { status: 400 });
    }

    const result = await complianceAgent.execute({ teamId, jobId, payload: { action, jurisdiction, year } });
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
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    return NextResponse.json(invoices || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
