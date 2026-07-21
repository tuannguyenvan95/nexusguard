import { NextResponse } from 'next/server';
import { createTeamWalletSet, createWallet, getWalletBalance } from '@/lib/circle/wallets';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { teamId, type, userId } = await request.json();
    const supabase = await createClient();

    if (!teamId || !type) {
      return NextResponse.json({ error: 'Missing teamId or type' }, { status: 400 });
    }

    if (type === 'team') {
      const walletSet = await createTeamWalletSet(teamId);
      const walletSetId = walletSet?.walletSet?.id || (walletSet as any)?.id;
      if (!walletSetId) throw new Error('Failed to create wallet set');
      const wallet = await createWallet(walletSetId);
      
      await supabase
        .from('teams')
        .update({ treasury_wallet_address: wallet.address, treasury_wallet_id: wallet.id })
        .eq('id', teamId);
        
      return NextResponse.json({ address: wallet.address, id: wallet.id });
    } else if (type === 'member') {
      if (!userId) return NextResponse.json({ error: 'userId required for member wallet' }, { status: 400 });
      
      const { data: team } = await supabase.from('teams').select('treasury_wallet_id').eq('id', teamId).single();
      if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      
      const wallet = await createWallet(team.treasury_wallet_id); // Assuming member wallets share the team's wallet set
      
      await supabase
        .from('team_members')
        .update({ wallet_address: wallet.address, wallet_id: wallet.id })
        .eq('team_id', teamId)
        .eq('user_id', userId);
        
      return NextResponse.json({ address: wallet.address, id: wallet.id });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    }

    const balance = await getWalletBalance(walletId);
    return NextResponse.json({ balance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
