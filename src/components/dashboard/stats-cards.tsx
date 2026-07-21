'use client';

import { useEffect, useState } from 'react';
import { Wallet, Briefcase, Users, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsCards() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    {
      title: 'Treasury Balance',
      value: '$24,580.00',
      change: '+12.5%',
      isPositive: true,
      icon: Wallet,
      color: 'blue',
    },
    {
      title: 'Active Jobs',
      value: '8',
      change: '+3',
      isPositive: true,
      icon: Briefcase,
      color: 'emerald',
    },
    {
      title: 'Team Members',
      value: '12',
      change: '+2',
      isPositive: true,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Agent Actions',
      value: '147',
      change: '+24 today',
      isPositive: true,
      icon: Bot,
      color: 'amber',
    },
  ];

  const colorStyles = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/20 shadow-blue-500/5',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/20 shadow-purple-500/5',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-amber-500/5',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx}
            className={cn(
              "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/10 group cursor-default",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl transition-colors duration-300", colorStyles[stat.color as keyof typeof colorStyles])}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-emerald-400">
                {stat.change}
              </div>
            </div>
            
            <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300 transition-colors">{stat.title}</h3>
            <div className="text-3xl font-bold text-white tracking-tight">
              {mounted ? stat.value : '0'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
