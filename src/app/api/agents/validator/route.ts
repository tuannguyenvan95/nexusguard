import { NextResponse } from 'next/server';
import { validatorAgent } from '@/lib/agents/validator';
import { getErrorMessage } from '@/lib/utils';

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
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
