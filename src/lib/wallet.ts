import { createWalletClient, custom, type EIP1193Provider } from 'viem'
import { arcTestnet } from 'viem/chains'
import { getEthereumProvider, type EthereumProvider } from '@/lib/ethereum'

/** Bridge the minimal shared EthereumProvider type to viem's EIP-1193 type. */
function toViemProvider(provider: EthereumProvider): EIP1193Provider {
  return provider as unknown as EIP1193Provider
}

/**
 * viem-based wallet connection layer.
 *
 * Handles everything the old TopHeader JSON-RPC spaghetti did, but through
 * viem wallet actions: requesting accounts (`eth_requestAccounts`), enforcing
 * the Arc Testnet chain (`wallet_switchEthereumChain` / `wallet_addEthereumChain`)
 * and persisting the connected address so it survives page reloads.
 */

export type WalletKind = 'metamask' | 'coinbase' | 'generic'

const WALLET_ADDRESS_KEY = 'nexusguard-wallet-address'
const WALLET_DISCONNECTED_KEY = 'walletDisconnected'

/**
 * Identify which injected wallet is present, if any.
 *
 * Coinbase Wallet also sets `isMetaMask` for dapp compatibility, so the
 * Coinbase flag must win when both are present.
 */
export function getWalletKind(provider: EthereumProvider | null = getEthereumProvider()): WalletKind | null {
  if (!provider) return null
  const flags = provider as EthereumProvider & {
    isMetaMask?: boolean
    isCoinbaseWallet?: boolean
  }
  if (flags.isCoinbaseWallet) return 'coinbase'
  if (flags.isMetaMask) return 'metamask'
  return 'generic'
}

/**
 * Switch the injected wallet to Arc Testnet, adding the chain if the wallet
 * does not know it yet (error code 4902 = chain not added).
 */
export async function ensureArcTestnetChain(provider: EthereumProvider): Promise<void> {
  const client = createWalletClient({
    chain: arcTestnet,
    transport: custom(toViemProvider(provider)),
  })

  try {
    await client.switchChain({ id: arcTestnet.id })
  } catch (error) {
    const code = (error as { code?: number }).code
    if (code === 4902) {
      await client.addChain({ chain: arcTestnet })
      await client.switchChain({ id: arcTestnet.id })
    } else {
      throw error
    }
  }
}

/**
 * Request account access from the injected wallet and enforce the Arc chain.
 * Returns the connected (checksummed) address, or throws a friendly error.
 */
export async function connectWallet(
  provider: EthereumProvider | null = getEthereumProvider()
): Promise<string> {
  if (!provider) {
    throw new Error(
      'No wallet extension detected. Please install MetaMask or Coinbase Wallet to connect.'
    )
  }

  const client = createWalletClient({
    chain: arcTestnet,
    transport: custom(toViemProvider(provider)),
  })

  const [address] = await client.requestAddresses()
  if (!address) {
    throw new Error('The wallet returned no account. Unlock your wallet and try again.')
  }

  await ensureArcTestnetChain(provider)
  return address
}

// ─── Persistence ─────────────────────────────────────────────────────────────

export function getStoredWalletAddress(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(WALLET_ADDRESS_KEY)
}

export function storeWalletAddress(address: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WALLET_ADDRESS_KEY, address)
}

export function clearStoredWalletAddress(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WALLET_ADDRESS_KEY)
}

/** True when the user explicitly disconnected and should not auto-reconnect. */
export function isWalletDisconnected(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(WALLET_DISCONNECTED_KEY) === 'true'
}

export function setWalletDisconnected(disconnected: boolean): void {
  if (typeof window === 'undefined') return
  if (disconnected) {
    window.localStorage.setItem(WALLET_DISCONNECTED_KEY, 'true')
  } else {
    window.localStorage.removeItem(WALLET_DISCONNECTED_KEY)
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────

/**
 * Subscribe to `accountsChanged` events from the injected wallet.
 * Returns an unsubscribe function. Handles `accountsChanged: []` (wallet
 * revoked access) by passing an empty array.
 */
export function subscribeAccountsChanged(
  handler: (accounts: string[]) => void,
  provider: EthereumProvider | null = getEthereumProvider()
): () => void {
  if (!provider) return () => {}

  const listener = (...args: unknown[]) => {
    const accounts = args[0]
    handler(Array.isArray(accounts) ? (accounts as string[]) : [])
  }

  provider.on('accountsChanged', listener)
  return () => provider.removeListener('accountsChanged', listener)
}

/** `0x1234…abcd` display form used across the UI. */
export function formatWalletAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
