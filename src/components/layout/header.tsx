import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="w-full px-8 py-6 flex items-center justify-between bg-transparent">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full px-4 py-1.5 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          $12,450.00 USDC
        </div>

        <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-[1.05]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0e1a]" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg border-2 border-white/10 cursor-pointer hover:scale-105 transition-all duration-300">
          <span className="text-white font-bold text-sm">JD</span>
        </div>
      </div>
    </header>
  );
}
