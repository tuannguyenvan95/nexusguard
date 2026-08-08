'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Zap, Lock, Unlock, Coins } from 'lucide-react'

type TxType = 'M2M_PAY' | 'PAYOUT' | 'ESCROW_LOCK' | 'ESCROW_RELEASE' | 'GAS'

interface Tx {
  id: number
  time: string
  route: string
  amount: string
  type: TxType
  status: 'CONFIRMED' | 'PENDING'
  hash: string
}

const seedTxs: Tx[] = [
  { id: 7, time: '10:47:02', route: 'TREASURY → PROVIDER_0x456', amount: '2,500.00', type: 'PAYOUT', status: 'CONFIRMED', hash: '0x7c2d…a9f1' },
  { id: 6, time: '10:46:41', route: 'GUARDIAN → VALIDATOR', amount: '0.42', type: 'M2M_PAY', status: 'CONFIRMED', hash: '0xbb90…33ee' },
  { id: 5, time: '10:46:10', route: 'CLIENT → ESCROW · JOB-007', amount: '1,200.00', type: 'ESCROW_LOCK', status: 'CONFIRMED', hash: '0x9f3a…e21c' },
  { id: 4, time: '10:45:55', route: 'ESCROW → PROVIDER_0x1a2', amount: '800.00', type: 'ESCROW_RELEASE', status: 'CONFIRMED', hash: '0x5b91…7d0e' },
  { id: 3, time: '10:45:30', route: 'COMPLIANCE → TREASURY', amount: '0.18', type: 'M2M_PAY', status: 'CONFIRMED', hash: '0xd41e…9c02' },
  { id: 2, time: '10:44:58', route: 'ESCROW → GUARDIAN', amount: '0.06', type: 'GAS', status: 'CONFIRMED', hash: '0x77ab…12df' },
  { id: 1, time: '10:44:12', route: 'ESCROW → PROVIDER_0x6d8', amount: '1,150.00', type: 'ESCROW_RELEASE', status: 'PENDING', hash: '0x1f77…c05e' },
]

const txPool: Omit<Tx, 'id' | 'time' | 'status'>[] = [
  { route: 'TREASURY → VALIDATOR', amount: '0.31', type: 'M2M_PAY', hash: '0x3a88…f0b6' },
  { route: 'CLIENT → ESCROW · JOB-008', amount: '900.00', type: 'ESCROW_LOCK', hash: '0x8f11…b4c7' },
  { route: 'ESCROW → PROVIDER_0x9e2', amount: '600.00', type: 'ESCROW_RELEASE', hash: '0xaa33…90d1' },
  { route: 'GUARDIAN → COMPLIANCE', amount: '0.09', type: 'M2M_PAY', hash: '0x6e20…c8f4' },
  { route: 'ESCROW → PROVIDER_0x1a2', amount: '250.00', type: 'ESCROW_RELEASE', hash: '0x51be…2da9' },
]

const typeStyle: Record<TxType, { badge: string; icon: typeof Zap }> = {
  M2M_PAY: { badge: 'border-purple-500/30 bg-purple-500/10 text-purple-400', icon: Zap },
  PAYOUT: { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', icon: ArrowUpRight },
  ESCROW_LOCK: { badge: 'border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]', icon: Lock },
  ESCROW_RELEASE: { badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400', icon: Unlock },
  GAS: { badge: 'border-gray-600/30 bg-gray-600/10 text-gray-400', icon: Coins },
}

function clockTime(): string {
  return new Date().toLocaleTimeString([], { hour12: false })
}

export function TransactionMonitor() {
  const [txs, setTxs] = useState<Tx[]>(seedTxs)

  useEffect(() => {
    let idCounter = seedTxs.length + 1
    const interval = setInterval(() => {
      const pick = txPool[Math.floor(Math.random() * txPool.length)]
      const fresh: Tx = {
        ...pick,
        id: idCounter++,
        time: clockTime(),
        status: Math.random() < 0.15 ? 'PENDING' : 'CONFIRMED',
      }
      setTxs((prev) => [fresh, ...prev].slice(0, 10))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass glass-hover p-6 rounded-sm relative h-full">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d4af37] animate-pulse"></span>
          Settlement Monitor
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
          <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">MON.TX.04</div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
              <th className="pb-3 font-bold w-20">Time</th>
              <th className="pb-3 font-bold">Route</th>
              <th className="pb-3 font-bold text-right">Amount (USDC)</th>
              <th className="pb-3 font-bold">Type</th>
              <th className="pb-3 font-bold">Status</th>
              <th className="pb-3 font-bold text-right">Tx Hash</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {txs.map((tx) => {
              const style = typeStyle[tx.type]
              const Icon = style.icon
              return (
                <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-[#d4af37]/5 transition-colors">
                  <td className="py-3.5 text-gray-500 font-mono">{tx.time}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                      <ArrowDownLeft className="w-3 h-3 text-gray-600" />
                      {tx.route}
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-white">
                    ${tx.amount}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm border text-[10px] font-bold tracking-wider ${style.badge}`}>
                      <Icon className="w-3 h-3" />
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {tx.status === 'CONFIRMED' ? (
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        CONFIRMED
                      </span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    <a href="#" className="text-[#d4af37] hover:text-white hover:underline transition-colors">{tx.hash}</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
