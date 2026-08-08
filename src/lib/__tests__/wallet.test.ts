import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  clearStoredWalletAddress,
  connectWallet,
  formatWalletAddress,
  getStoredWalletAddress,
  getWalletKind,
  isWalletDisconnected,
  setWalletDisconnected,
  storeWalletAddress,
  subscribeAccountsChanged,
} from '@/lib/wallet'

const ADDRESS = '0x1111111111111111111111111111111111111111'

// The jsdom environment in this repo does not expose `window.localStorage`
// (Node 26 / jsdom quirk), so provide a minimal in-memory implementation.
function installLocalStorage() {
  const store = new Map<string, string>()
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  }
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  })
  return store
}

type MockProvider = {
  request: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  removeListener: ReturnType<typeof vi.fn>
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

function makeProvider(overrides: { isMetaMask?: boolean; isCoinbaseWallet?: boolean } = {}): MockProvider {
  return {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    ...overrides,
  }
}

function stubProvider(provider: unknown) {
  Object.defineProperty(window, 'ethereum', {
    configurable: true,
    value: provider,
  })
}

// Install localStorage once so the global afterEach is always safe.
installLocalStorage()

afterEach(() => {
  delete (window as { ethereum?: unknown }).ethereum
  window.localStorage.clear()
})

describe('getWalletKind', () => {
  it('returns null when no provider is present', () => {
    expect(getWalletKind(null)).toBeNull()
  })

  it('detects MetaMask', () => {
    const provider = makeProvider({ isMetaMask: true })
    expect(getWalletKind(provider as never)).toBe('metamask')
  })

  it('detects Coinbase Wallet', () => {
    const provider = makeProvider({ isCoinbaseWallet: true })
    expect(getWalletKind(provider as never)).toBe('coinbase')
  })

  it('prefers Coinbase when both flags are set (Coinbase sets isMetaMask for compat)', () => {
    const provider = makeProvider({ isMetaMask: true, isCoinbaseWallet: true })
    expect(getWalletKind(provider as never)).toBe('coinbase')
  })

  it('falls back to generic for unknown injected wallets', () => {
    const provider = makeProvider()
    expect(getWalletKind(provider as never)).toBe('generic')
  })
})

describe('connectWallet', () => {
  it('requests accounts via eth_requestAccounts and returns the address', async () => {
    const provider = makeProvider()
    provider.request.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') return [ADDRESS]
      if (method === 'wallet_switchEthereumChain') return null
      return undefined
    })
    stubProvider(provider)

    const result = await connectWallet(provider as never)

    expect(result.toLowerCase()).toBe(ADDRESS)
    const methods = provider.request.mock.calls.map(([args]) => (args as { method: string }).method)
    expect(methods).toContain('eth_requestAccounts')
    // Enforces Arc Testnet
    expect(methods).toContain('wallet_switchEthereumChain')
  })

  it('adds the Arc chain first when the wallet returns error 4902', async () => {
    const provider = makeProvider()
    let switchCalls = 0
    provider.request.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') return [ADDRESS]
      if (method === 'wallet_switchEthereumChain') {
        switchCalls += 1
        if (switchCalls === 1) throw { code: 4902, message: 'Unrecognized chain ID' }
        return null
      }
      if (method === 'wallet_addEthereumChain') return null
      return undefined
    })
    stubProvider(provider)

    const result = await connectWallet(provider as never)

    expect(result.toLowerCase()).toBe(ADDRESS)
    const methods = provider.request.mock.calls.map(([args]) => (args as { method: string }).method)
    expect(methods).toContain('wallet_addEthereumChain')
    expect(switchCalls).toBe(2)
  })

  it('throws a friendly error when no wallet extension is installed', async () => {
    stubProvider(null)
    await expect(connectWallet(null)).rejects.toThrow(/no wallet extension/i)
  })

  it('throws when the wallet returns no accounts', async () => {
    const provider = makeProvider()
    provider.request.mockImplementation(async ({ method }: { method: string }) => {
      if (method === 'eth_requestAccounts') return []
      return undefined
    })
    stubProvider(provider)

    await expect(connectWallet(provider as never)).rejects.toThrow(/no account/i)
  })
})

describe('wallet persistence', () => {
  it('round-trips the stored address', () => {
    expect(getStoredWalletAddress()).toBeNull()
    storeWalletAddress(ADDRESS)
    expect(getStoredWalletAddress()).toBe(ADDRESS)
    clearStoredWalletAddress()
    expect(getStoredWalletAddress()).toBeNull()
  })

  it('tracks the disconnected flag', () => {
    expect(isWalletDisconnected()).toBe(false)
    setWalletDisconnected(true)
    expect(isWalletDisconnected()).toBe(true)
    setWalletDisconnected(false)
    expect(isWalletDisconnected()).toBe(false)
  })
})

describe('subscribeAccountsChanged', () => {
  it('invokes the handler with the new account list and unsubscribes', () => {
    const provider = makeProvider()
    const handler = vi.fn()
    const unsubscribe = subscribeAccountsChanged(handler, provider as never)

    expect(provider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))

    const listener = provider.on.mock.calls[0][1]
    listener([ADDRESS])
    expect(handler).toHaveBeenCalledWith([ADDRESS])

    listener([])
    expect(handler).toHaveBeenCalledWith([])

    unsubscribe()
    expect(provider.removeListener).toHaveBeenCalledWith('accountsChanged', listener)
  })

  it('returns a no-op unsubscribe when no provider exists', () => {
    expect(() => subscribeAccountsChanged(() => {}, null)).not.toThrow()
  })
})

describe('formatWalletAddress', () => {
  it('shortens a full EVM address to 0x1111…1111', () => {
    expect(formatWalletAddress(ADDRESS)).toBe('0x1111…1111')
  })

  it('returns short strings untouched', () => {
    expect(formatWalletAddress('0x1234')).toBe('0x1234')
  })
})
