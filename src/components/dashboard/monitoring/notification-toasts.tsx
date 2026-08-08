'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertOctagon, WifiOff, X } from 'lucide-react'
import { useIsClient } from '@/hooks/useIsClient'
import { subscribeNotifications, type MonitorNotification } from '@/lib/monitoring/notifications'

const TOAST_TTL_MS = 7000

const kindStyle: Record<MonitorNotification['kind'], { border: string; icon: typeof AlertOctagon; iconColor: string }> = {
  critical: { border: 'border-red-500/50', icon: AlertOctagon, iconColor: 'text-red-400' },
  offline: { border: 'border-amber-500/50', icon: WifiOff, iconColor: 'text-amber-400' },
  warning: { border: 'border-amber-500/40', icon: AlertOctagon, iconColor: 'text-amber-400' },
}

export function NotificationToasts() {
  const mounted = useIsClient()
  const [toasts, setToasts] = useState<MonitorNotification[]>([])

  useEffect(() => {
    const unsubscribe = subscribeNotifications((notification) => {
      setToasts((prev) => [...prev.slice(-4), notification])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notification.id))
      }, TOAST_TTL_MS)
    })
    return unsubscribe
  }, [])

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-20 right-4 z-[90] flex flex-col gap-3 w-[320px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const style = kindStyle[toast.kind]
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#0a0e1a]/95 backdrop-blur-md border rounded-sm p-4 relative animate-fade-in-up shadow-2xl ${style.border}`}
            style={{ boxShadow: '0 0 25px rgba(0,0,0,0.5)' }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current text-red-500/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current text-red-500/40" />

            <button
              onClick={() => dismiss(toast.id)}
              className="absolute top-3 right-3 text-gray-600 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-4">
              <div className={`w-9 h-9 shrink-0 rounded-sm border border-current/30 bg-black/40 flex items-center justify-center ${style.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${style.iconColor}`}>
                    {toast.kind.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">{toast.time}</span>
                </div>
                <div className="text-sm font-bold text-white font-space-grotesk uppercase tracking-tight">{toast.title}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
