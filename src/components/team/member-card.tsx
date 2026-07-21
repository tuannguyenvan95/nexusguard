import { Briefcase, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MemberCardProps {
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Contractor';
  walletAddress: string;
  reputationScore: number;
  jobsCompleted: number;
  isOnline?: boolean;
}

export function MemberCard({ name, email, role, walletAddress, reputationScore, jobsCompleted, isOnline = false }: MemberCardProps) {
  const roleColors = {
    Admin: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    Member: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    Contractor: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  };

  const truncateWallet = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Calculate SVG stroke dasharray for the reputation ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (reputationScore / 100) * circumference;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group">
      
      <div className="flex items-start justify-between mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {initials}
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0e1a] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", roleColors[role])}>
          {role}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1 truncate">{name}</h3>
        <p className="text-gray-400 text-sm truncate mb-3">{email}</p>
        <div className="inline-block bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono">
          {truncateWallet(walletAddress)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
        <div className="flex flex-col items-center justify-center bg-black/20 rounded-xl p-3">
          <div className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Jobs</div>
          <div className="text-xl font-bold text-white">{jobsCompleted}</div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-black/20 rounded-xl p-3 relative">
          <div className="text-gray-400 text-xs font-medium mb-1 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Rep</div>
          
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke={reputationScore >= 80 ? '#34d399' : reputationScore >= 50 ? '#fbbf24' : '#ef4444'}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </svg>
            <span className="absolute text-sm font-bold text-white">{reputationScore}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
