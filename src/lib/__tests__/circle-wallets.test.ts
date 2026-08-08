import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetCircleClient, mockWaitForTransaction } = vi.hoisted(() => ({
  mockGetCircleClient: vi.fn(),
  mockWaitForTransaction: vi.fn(),
}));

// Replace the real Circle SDK client + polling helper — tests never hit the network.
vi.mock('@/lib/circle/client', () => ({
  getCircleClient: mockGetCircleClient,
  waitForTransaction: mockWaitForTransaction,
}));

import { transferUSDC } from '@/lib/circle/wallets';
import { USDC_ADDRESS } from '@/lib/constants';

describe('transferUSDC', () => {
  const mockCreateTransaction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTransaction.mockReset();
    mockGetCircleClient.mockReturnValue({ createTransaction: mockCreateTransaction });
  });

  it('creates a Circle transfer from the wallet and returns the final tx hash', async () => {
    mockCreateTransaction.mockResolvedValue({ data: { id: 'tx_abc123' } });
    mockWaitForTransaction.mockResolvedValue('0xdeadbeef');

    const result = await transferUSDC('wallet_1', '0xDestination', '12.5');

    expect(mockGetCircleClient).toHaveBeenCalledTimes(1);
    expect(mockCreateTransaction).toHaveBeenCalledWith({
      walletId: 'wallet_1',
      tokenAddress: USDC_ADDRESS,
      amount: ['12.5'],
      destinationAddress: '0xDestination',
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    });
    expect(mockWaitForTransaction).toHaveBeenCalledWith('tx_abc123', 'usdc_transfer');
    expect(result).toBe('0xdeadbeef');
  });

  it('throws when the SDK does not return a transaction id', async () => {
    mockCreateTransaction.mockResolvedValue({ data: {} });

    await expect(transferUSDC('wallet_1', '0xDestination', '1')).rejects.toThrow(
      'Failed to create USDC transfer'
    );
    expect(mockWaitForTransaction).not.toHaveBeenCalled();
  });

  it('propagates missing-credentials errors from the client factory', async () => {
    mockGetCircleClient.mockImplementation(() => {
      throw new Error('Missing Circle credentials. Set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET.');
    });

    await expect(transferUSDC('wallet_1', '0xDestination', '1')).rejects.toThrow(
      'Missing Circle credentials'
    );
  });

  it('propagates on-chain failure errors from waitForTransaction', async () => {
    mockCreateTransaction.mockResolvedValue({ data: { id: 'tx_abc123' } });
    mockWaitForTransaction.mockRejectedValue(new Error('usdc_transfer failed on-chain'));

    await expect(transferUSDC('wallet_1', '0xDestination', '1')).rejects.toThrow(
      'usdc_transfer failed on-chain'
    );
  });

  it('passes decimal string amounts through untouched', async () => {
    mockCreateTransaction.mockResolvedValue({ data: { id: 'tx_1' } });
    mockWaitForTransaction.mockResolvedValue('0xhash');

    await transferUSDC('wallet_1', '0xDestination', '0.000001');

    const call = mockCreateTransaction.mock.calls[0][0];
    expect(call.amount).toEqual(['0.000001']);
  });
});
