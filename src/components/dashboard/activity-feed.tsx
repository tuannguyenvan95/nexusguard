'use client';

import { Clock, Briefcase, DollarSign, Upload, CheckCircle, ArrowUpRight, Bot, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
  const activities = [
    { id: 1, type: 'job_created', title: 'New Job Created', desc: 'Smart Contract Audit posted by Admin', time: '10 mins ago', color: 'blue', icon: Briefcase, tx: '#' },
    { id: 2, type: 'job_funded', title: 'Job Funded', desc: '5,000 USDC locked in Escrow', time: '1 hour ago', color: 'amber', icon: DollarSign, tx: '#' },
    { id: 3, type: 'deliverable_submitted', title: 'Deliverable Submitted', desc: 'Audit report v1 uploaded by Alice', time: '3 hours ago', color: 'purple', icon: Upload },
    { id: 4, type: 'agent_registered', title: 'Agent Deployed', desc: 'Validator Bot initialized', time: '5 hours ago', color: 'blue', icon: Bot, tx: '#' },
    { id: 5, type: 'job_completed', title: 'Job Completed', desc: 'Frontend Redesign approved', time: '1 day ago', color: 'emerald', icon: CheckCircle },
    { id: 6, type: 'payment_sent', title: 'Payment Sent', desc: '2,500 USDC released to Bob', time: '1 day ago', color: 'emerald', icon: ArrowUpRight, tx: '#' },
    { id: 7, type: 'deliverable_submitted', title: 'Deliverable Submitted', desc: 'Design tokens uploaded', time: '2 days ago', color: 'purple', icon: Upload },
    { id: 8, type: 'job_funded', title: 'Job Funded', desc: '1,200 USDC locked in Escrow', time: '2 days ago', color: 'amber', icon: DollarSign, tx: '#' },
  ];

  const colorStyles = {
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {activities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative">
              {idx !== activities.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-[-16px] w-[2px] bg-white/5 rounded" />
              )}
              <div className="flex gap-4 group transition-all duration-300 hover:bg-white/5 p-2 -mx-2 rounded-xl">
                <div className={cn("relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg", colorStyles[item.color as keyof typeof colorStyles])}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-white font-medium truncate">{item.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-400 truncate">{item.desc}</p>
                    {item.tx && (
                      <a href={item.tx} className="text-gray-500 hover:text-blue-400 transition-colors p-1" title="View Transaction">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
