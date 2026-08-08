'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Gauge, ShieldCheck } from 'lucide-react'
import { useIsClient } from '@/hooks/useIsClient'

export function MonitoringSummary() {
  const mounted = useIsClient()
  const [latency, setLatency] = useState(38)
  const [checksPassing, setChecksPassing] = useState(28)
  const [openAlerts, setOpenAlerts] = useState(2)

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(38 + Math.round((Math.random() - 0.5) * 12))
      setChecksPassing((c) => {
        const drift = Math.random()
        if (drift > 0.92) return Math.min(30, c - 1)
        if (drift < 0.35) return Math.min(30, c + 1)
        return c
      })
      setOpenAlerts((a) => {
        const drift = Math.random()
        if (drift > 0.9) return Math.min(4, a + 1)
        if (drift < 0.5) return Math.max(1, a - 1)
        return a
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const summary = [
    { label: 'System Status', value: 'OPERATIONAL', sub: 'all nodes reporting', color: 'text-emerald-400', icon: ShieldCheck },
    { label: 'Active Alerts', value: mounted ? String(openAlerts) : '—', sub: 'guardian & validator', color: 'text-amber-400', icon: Bell },
    { label: 'Checks Passing', value: mounted ? `${checksPassing}/30` : '--/30', sub: 'automated probes', color: 'text-white', icon: CheckCircle2 },
    { label: 'Avg Latency', value: mounted ? `${latency} ms` : '--', sub: 'Arc RPC', color: 'text-[#d4af37]', icon: Gauge },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summary.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="glass glass-hover p-5 rounded-sm relative group">
            <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono">MON.SYS</div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </div>
            <div className={`text-xl font-space-grotesk font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider mt-1">{s.sub}</div>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]/50" />
          </div>
        )
      })}
    </div>
  )
}
