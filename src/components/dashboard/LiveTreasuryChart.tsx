'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export function LiveTreasuryChart() {
  const [data, setData] = useState<{ time: string; balance: number }[]>([])

  // Generate initial data
  useEffect(() => {
    const initialData = []
    let currentBalance = 124500
    for (let i = 20; i >= 0; i--) {
      const d = new Date()
      d.setSeconds(d.getSeconds() - i * 5)
      initialData.push({
        time: d.toLocaleTimeString([], { hour12: false }),
        balance: currentBalance
      })
      currentBalance += (Math.random() - 0.4) * 1000 // Slight upward trend
    }
    setData(initialData)
  }, [])

  // Stream new data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newBalance = prev[prev.length - 1].balance + (Math.random() - 0.4) * 500
        const d = new Date()
        return [
          ...prev.slice(1),
          {
            time: d.toLocaleTimeString([], { hour12: false }),
            balance: Number(newBalance.toFixed(2))
          }
        ]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full relative group">
      <div className="absolute inset-0 z-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={10} 
              tickMargin={10} 
              minTickGap={30}
              tick={{ fontFamily: 'monospace' }}
            />
            <YAxis 
              domain={['dataMin - 1000', 'dataMax + 1000']} 
              hide 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(3, 7, 18, 0.9)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '2px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#d4af37' }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#d4af37"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBalance)"
              isAnimationActive={false} // Disable default animation for smoother manual streaming
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#030712]/80 border border-[#d4af37]/30 px-3 py-1.5 rounded-sm z-10 pointer-events-none">
        <div className="w-1.5 h-1.5 bg-[#d4af37] animate-pulse"></div>
        <span className="text-[#d4af37] text-xs font-mono">LIVE FEED / STABLE</span>
      </div>
    </div>
  )
}
