'use client';

import { Bot, Shield, Lock, CheckSquare, Wallet, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentStatus() {
  const agents = [
    { name: 'Guardian', type: 'Security', status: 'active', icon: Shield, color: 'blue', lastAction: '2 mins ago' },
    { name: 'Escrow', type: 'Payments', status: 'active', icon: Lock, color: 'emerald', lastAction: '1 hr ago' },
    { name: 'Validator', type: 'Quality', status: 'idle', icon: CheckSquare, color: 'purple', lastAction: '3 hrs ago' },
    { name: 'Treasury', type: 'Finance', status: 'active', icon: Wallet, color: 'amber', lastAction: '10 mins ago' },
    { name: 'Compliance', type: 'Legal', status: 'idle', icon: FileText, color: 'cyan', lastAction: '1 day ago' },
  ];

  const colorStyles = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">AI Agent Network</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isActive = agent.status === 'active';
          
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 cursor-default group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={cn("p-2.5 rounded-lg", colorStyles[agent.color as keyof typeof colorStyles])}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                  <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" : "bg-gray-500")} />
                  <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">{agent.status}</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-white font-bold mb-0.5">{agent.name}</h3>
                <p className="text-gray-400 text-xs mb-3">{agent.type}</p>
                <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>Last Action:</span>
                  <span className="text-gray-400">{agent.lastAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
