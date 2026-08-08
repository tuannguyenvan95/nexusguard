'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredWalletAddress,
  connectWallet,
  getStoredWalletAddress,
  getWalletKind,
  isWalletDisconnected,
  setWalletDisconnected,
  storeWalletAddress,
  subscribeAccountsChanged,
  type WalletKind,
} from '@/lib/wallet'
import { getEthereumProvider } from '@/lib/ethereum'

/**
 * React binding over the viem wallet layer (see src/lib/wallet.ts).
 *
 * - Restores a previously connected address from localStorage on mount
 *   (unless the user explicitly disconnected).
 * - Connects via the injected provider and enforces the Arc Testnet chain.
 * - Stays live: reacts to `accountsChanged` from the wallet extension.
 */
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [walletKind, setWalletKind] = useState<WalletKind | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Restore persisted address unless the user disconnected on purpose.
    // setState here is a one-time hydration-time restore (mirrors the old
    // TopHeader pattern) — it cannot be moved into a lazy initializer because
    // SSR must render the disconnected state first.
    if (!isWalletDisconnected()) {
      const stored = getStoredWalletAddress()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setAddress(stored)
    }
    setWalletKind(getWalletKind())

    // Re-verify the connection without popping the wallet UI: if the user
    // revoked dapp access in the wallet, clear the persisted address so a
    // stale account is never shown (mirrors the old TopHeader behaviour).
    getEthereumProvider()
      ?.request({ method: 'eth_accounts' })
      .then((accounts) => {
        const list = accounts as string[]
        if (list.length > 0) {
          setAddress(list[0])
          storeWalletAddress(list[0])
        } else if (getStoredWalletAddress() && !isWalletDisconnected()) {
          setAddress(null)
          clearStoredWalletAddress()
        }
      })
      .catch(() => {
        // Wallet unavailable — keep whatever was restored.
      })

    // Keep the header in sync when the wallet switches accounts.
    const unsubscribe = subscribeAccountsChanged((accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setWalletDisconnected(false)
        storeWalletAddress(accounts[0])
      } else {
        // Wallet revoked access — drop the stored address too.
        setAddress(null)
        clearStoredWalletAddress()
      }
    })

    return unsubscribe
  }, [])

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)
    setError(null)
    try {
      const account = await connectWallet()
      setAddress(account)
      setWalletKind(getWalletKind())
      setWalletDisconnected(false)
      storeWalletAddress(account)
      return account
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet.'
      setError(message)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    clearStoredWalletAddress()
    setWalletDisconnected(true)
  }, [])

  return { address, walletKind, isConnecting, error, connect, disconnect }
}
