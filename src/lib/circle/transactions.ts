import { getCircleClient, waitForTransaction } from './client';
import { AGENTIC_COMMERCE_ADDRESS, USDC_ADDRESS, IDENTITY_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ADDRESS } from '../constants';

export async function executeContractCall(walletId: string, contractAddress: string, functionSignature: string, params: string[]) {
  const client = getCircleClient();
  const res = await client.createContractExecutionTransaction({
    walletId,
    contractAddress,
    abiFunctionSignature: functionSignature,
    abiParameters: params,
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } }
  });
  
  if (!res.data?.id) throw new Error('Failed to execute contract call');
  return waitForTransaction(res.data.id, `contract_call_${functionSignature}`);
}

export async function approveUSDC(walletId: string, spenderAddress: string, amount: string) {
  return executeContractCall(
    walletId,
    USDC_ADDRESS,
    'approve(address,uint256)',
    [spenderAddress, amount]
  );
}

export async function createERC8183Job(walletId: string, providerAddress: string, evaluatorAddress: string, expiry: string, description: string, budget: string) {
  // Assuming 'duration' maps to expiry in the signature
  return executeContractCall(
    walletId,
    AGENTIC_COMMERCE_ADDRESS,
    'createJob(address,address,string,uint256,uint256)',
    [providerAddress, evaluatorAddress, description, budget, expiry]
  );
}

export async function fundJob(walletId: string, jobId: string, amount: string) {
  return executeContractCall(
    walletId,
    AGENTIC_COMMERCE_ADDRESS,
    'fund(uint256,uint256)',
    [jobId, amount]
  );
}

export async function submitDeliverable(walletId: string, jobId: string, deliverableHash: string) {
  return executeContractCall(
    walletId,
    AGENTIC_COMMERCE_ADDRESS,
    'submit(uint256,string)',
    [jobId, deliverableHash]
  );
}

export async function completeJob(walletId: string, jobId: string, reasonHash: string) {
  return executeContractCall(
    walletId,
    AGENTIC_COMMERCE_ADDRESS,
    'complete(uint256,string)',
    [jobId, reasonHash]
  );
}

export async function rejectJob(walletId: string, jobId: string, reasonHash: string) {
  return executeContractCall(
    walletId,
    AGENTIC_COMMERCE_ADDRESS,
    'rejectJob(uint256,string)',
    [jobId, reasonHash]
  );
}

export async function registerAgent(walletId: string, metadataURI: string) {
  return executeContractCall(
    walletId,
    IDENTITY_REGISTRY_ADDRESS,
    'register(string)',
    [metadataURI]
  );
}

export async function giveFeedback(walletId: string, agentId: string, score: string, tag: string) {
  // Using placeholder values for other parameters in giveFeedback
  return executeContractCall(
    walletId,
    REPUTATION_REGISTRY_ADDRESS,
    'giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)',
    [agentId, score, '0', '', '', '', tag, '0x0000000000000000000000000000000000000000000000000000000000000000']
  );
}
