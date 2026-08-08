import { describe, expect, it, vi, afterEach } from 'vitest'
import { getEthereumProvider, isValidWalletAddress } from '@/lib/ethereum'

const VALID_ADDRESS = '0x1111111111111111111111111111111111111111'

describe('getEthereumProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(getEthereumProvider()).toBeNull()
  })

  it('returns null when no wallet extension is injected', () => {
    vi.stubGlobal('window', {})
    expect(getEthereumProvider()).toBeNull()
  })

  it('returns the injected ethereum provider', () => {
    const fakeProvider = { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() }
    vi.stubGlobal('window', { ethereum: fakeProvider })
    expect(getEthereumProvider()).toBe(fakeProvider)
  })

  it('is safe to call repeatedly', () => {
    const fakeProvider = { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() }
    vi.stubGlobal('window', { ethereum: fakeProvider })
    expect(getEthereumProvider()).toBe(fakeProvider)
    expect(getEthereumProvider()).toBe(fakeProvider)
  })
})

describe('isValidWalletAddress', () => {
  it('accepts a full lowercase EVM address', () => {
    expect(isValidWalletAddress(VALID_ADDRESS)).toBe(true)
  })

  it('accepts a checksummed (mixed-case) EVM address', () => {
    expect(isValidWalletAddress('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B')).toBe(true)
  })

  it('rejects demo aliases like the simulated applicant', () => {
    expect(isValidWalletAddress('0x123...abc (Simulated)')).toBe(false)
    expect(isValidWalletAddress('0x123...abc')).toBe(false)
  })

  it('rejects missing or malformed values', () => {
    expect(isValidWalletAddress(null)).toBe(false)
    expect(isValidWalletAddress(undefined)).toBe(false)
    expect(isValidWalletAddress('')).toBe(false)
    expect(isValidWalletAddress('not-an-address')).toBe(false)
  })

  it('rejects addresses with the wrong length or bad characters', () => {
    expect(isValidWalletAddress('0x123456789012345678901234567890123456789')).toBe(false) // 39 hex
    expect(isValidWalletAddress('0x123456789012345678901234567890123456789012')).toBe(false) // 41 hex
    expect(isValidWalletAddress('0xgggggggggggggggggggggggggggggggggggggggg')).toBe(false)
    expect(isValidWalletAddress('1234567890123456789012345678901234567890')).toBe(false) // no 0x
  })
})
