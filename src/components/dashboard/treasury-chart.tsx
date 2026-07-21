'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TreasuryChart() {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    // Generate mock data: 30 days of balances
    const mockData = Array.from({ length: 30 }, (_, i) => {
      // Start around 15000, trend upwards roughly to 25000
      const base = 15000 + (i * 300);
      const randomVariance = Math.floor(Math.random() * 2000) - 1000;
      return base + randomVariance;
    });
    setData(mockData);
  }, []);

  if (data.length === 0) return null;

  const min = Math.min(...data) - 2000;
  const max = Math.max(...data) + 2000;
  const range = max - min;
  
  // Create SVG points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Create polygon for gradient
  const polygonPoints = `0,100 ${points} 100,100`;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Treasury Performance</h2>
      </div>

      <div className="flex-1 relative w-full pt-4 pb-8 pl-12 pr-4">
        {/* Y Axis Labels */}
        <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500 font-medium">
          <span>${(max/1000).toFixed(1)}k</span>
          <span>${((max + min)/2000).toFixed(1)}k</span>
          <span>${(min/1000).toFixed(1)}k</span>
        </div>

        <div className="w-full h-full relative">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59 130 246 / 0.3)" />
                <stop offset="100%" stopColor="rgb(59 130 246 / 0)" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

            <polygon points={polygonPoints} fill="url(#chart-gradient)" />
            <polyline 
              points={points} 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
            />
            
            {/* Current balance dot */}
            <circle 
              cx="100" 
              cy={100 - ((data[data.length - 1] - min) / range) * 100} 
              r="2" 
              fill="#fff" 
              className="drop-shadow-[0_0_10px_rgba(96,165,250,1)]"
            />
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="absolute left-12 right-4 bottom-0 flex justify-between text-xs text-gray-500 font-medium">
          <span>30d ago</span>
          <span>15d ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
