'use client'

import { useState, useEffect, useRef } from 'react'
import { HeartPulse, ShieldCheck, Cpu, Scale, CreditCard, ShieldAlert } from 'lucide-react'
import { useIsClient } from '@/hooks/useIsClient'
import { useAudio } from '@/hooks/useAudio'
import { pushNotification } from '@/lib/monitoring/notifications'

type Health = 'operational' | 'degraded' | 'offline'

interface AgentNode {
  name: string
  role: string
  icon: typeof ShieldCheck
  health: Health
  lastBeat: number
  responseMs: number
  success24h: number
  uptime30d: number
}

// Seconds between heartbeats for each node — Validator pings slower on purpose.
const CADENCE: Record<string, number> = {
  Escrow: 10,
  Validator: 34,
  Compliance: 12,
  Treasury: 14,
  Guardian: 18,
}

const seed: AgentNode[] = [
  { name: 'Escrow', role: 'Smart Contract Mgmt', icon: ShieldCheck, health: 'operational', lastBeat: 2, responseMs: 118, success24h: 99.9, uptime30d: 99.95 },
  { name: 'Validator', role: 'Deliverable QA', icon: Cpu, health: 'degraded', lastBeat: 41, responseMs: 342, success24h: 98.7, uptime30d: 99.41 },
  { name: 'Compliance', role: 'Tax & Regulatory', icon: Scale, health: 'operational', lastBeat: 5, responseMs: 96, success24h: 100, uptime30d: 100 },
  { name: 'Treasury', role: 'Fund Disbursement', icon: CreditCard, health: 'operational', lastBeat: 3, responseMs: 142, success24h: 99.8, uptime30d: 99.87 },
  { name: 'Guardian', role: 'Fraud Detection', icon: ShieldAlert, health: 'operational', lastBeat: 7, responseMs: 203, success24h: 99.6, uptime30d: 99.78 },
]

const healthStyles: Record<Health, { badge: string; dot: string; label: string }> = {
  operational: {
    badge: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    dot: 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    label: 'OPERATIONAL',
  },
  degraded: {
    badge: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    dot: 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    label: 'DEGRADED',
  },
  offline: {
    badge: 'border-red-500/30 bg-red-500/5 text-red-400',
    dot: 'bg-red-500',
    label: 'OFFLINE',
  },
}

export function AgentHealth() {
  const mounted = useIsClient()
  const [agents, setAgents] = useState<AgentNode[]>(seed)
  const { playAlarm } = useAudio()
  // Track the last-seen health per node so we only alarm on a real transition
  // into the offline state (not on every render).
  const prevHealthRef = useRef<Record<string, Health>>(
    Object.fromEntries(seed.map((a) => [a.name, a.health]))
  )

  useEffect(() => {
    const prev = prevHealthRef.current
    for (const agent of agents) {
      if (agent.health === 'offline' && prev[agent.name] !== 'offline') {
        playAlarm()
        pushNotification({
          kind: 'offline',
          title: `${agent.name} Node Offline`,
          message: `${agent.name} missed its heartbeat — ${agent.role.toLowerCase()} halted.`,
        })
      }
    }
    prevHealthRef.current = Object.fromEntries(agents.map((a) => [a.name, a.health]))
  }, [agents, playAlarm])

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          const cadence = CADENCE[a.name] ?? 16
          const nextBeat = a.lastBeat + 2
          // Heartbeat fires when the node reaches its cadence (with a small miss
          // chance). 40% of missed beats escalate into a real outage episode so
          // the offline alarm is occasionally observable across the fleet.
          let lastBeat = nextBeat
          if (nextBeat >= cadence) {
            lastBeat = Math.random() < 0.12 ? (Math.random() < 0.4 ? nextBeat + 60 : nextBeat) : 0
          }
          // Health state machine: occasional degradation, auto-recovery.
          // Validator recovers far more slowly so its degraded state is visible.
          let health: Health = a.health
          if (lastBeat > cadence + 40) {
            health = 'offline'
          } else if (lastBeat > cadence + 12) {
            health = 'degraded'
          } else if (health === 'degraded') {
            const recoveryChance = a.name === 'Validator' ? 0.04 : 0.35
            if (Math.random() < recoveryChance) health = 'operational'
          } else if (a.name === 'Validator' && Math.random() < 0.02) {
            health = 'degraded'
          } else if (health === 'offline') {
            health = 'operational'
          }
          return {
            ...a,
            lastBeat,
            health,
            responseMs: Math.max(40, a.responseMs + Math.round((Math.random() - 0.5) * 12)),
          }
        })
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const totalHealthy = agents.filter((a) => a.health === 'operational').length

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></span>
          Agent Heartbeat
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">
            <HeartPulse className="w-3 h-3 text-[#d4af37]" />
            {mounted ? `${totalHealthy}/${agents.length} HEALTHY` : '--/-- HEALTHY'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.AGT.02</div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
              <th className="pb-3 font-bold">Node</th>
              <th className="pb-3 font-bold">Status</th>
              <th className="pb-3 font-bold">Last Heartbeat</th>
              <th className="pb-3 font-bold">Response</th>
              <th className="pb-3 font-bold text-right">24H Success</th>
              <th className="pb-3 font-bold text-right">30D Uptime</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {agents.map((agent) => {
              const Icon = agent.icon
              const style = healthStyles[agent.health]
              return (
                <tr key={agent.name} className="border-b border-gray-800/50 hover:bg-[#d4af37]/5 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/50 border border-gray-700 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase tracking-widest text-[11px]">{agent.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] font-bold tracking-widest ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400 font-mono">
                    {mounted ? `${agent.lastBeat}s ago` : '—'}
                    {mounted && (
                      <span className="ml-2 text-[9px] text-gray-600">
                        {agent.lastBeat < CADENCE[agent.name] ? 'IN_CADENCE' : 'LATE'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono text-[#d4af37]">{mounted ? `${agent.responseMs} ms` : '—'}</td>
                  <td className="py-3.5 text-right font-mono text-gray-300">{agent.success24h}%</td>
                  <td className="py-3.5 text-right font-mono text-emerald-400">{agent.uptime30d}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
