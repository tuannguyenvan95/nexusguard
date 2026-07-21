import { NextResponse } from 'next/server';
import { validatorAgent } from '@/lib/agents/validator';

export async function POST(request: Request) {
  try {
    const { teamId, jobId, deliverableDescription, deliverableUrl } = await request.json();
    
    if (!teamId || !jobId || !deliverableDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await validatorAgent.execute({ 
      teamId, 
      jobId, 
      payload: { action: 'validate', deliverableDescription, deliverableUrl }
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
