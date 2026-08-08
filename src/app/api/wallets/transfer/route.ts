import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transferUSDC } from '@/lib/circle/wallets';
import { getErrorMessage } from '@/lib/utils';

/**
 * POST /api/wallets/transfer
 *
 * Executes a USDC transfer from the team's Circle treasury wallet to an
 * arbitrary destination address. Circle credentials are server-side only,
 * so the transfer itself always happens here — never in the browser.
 *
 * Body: { teamId, toAddress, amount }   (amount is a decimal string, e.g. "25.5")
 */
export async function POST(request: Request) {
  try {
    const { teamId, toAddress, amount } = await request.json();

    const numericAmount = Number(amount);
    if (!teamId || !toAddress || !amount || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Missing teamId, toAddress or a valid amount' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Resolve the source Circle wallet. RLS limits the lookup to teams the
    // signed-in user owns, so users cannot spend another team's treasury.
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('treasury_wallet_id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or not owned by this user' },
        { status: 404 }
      );
    }

    const walletId = team.treasury_wallet_id;
    if (!walletId) {
      return NextResponse.json(
        { error: 'No Circle treasury wallet configured for this team. Create a team wallet first.' },
        { status: 400 }
      );
    }

    // Execute the on-chain USDC transfer via Circle (waits for confirmation).
    const txHash = await transferUSDC(walletId, toAddress, amount);

    // Record the deposit in the treasury ledger (best-effort — never fails the request).
    const { error: ledgerError } = await supabase.from('treasury_transactions').insert({
      team_id: teamId,
      type: 'deposit',
      amount_usdc: numericAmount,
      to_address: toAddress,
      tx_hash: txHash,
      description: 'Escrow deposit via Circle',
    });
    if (ledgerError) {
      console.warn('Failed to record treasury ledger entry:', ledgerError.message);
    }

    return NextResponse.json({ success: true, txHash });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
