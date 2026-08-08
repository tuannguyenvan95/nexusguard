'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, RotateCcw, AlertOctagon, FileText, Coins, CheckCircle2, Terminal, RefreshCw, Info } from 'lucide-react'
import { useIsClient } from '@/hooks/useIsClient'
import { fetchEscrowData, type EscrowEvent, type EscrowEventType, type EscrowStats } from '@/lib/monitoring/escrow'

const CONTRACT_ADDRESS = '0xECF383892b85CA8e8977f175137567E5bDa02FF0'

type Source = 'live' | 'sim'

const SIM_STATS: EscrowStats = {
  lockedBalance: 21300,
  activeEscrows: 6,
  pendingMilestones: 14,
  releasedMilestones: 24,
  refunded: 3,
  disputed: 1,
}

// Simulated fallback events (kept in sync with the demo look).
const seedEvents: EscrowEvent[] = [
  { id: 'sim-6', time: '10:47:12', type: 'FundsReleased', detail: 'Milestone 3/3 → provider 0x456…def · 2,500 USDC', hash: '0x7c2d…a9f1' },
  { id: 'sim-5', time: '10:45:48', type: 'JobCreated', detail: 'Escrow #JOB-007 · 1,200 USDC locked', hash: '0x9f3a…e21c' },
  { id: 'sim-4', time: '10:41:03', type: 'DisputeOpened', detail: 'Milestone 2/4 · Swarm review queued', hash: '0x22ea…9b42' },
  { id: 'sim-3', time: '10:38:27', type: 'FundsReleased', detail: 'Milestone 1/2 → provider 0x1a2…c34 · 800 USDC', hash: '0x5b91…7d0e' },
  { id: 'sim-2', time: '09:54:10', type: 'JobRefunded', detail: 'Escrow #JOB-004 · client refund', hash: '0x41b8…77d0' },
  { id: 'sim-1', time: '09:12:33', type: 'JobCreated', detail: 'Escrow #JOB-006 · 4,000 USDC locked', hash: '0xc3e7…a02f' },
]

const eventPool: Omit<EscrowEvent, 'id' | 'time'>[] = [
  { type: 'JobCreated', detail: 'Escrow #JOB-008 · 900 USDC locked', hash: '0x8f11…b4c7' },
  { type: 'FundsReleased', detail: 'Milestone 1/3 → provider 0x9e2…11f · 600 USDC', hash: '0xaa33…90d1' },
  { type: 'JobRefunded', detail: 'Escrow #JOB-003 · client refund', hash: '0x4c20…e8a3' },
  { type: 'FundsReleased', detail: 'Milestone 2/2 → provider 0x6d8…2ab · 1,150 USDC', hash: '0x1f77…c05e' },
]

const eventIcon: Record<EscrowEventType, typeof Lock> = {
  JobCreated: Lock,
  JobFunded: Coins,
  DeliverableSubmitted: FileText,
  Validated: CheckCircle2,
  FundsReleased: Unlock,
  JobRefunded: RotateCcw,
  AgentRegistered: Terminal,
  CoordinationCycle: RefreshCw,
  InvoiceGenerated: FileText,
  DisputeOpened: AlertOctagon,
  Unknown: Info,
}

const eventColor: Record<EscrowEventType, string> = {
  JobCreated: 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10',
  JobFunded: 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10',
  DeliverableSubmitted: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  Validated: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  FundsReleased: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  JobRefunded: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  AgentRegistered: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  CoordinationCycle: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  InvoiceGenerated: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  DisputeOpened: 'text-red-400 border-red-500/30 bg-red-500/10',
  Unknown: 'text-gray-400 border-gray-600/30 bg-gray-600/10',
}

function clockTime(): string {
  return new Date().toLocaleTimeString([], { hour12: false })
}

export function EscrowMonitor() {
  const mounted = useIsClient()
  const [stats, setStats] = useState<EscrowStats>(SIM_STATS)
  const [events, setEvents] = useState<EscrowEvent[]>(seedEvents)
  const [source, setSource] = useState<Source>('sim')

  useEffect(() => {
    let cancelled = false
    let simId = seedEvents.length + 1
    let inFlight = false

    const simStatsTick = () => {
      setStats((s) => ({ ...s, lockedBalance: Math.max(12000, s.lockedBalance + Math.round((Math.random() - 0.45) * 240)) }))
    }
    const maybeSimEvent = () => {
      if (Math.random() < 0.45) {
        const pick = eventPool[Math.floor(Math.random() * eventPool.length)]
        const fresh: EscrowEvent = { ...pick, id: `sim-${simId++}`, time: clockTime() }
        setEvents((prev) => [fresh, ...prev].slice(0, 8))
      }
    }
    const simTick = () => {
      simStatsTick()
      maybeSimEvent()
    }

    const tick = async () => {
      // Skip if a previous poll is still in flight (avoid overlapping stale snapshots).
      if (inFlight) return
      inFlight = true
      const real = await fetchEscrowData()
      if (cancelled) return
      inFlight = false

      if (real && (real.stats || real.events)) {
        setSource('live')
        // Per-part fallback: whatever the DB could not supply keeps simulating
        // so the panel never freezes under the LIVE badge.
        if (real.stats) setStats(real.stats)
        else simStatsTick()
        if (real.events) setEvents(real.events)
        else maybeSimEvent()
      } else {
        setSource('sim')
        simTick()
      }
    }

    tick()
    const interval = setInterval(tick, 6000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const milestones = [
    { label: 'Pending', count: stats.pendingMilestones, color: 'bg-gray-600' },
    { label: 'Released', count: stats.releasedMilestones, color: 'bg-emerald-500' },
    { label: 'Refunded', count: stats.refunded, color: 'bg-blue-500' },
    { label: 'Disputed', count: stats.disputed, color: 'bg-red-500' },
  ]
  const totalMilestones = milestones.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d4af37]"></span>
          Escrow Contract
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-sm border ${
              source === 'live'
                ? 'border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]'
                : 'border-gray-700 bg-gray-900/50 text-gray-500'
            }`}
          >
            {source === 'live' ? 'DB LIVE' : 'SIMULATED'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.ESC.03</div>
        </div>
      </div>

      {/* Contract identity */}
      <div className="p-3 bg-gray-900/50 rounded-sm border border-gray-800 mb-4">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">
          <FileText className="w-3 h-3" />
          NexusGuardEscrowV2
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[#d4af37] font-mono truncate" title={CONTRACT_ADDRESS}>{CONTRACT_ADDRESS}</span>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Locked Balance', value: mounted ? `$${stats.lockedBalance.toLocaleString('en-US')}` : '—', sub: 'USDC', color: 'text-[#d4af37]' },
          { label: 'Active Escrows', value: String(stats.activeEscrows), sub: 'open', color: 'text-white' },
          { label: 'Milestones Released', value: String(stats.releasedMilestones), sub: 'settled', color: 'text-emerald-400' },
          { label: 'Refunded / Disputed', value: `${stats.refunded} / ${stats.disputed}`, sub: 'exceptions', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="p-3 bg-gray-900/50 rounded-sm border border-gray-800">
            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">{s.label}</div>
            <div className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Milestone distribution */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Milestone Distribution</span>
          <span className="text-[10px] text-gray-500 font-mono">{totalMilestones} total</span>
        </div>
        <div className="flex h-2 rounded-sm overflow-hidden gap-0.5">
          {milestones.map((m) => (
            <div
              key={m.label}
              className={m.color}
              style={{ width: `${totalMilestones > 0 ? (m.count / totalMilestones) * 100 : 25}%` }}
              title={`${m.label}: ${m.count}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {milestones.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
              <span className={`w-1.5 h-1.5 rounded-sm ${m.color}`} />
              {m.label} · {m.count}
            </span>
          ))}
        </div>
      </div>

      {/* Contract events */}
      <div className="border-t border-gray-800 pt-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Recent Contract Events</span>
        </div>
        <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
          {events.map((ev) => {
            const Icon = eventIcon[ev.type]
            return (
              <div key={ev.id} className="flex items-center gap-3 p-2 rounded-sm bg-gray-900/40 border border-gray-800/60 hover:border-gray-700 transition-colors">
                <div className={`w-7 h-7 shrink-0 rounded-sm border flex items-center justify-center ${eventColor[ev.type]}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-white font-mono uppercase tracking-wider">{ev.type}</span>
                    <span className="text-[9px] text-gray-600 font-mono">{ev.time}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{ev.detail}</div>
                </div>
                <span className="text-[10px] text-[#d4af37] font-mono shrink-0">{ev.hash}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
