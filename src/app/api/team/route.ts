import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createTeamWalletSet, createWallet } from '@/lib/circle/wallets';

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();
    
    if (!name || !userId) {
      return NextResponse.json({ error: 'Missing name or userId' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Create wallet set and wallet
    const walletSet = await createTeamWalletSet(`team-${Date.now()}`);
    const walletSetId = walletSet?.walletSet?.id || (walletSet as any)?.id;
    if (!walletSetId) throw new Error('Failed to create wallet set');
    const wallet = await createWallet(walletSetId);

    // Create team in Supabase
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        owner_id: userId,
        treasury_wallet_address: wallet.address,
        treasury_wallet_id: wallet.id
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add owner as admin member
    await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'admin',
        // owner gets their own wallet in the team wallet set ideally
      });

    return NextResponse.json(team);
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
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (*)
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;
    
    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
