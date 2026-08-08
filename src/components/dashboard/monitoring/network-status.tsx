'use client'

import { useState, useEffect } from 'react'
import { Wifi, Database, Gauge, Clock, Globe, Activity } from 'lucide-react'
import { arcTestnet } from 'viem/chains'
import { useIsClient } from '@/hooks/useIsClient'
import { fetchNetworkStats, formatGasPriceGwei } from '@/lib/monitoring/network'

const CHAIN_NAME = arcTestnet.name
const RPC_ENDPOINT = arcTestnet.rpcUrls.default.http[0]

type Source = 'live' | 'sim'

interface DisplayStats {
  blockHeight: number
  blockTime: number
  gasPrice: number
  latency: number
}

function jitter(base: number, range: number, decimals: number): number {
  return Number((base + (Math.random() - 0.5) * range).toFixed(decimals))
}

const SIM_SEED: DisplayStats = { blockHeight: 18432105, blockTime: 2.1, gasPrice: 0.42, latency: 38 }

export function NetworkStatus() {
  const mounted = useIsClient()
  const [display, setDisplay] = useState<DisplayStats>(SIM_SEED)
  const [source, setSource] = useState<Source>('sim')
  const [uptime, setUptime] = useState(99.97)
  const [peakLatency, setPeakLatency] = useState(52)

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    let successes = 0
    let everLive = false
    let consecutiveFailures = 0
    let inFlight = false

    // Simulated fallback: jitter values like the original demo widget.
    const simTick = () => {
      setDisplay((prev) => ({
        blockHeight: prev.blockHeight + (Math.random() > 0.6 ? 2 : 1),
        blockTime: jitter(2.1, 0.5, 1),
        gasPrice: jitter(0.42, 0.08, 3),
        latency: jitter(38, 14, 0),
      }))
      setPeakLatency((p) => jitter(p, 6, 0))
    }

    const tick = async () => {
      // Skip if a previous poll is still in flight (avoid overlapping stale snapshots).
      if (inFlight) return
      inFlight = true
      attempts += 1
      const real = await fetchNetworkStats()
      if (cancelled) return
      inFlight = false

      if (real) {
        consecutiveFailures = 0
        everLive = true
        successes += 1
        setSource('live')
        setDisplay({
          blockHeight: real.blockHeight,
          blockTime: real.blockTimeSec,
          gasPrice: real.gasPriceGwei,
          latency: real.latencyMs,
        })
        setPeakLatency((p) => Math.max(p, real.latencyMs))
      } else if (!everLive) {
        // Never reached the RPC — keep the simulation running.
        simTick()
      } else {
        // Was live but the RPC is now unreachable: fall back to simulation
        // after a few consecutive failures instead of freezing stale values.
        consecutiveFailures += 1
        if (consecutiveFailures >= 3) {
          setSource('sim')
          simTick()
        }
      }
      // RPC uptime = successful probes / total probes — only meaningful once live.
      if (everLive && attempts >= 3) {
        setUptime(Number(((100 * successes) / attempts).toFixed(2)))
      }
    }

    tick()
    const interval = setInterval(tick, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const readouts = [
    { label: 'Chain', value: CHAIN_NAME, icon: Globe, mono: false },
    { label: 'RPC Endpoint', value: RPC_ENDPOINT, icon: Database, mono: true },
    { label: 'Block Height', value: mounted ? display.blockHeight.toLocaleString('en-US') : '—', icon: Activity, mono: true },
    { label: 'Block Time', value: mounted ? `${display.blockTime}s` : '—', icon: Clock, mono: true },
    { label: 'Gas Price', value: mounted ? `${formatGasPriceGwei(display.gasPrice)} Gwei` : '—', icon: Gauge, mono: true },
    { label: 'Latency', value: mounted ? `${display.latency} ms` : '—', icon: Wifi, mono: true },
  ]

  // Signal strength bars derived from latency
  const signal = display.latency < 50 ? 4 : display.latency < 90 ? 3 : display.latency < 150 ? 2 : 1

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d4af37] animate-pulse"></span>
          Network Status
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">OPERATIONAL</span>
          </div>
          <div
            className={`text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-sm border ${
              source === 'live'
                ? 'border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]'
                : 'border-gray-700 bg-gray-900/50 text-gray-500'
            }`}
          >
            {source === 'live' ? 'RPC LIVE' : 'SIMULATED'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.NET.01</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {readouts.map((r) => (
          <div
            key={r.label}
            className="p-3 bg-gray-900/50 rounded-sm border border-gray-800 hover:border-[#d4af37]/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">
              <r.icon className="w-3 h-3" />
              {r.label}
            </div>
            <div
              className={`text-xs text-white font-mono ${r.mono ? 'truncate' : ''}`}
              title={r.mono && typeof r.value === 'string' ? r.value : undefined}
            >
              {r.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
          <Wifi className="w-3 h-3" />
          <span>Signal</span>
          <div className="flex items-end gap-0.5 ml-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-sm transition-colors ${bar <= signal ? 'bg-emerald-400' : 'bg-gray-800'}`}
                style={{ height: `${4 + bar * 2}px` }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
          <span className="text-gray-500">RPC Uptime 24H</span>
          <span className="text-emerald-400 font-bold">{mounted ? `${uptime}%` : '—'}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
          <span className="text-gray-500">Peak Latency</span>
          <span className="text-[#d4af37] font-bold">{mounted ? `${peakLatency} ms` : '—'}</span>
        </div>
      </div>
    </div>
  )
}
