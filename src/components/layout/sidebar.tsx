'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Wallet, Bot, FileText, LogOut, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Treasury', href: '/dashboard/treasury', icon: Wallet },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'Faucet', href: '/dashboard/faucet', icon: Droplets },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0a0e1a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">⬡</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">NexusGuard</h1>
            <p className="text-gray-500 text-xs font-medium">Agentic Treasury OS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                isActive 
                  ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 hover:scale-[1.02]"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 group cursor-pointer mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-bold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">John Doe</p>
            <p className="text-gray-500 text-xs truncate">john@evotrade.io</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
