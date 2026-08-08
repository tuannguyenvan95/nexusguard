import { getCircleClient, waitForTransaction } from './client';
import { USDC_ADDRESS } from '../constants';

export async function createTeamWalletSet(teamName: string) {
  const client = getCircleClient();
  const res = await client.createWalletSet({
    name: teamName,
  });
  return res.data;
}

export async function createWallet(walletSetId: string) {
  const client = getCircleClient();
  const res = await client.createWallets({
    walletSetId,
    blockchains: ['ARC-TESTNET'],
    accountType: 'SCA',
    count: 1
  });
  
  const wallet = res.data?.wallets?.[0];
  if (!wallet) throw new Error('Failed to create wallet');
  
  return {
    address: wallet.address,
    id: wallet.id
  };
}

export async function getWalletBalance(walletId: string): Promise<string> {
  const client = getCircleClient();
  const res = await client.getWalletTokenBalance({
    id: walletId,
  });
  
  // Assuming we want USDC balance. You might need to filter by token address in reality.
  const usdcBalance = res.data?.tokenBalances?.find(t => t.token.symbol === 'USDC');
  return usdcBalance?.amount ?? '0';
}

/**
 * Transfer USDC from a developer-controlled wallet to any address.
 *
 * Uses Circle's `createTransaction` API (source wallet identified by its
 * wallet id — the SDK requires walletId, not a raw address). Amount is in
 * decimal USDC units (e.g. "25.5"). Resolves once the on-chain transfer
 * completes, returning the final tx hash.
 */
export async function transferUSDC(walletId: string, toAddress: string, amount: string): Promise<string> {
  const client = getCircleClient();
  const res = await client.createTransaction({
    walletId,
    tokenAddress: USDC_ADDRESS,
    amount: [amount],
    destinationAddress: toAddress,
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
  });

  if (!res.data?.id) throw new Error('Failed to create USDC transfer');
  return waitForTransaction(res.data.id, 'usdc_transfer');
}
