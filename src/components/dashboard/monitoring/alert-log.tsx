'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Bell } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { pushNotification } from '@/lib/monitoring/notifications'

type Severity = 'critical' | 'warning' | 'info'

interface Alert {
  id: number
  time: string
  severity: Severity
  source: string
  message: string
  acked: boolean
}

const seedAlerts: Alert[] = [
  { id: 5, time: '10:47:28', severity: 'critical', source: 'GUARDIAN_NODE', message: 'Suspicious IP pattern flagged on login attempt', acked: false },
  { id: 4, time: '10:41:03', severity: 'warning', source: 'VALIDATOR_NODE', message: 'Deliverable score fell below 80% threshold', acked: false },
  { id: 3, time: '10:38:47', severity: 'info', source: 'ESCROW_NODE', message: 'New escrow locked · JOB_#007', acked: true },
  { id: 2, time: '09:58:12', severity: 'warning', source: 'TREASURY_NODE', message: 'Gas fee spike above configured limit', acked: true },
  { id: 1, time: '09:12:00', severity: 'info', source: 'COMPLIANCE_NODE', message: 'W-9 tax record generated for provider 0x456', acked: true },
]

const alertPool: Omit<Alert, 'id' | 'time' | 'acked'>[] = [
  { severity: 'warning', source: 'ESCROW_NODE', message: 'Retry (2/3) on milestone release broadcast' },
  { severity: 'info', source: 'TREASURY_NODE', message: 'APY rebalance executed on Arc pool' },
  { severity: 'critical', source: 'GUARDIAN_NODE', message: 'Transaction velocity anomaly detected' },
  { severity: 'info', source: 'VALIDATOR_NODE', message: 'Validation batch completed · 12 tasks' },
]

const severityStyle: Record<Severity, { badge: string; text: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { badge: 'border-red-500/30 bg-red-500/10', text: 'text-red-400', icon: AlertOctagon, label: 'CRITICAL' },
  warning: { badge: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-400', icon: AlertTriangle, label: 'WARNING' },
  info: { badge: 'border-blue-500/30 bg-blue-500/10', text: 'text-blue-400', icon: Info, label: 'INFO' },
}

function clockTime(): string {
  return new Date().toLocaleTimeString([], { hour12: false })
}

export function AlertLog() {
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts)
  const { playAlarm } = useAudio()

  useEffect(() => {
    let idCounter = seedAlerts.length + 1
    const interval = setInterval(() => {
      if (Math.random() < 0.5) {
        const pick = alertPool[Math.floor(Math.random() * alertPool.length)]
        const fresh: Alert = { ...pick, id: idCounter++, time: clockTime(), acked: false }
        // Sound + toast for new CRITICAL alerts.
        if (fresh.severity === 'critical') {
          playAlarm()
          pushNotification({
            kind: 'critical',
            title: 'Critical Alert',
            message: `${fresh.source} · ${fresh.message}`,
          })
        }
        setAlerts((prev) => [fresh, ...prev].slice(0, 12))
      }
    }, 6000)
    return () => clearInterval(interval)
  }, [playAlarm])

  const toggleAck = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acked: !a.acked } : a)))
  }

  const openCount = alerts.filter((a) => !a.acked).length

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 animate-pulse"></span>
          Alert & Incident Log
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-sm">
            <Bell className="w-3 h-3" />
            {openCount} OPEN
          </div>
          <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.ALT.05</div>
        </div>
      </div>

      <div className="space-y-2 max-h-[430px] overflow-y-auto custom-scrollbar pr-1">
        {alerts.map((alert) => {
          const style = severityStyle[alert.severity]
          const Icon = style.icon
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-sm border transition-all duration-300 ${
                alert.acked
                  ? 'border-gray-800 bg-gray-900/30 opacity-50'
                  : 'border-gray-700 bg-gray-900/50 hover:border-[#d4af37]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 shrink-0 rounded-sm border flex items-center justify-center ${style.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold tracking-widest font-mono ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{alert.source}</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-600 whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleAck(alert.id)}
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm border transition-colors flex items-center gap-1 ${
                        alert.acked
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {alert.acked ? 'ACKNOWLEDGED' : 'ACK'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
