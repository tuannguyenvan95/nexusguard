'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { useIsClient } from '@/hooks/useIsClient'

type SlaStatus = 'compliant' | 'risk' | 'breached'

interface UptimeNode {
  name: string
  uptime24: number
  uptime7d: number
  response: number
  sla: SlaStatus
  // Per-hour health for the last 24h (true = up, false = degraded/outage)
  hours: boolean[]
}

// Build the last-24h hourly health map. degradedCount places that many red hours
// so the bar visualization stays consistent with the stated SLA status.
function buildHours(seed: number, degradedCount: number): boolean[] {
  const hours = Array.from({ length: 24 }, () => true)
  for (let k = 0; k < degradedCount; k++) {
    hours[(seed + k * 7) % 24] = false
  }
  return hours
}

const seedNodes: UptimeNode[] = [
  { name: 'Escrow', uptime24: 99.96, uptime7d: 99.95, response: 118, sla: 'compliant', hours: buildHours(0, 0) },
  { name: 'Validator', uptime24: 99.82, uptime7d: 99.41, response: 342, sla: 'risk', hours: buildHours(4, 2) },
  { name: 'Compliance', uptime24: 100, uptime7d: 100, response: 96, sla: 'compliant', hours: buildHours(9, 0) },
  { name: 'Treasury', uptime24: 99.91, uptime7d: 99.87, response: 142, sla: 'compliant', hours: buildHours(13, 0) },
  { name: 'Guardian', uptime24: 99.89, uptime7d: 99.78, response: 203, sla: 'compliant', hours: buildHours(21, 1) },
]

const slaStyle: Record<SlaStatus, string> = {
  compliant: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  risk: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  breached: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const slaLabel: Record<SlaStatus, string> = {
  compliant: 'COMPLIANT',
  risk: 'AT RISK',
  breached: 'BREACHED',
}

export function UptimeTracker() {
  const mounted = useIsClient()
  const [nodes, setNodes] = useState<UptimeNode[]>(seedNodes)

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          response: Math.max(40, n.response + Math.round((Math.random() - 0.5) * 10)),
          uptime24: Number(Math.min(100, Math.max(99.5, n.uptime24 + (Math.random() - 0.5) * 0.03)).toFixed(2)),
          hours: n.hours.map((h, i) => (i === n.hours.length - 1 ? Math.random() > 0.06 : h)),
        }))
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d4af37]"></span>
          Uptime & SLA
        </h3>
        <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.SLA.06</div>
      </div>

      <div className="space-y-4">
        {nodes.map((node) => (
          <div key={node.name} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-gray-600" />
                <span className="text-[11px] font-bold text-white uppercase tracking-widest font-mono">{node.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-gray-500 hidden sm:inline">24H <span className="text-white">{mounted ? `${node.uptime24}%` : '—'}</span></span>
                <span className="text-gray-500 hidden sm:inline">7D <span className="text-white">{node.uptime7d}%</span></span>
                <span className="text-gray-500 hidden sm:inline">RESP <span className="text-[#d4af37]">{mounted ? `${node.response}ms` : '—'}</span></span>
                <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold tracking-widest ${slaStyle[node.sla]}`}>
                  {slaLabel[node.sla]}
                </span>
              </div>
            </div>
            {/* 24h segmented bar */}
            <div className="flex gap-[2px] items-center" title="Last 24 hours">
              {node.hours.map((up, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-[2px] transition-colors ${
                    up ? 'bg-emerald-500/60 group-hover:bg-emerald-400/80' : 'bg-red-500/70 group-hover:bg-red-400'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
        <span className="text-gray-500">SLA Target</span>
        <span className="text-[#d4af37]">≥ 99.9% / 30D</span>
      </div>
    </div>
  )
}
