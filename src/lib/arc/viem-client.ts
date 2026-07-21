import { createPublicClient, http } from 'viem';
import { arcTestnet } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});
