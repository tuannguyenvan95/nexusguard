import { getCircleClient } from './client';

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

export async function transferUSDC(fromAddress: string, toAddress: string, amount: string) {
  const client = getCircleClient();
  // Implementation will depend on the exact API for transfers, usually it requires walletId
  // This is a placeholder since the exact API for token transfer isn't fully specified in the prompt
  // In a real scenario, this would likely be a contract execution or a specific transfer endpoint.
  throw new Error('Not implemented: transferUSDC requires fromWalletId or contract execution');
}
