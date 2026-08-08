/**
 * Minimal shared typing for the MetaMask-injected `window.ethereum` provider.
 * EIP-1193 providers expose `request` plus the legacy `on`/`removeListener`
 * event API used for account/chain-change listeners.
 */
export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

/**
 * SSR-safe accessor for `window.ethereum`.
 * Returns null outside the browser or when no wallet extension is injected.
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const maybeWindow = window as unknown as { ethereum?: EthereumProvider };
  return maybeWindow.ethereum ?? null;
}

/** 0x followed by 40 hex chars — a full-length EVM address. */
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * True when `address` looks like a full EVM wallet address.
 *
 * Short demo aliases such as '0x123...abc (Simulated)' are rejected so they
 * can never be persisted as real applicants or payout targets.
 */
export function isValidWalletAddress(
  address: string | null | undefined
): boolean {
  if (!address) return false;
  return EVM_ADDRESS_RE.test(address);
}
