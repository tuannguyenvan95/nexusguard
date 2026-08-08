import { formatGwei } from 'viem'
import { publicClient } from '@/lib/arc/viem-client'

export interface NetworkStats {
  blockHeight: number
  gasPriceGwei: number
  blockTimeSec: number
  latencyMs: number
}

/**
 * Fetch live network telemetry from the Arc RPC via the shared viem public client.
 * Returns null when the RPC is unreachable so callers can fall back to simulation.
 * Safe to call from client components (browser).
 */
export async function fetchNetworkStats(): Promise<NetworkStats | null> {
  try {
    const start = Date.now()
    const blockNumber = await publicClient.getBlockNumber()
    const latencyMs = Math.max(1, Date.now() - start)

    const gasPrice = await publicClient.getGasPrice()
    const gasPriceGwei = Number(formatGwei(gasPrice))

    const [latest, previous] = await Promise.all([
      publicClient.getBlock({ blockNumber }),
      publicClient.getBlock({ blockNumber: blockNumber - BigInt(1) }),
    ])

    const blockTimeSec = Math.max(0.1, Number(latest.timestamp - previous.timestamp))

    return { blockHeight: Number(blockNumber), gasPriceGwei, blockTimeSec, latencyMs }
  } catch {
    return null
  }
}

/** Format gas in Gwei without ugly long decimals (Arc's base fee is tiny). */
export function formatGasPriceGwei(gwei: number): string {
  if (gwei >= 0.01) return gwei.toFixed(2)
  if (gwei > 0) return gwei.toPrecision(3)
  return '0.00'
}
