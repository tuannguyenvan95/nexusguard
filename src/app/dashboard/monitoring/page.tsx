'use client'

import { motion, Variants } from 'framer-motion'
import { Activity, Radio } from 'lucide-react'
import { NetworkStatus } from '@/components/dashboard/monitoring/network-status'
import { AgentHealth } from '@/components/dashboard/monitoring/agent-health'
import { EscrowMonitor } from '@/components/dashboard/monitoring/escrow-monitor'
import { TransactionMonitor } from '@/components/dashboard/monitoring/transaction-monitor'
import { AlertLog } from '@/components/dashboard/monitoring/alert-log'
import { UptimeTracker } from '@/components/dashboard/monitoring/uptime-tracker'
import { MonitoringSummary } from '@/components/dashboard/monitoring/monitoring-summary'
import { NotificationToasts } from '@/components/dashboard/monitoring/notification-toasts'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function MonitoringPage() {
  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-1 flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#d4af37]" />
            System_Monitor
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Live infrastructure, agent & contract telemetry</p>
        </div>
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 rounded-sm">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">Telemetry Streaming</span>
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div variants={itemVariants}>
        <MonitoringSummary />
      </motion.div>

      {/* Row 1: Network + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <NetworkStatus />
        </motion.div>
        <motion.div variants={itemVariants}>
          <UptimeTracker />
        </motion.div>
      </div>

      {/* Row 2: Agent heartbeat + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AgentHealth />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AlertLog />
        </motion.div>
      </div>

      {/* Row 3: Escrow + Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <EscrowMonitor />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <TransactionMonitor />
        </motion.div>
      </div>

      {/* Sound + notification toasts for critical alerts / offline agents */}
      <NotificationToasts />
    </motion.div>
  )
}
