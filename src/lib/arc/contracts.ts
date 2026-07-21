import { publicClient } from './viem-client';
import { AGENTIC_COMMERCE_ABI, IDENTITY_REGISTRY_ABI, USDC_ABI, AGENTIC_COMMERCE_ADDRESS, IDENTITY_REGISTRY_ADDRESS, USDC_ADDRESS } from '../constants';
import { formatUnits, parseUnits } from 'viem/utils';

export async function getJobDetails(jobId: bigint) {
  return await publicClient.readContract({
    address: AGENTIC_COMMERCE_ADDRESS,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: 'getJob',
    args: [jobId],
  });
}

export async function getAgentIdentity(agentId: bigint) {
  const owner = await publicClient.readContract({
    address: IDENTITY_REGISTRY_ADDRESS,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'ownerOf',
    args: [agentId],
  });
  
  const tokenURI = await publicClient.readContract({
    address: IDENTITY_REGISTRY_ADDRESS,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'tokenURI',
    args: [agentId],
  });
  
  return { owner, tokenURI };
}

export async function getUSDCBalance(address: string) {
  return await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });
}

export function formatOnchainUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

export function parseOnchainUSDC(amount: string): bigint {
  return parseUnits(amount, 6);
}
