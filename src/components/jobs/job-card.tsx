import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JobCardProps {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'review' | 'completed' | 'cancelled';
  budget: number;
  providerName: string;
  createdAt: string;
  expiresAt: string;
  milestones: { name: string; completed: boolean }[];
}

export function JobCard({ id, title, status, budget, providerName, createdAt, expiresAt, milestones }: JobCardProps) {
  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    review: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/20',
  };

  const statusLabels = {
    pending: 'Awaiting Acceptance',
    active: 'In Progress',
    review: 'In Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <Link href={`/dashboard/jobs/${id}`} className="block">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:bg-white/10 hover:border-blue-500/30 group">
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h3>
            <div className="flex items-center gap-2">
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", statusColors[status])}>
                {statusLabels[status]}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-emerald-400">${budget.toLocaleString()} <span className="text-sm font-medium text-emerald-500/70">USDC</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 shrink-0">
            <span className="text-white text-xs font-bold">{providerName.charAt(0)}</span>
          </div>
          <span className="text-sm text-gray-300">{providerName}</span>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress ({completedCount}/{milestones.length})</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {createdAt}</span>
          </div>
          {status !== 'completed' && status !== 'cancelled' && (
            <div className="flex items-center gap-1.5 text-amber-500/80">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires {expiresAt}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
