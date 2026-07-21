import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { escrowAgent } from '@/lib/agents/escrow';
import { validatorAgent } from '@/lib/agents/validator';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    
    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, payload, teamId } = await request.json();
    
    if (!action || !teamId) {
      return NextResponse.json({ error: 'Missing action or teamId' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'fund':
      case 'submit':
      case 'complete':
        result = await escrowAgent.execute({ teamId, jobId: id, payload: { action, ...payload } });
        break;
      case 'validate':
        result = await validatorAgent.execute({ teamId, jobId: id, payload: { action: 'validate', ...payload } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
