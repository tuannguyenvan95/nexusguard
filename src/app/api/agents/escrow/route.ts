import { NextResponse } from 'next/server';
import { escrowAgent } from '@/lib/agents/escrow';

export async function POST(request: Request) {
  try {
    const { teamId, action, jobId, payload } = await request.json();
    
    if (!teamId || !action) {
      return NextResponse.json({ error: 'Missing teamId or action' }, { status: 400 });
    }

    const result = await escrowAgent.execute({ teamId, jobId, payload: { action, ...payload } });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
