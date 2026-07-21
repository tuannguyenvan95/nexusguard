import { type Address } from 'viem';

export const USDC_ADDRESS = '0x1234567890123456789012345678901234567890' as Address;
export const IDENTITY_REGISTRY_ADDRESS = '0x2345678901234567890123456789012345678901' as Address;
export const REPUTATION_REGISTRY_ADDRESS = '0x3456789012345678901234567890123456789012' as Address;
export const VALIDATION_REGISTRY_ADDRESS = '0x4567890123456789012345678901234567890123' as Address;
export const AGENTIC_COMMERCE_ADDRESS = '0x5678901234567890123456789012345678901234' as Address;

export enum JobStatusEnum {
  Open = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Rejected = 4,
  Expired = 5
}

export const STATUS_NAMES = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'] as const;

export const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
] as const;

export const IDENTITY_REGISTRY_ABI = [
  'function register(string metadataURI) external returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
] as const;

export const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 agentId, int128 score, uint8 ratingType, string review, string ipfsHash, string domain, string specificSkill, bytes32 contextHash) external'
] as const;

export const VALIDATION_REGISTRY_ABI = [
  'function validationRequest(address agent, uint256 jobId, string requestedValidation, bytes32 dataHash) external',
  'function validationResponse(bytes32 requestId, uint8 status, string responseHash, bytes32 validatorSignature, string validatorNotes) external',
  'function getValidationStatus(bytes32 requestId) external view returns (uint8, string, bytes32, string)'
] as const;

export const AGENTIC_COMMERCE_ABI = [
  'function createJob(address provider, address evaluator, string description, uint256 budget, uint256 duration) external returns (uint256)',
  'function setBudget(uint256 jobId, uint256 budget) external',
  'function fund(uint256 jobId, uint256 amount) external',
  'function submit(uint256 jobId, string deliverableHash) external',
  'function complete(uint256 jobId, string reasonHash) external',
  'function rejectJob(uint256 jobId, string reasonHash) external',
  'function getJob(uint256 jobId) external view returns (uint256 id, address client, address provider, address evaluator, string description, uint256 budget, uint256 expiredAt, uint8 status, address hook)',
  'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider)'
] as const;

export type AgentType = 'guardian' | 'escrow' | 'validator' | 'treasury' | 'compliance';
