'use client'

import { useState, useEffect } from 'react'
import { motion, Variants } from 'framer-motion'
import { Trophy, TrendingUp, Users, Target, ShieldCheck, Briefcase, Code } from 'lucide-react'
import Link from 'next/link'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

const TOP_PROVIDERS = [
  { rank: 1, name: 'NEXUS LABS', address: '0x456', jobs: 24, volume: '85,000 USDC', avatar: 'https://i.pravatar.cc/150?u=nexus' },
  { rank: 2, name: 'CYBER SECURITY LLC', address: '0x789', jobs: 15, volume: '42,500 USDC', avatar: 'https://i.pravatar.cc/150?u=cyber' },
  { rank: 3, name: 'ACME NETWORK', address: '0x123', jobs: 8, volume: '18,200 USDC', avatar: 'https://i.pravatar.cc/150?u=acme' },
  { rank: 4, name: 'QUANTUM PROTOCOL', address: '0xabc', jobs: 5, volume: '12,000 USDC', avatar: 'https://i.pravatar.cc/150?u=quantum' },
  { rank: 5, name: 'ZEROKNOWLEDGE DAO', address: '0xdef', jobs: 3, volume: '9,500 USDC', avatar: 'https://i.pravatar.cc/150?u=zk' }
]

const TOP_DEVELOPERS = [
  { rank: 1, name: 'ALICE_AUDIT', address: '0xaa1...f9a', completed: 18, earned: '45,000 USDC', successRate: 100, badge: 'ELITE', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { rank: 2, name: 'BOB_BUILDER', address: '0xbb2...e8b', completed: 12, earned: '28,500 USDC', successRate: 98, badge: 'EXPERT', avatar: 'https://i.pravatar.cc/150?u=bob' },
  { rank: 3, name: 'CHARLIE_CODE', address: '0xcc3...d7c', completed: 9, earned: '19,200 USDC', successRate: 95, badge: 'PRO', avatar: 'https://i.pravatar.cc/150?u=charlie' },
  { rank: 4, name: 'DAVE_DEV', address: '0xdd4...c6d', completed: 7, earned: '15,000 USDC', successRate: 100, badge: 'PRO', avatar: 'https://i.pravatar.cc/150?u=dave' },
  { rank: 5, name: 'EVE_EXPLOIT', address: '0xee5...b5e', completed: 4, earned: '8,500 USDC', successRate: 90, badge: 'RISING', avatar: 'https://i.pravatar.cc/150?u=eve' }
]

export default function LeaderboardPage() {
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-space-grotesk font-bold mb-1 text-[#d4af37] tracking-tight uppercase flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Hall of Fame_
          </h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Network Leaders & Top Performers</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-sm flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase">Total Network Volume</div>
              <div className="text-sm font-bold text-white font-mono">190,700 USDC</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Providers */}
        <motion.div variants={itemVariants} className="glass p-6 rounded-sm relative group">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-800/50 pb-4">
            <h2 className="text-xl font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#d4af37]" />
              Top Providers
            </h2>
            <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">RANKING.PRV.01</div>
          </div>

          <div className="space-y-3">
            {TOP_PROVIDERS.map((provider) => (
              <Link href={`/dashboard/provider/${encodeURIComponent(provider.name)}`} key={provider.rank} className="block group/row">
                <div className="bg-gray-900/40 border border-gray-800/50 p-4 rounded-sm flex items-center gap-4 group-hover/row:border-[#d4af37]/50 group-hover/row:bg-[#d4af37]/5 transition-all cursor-pointer relative overflow-hidden">
                  
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-space-grotesk font-bold text-lg rounded-sm border ${provider.rank === 1 ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : provider.rank === 2 ? 'bg-gray-300/20 border-gray-400 text-gray-300' : provider.rank === 3 ? 'bg-orange-400/20 border-orange-500 text-orange-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    {provider.rank}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-sm bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                      <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-gray-200 group-hover/row:text-[#d4af37] transition-colors truncate">{provider.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">ID: {provider.address}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-emerald-400">{provider.volume}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">{provider.jobs} Jobs Funded</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Top Developers */}
        <motion.div variants={itemVariants} className="glass p-6 rounded-sm relative group">
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#d4af37]/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#d4af37]/50" />
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-800/50 pb-4">
            <h2 className="text-xl font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" />
              Top Developers
            </h2>
            <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm bg-gray-900/50">RANKING.DEV.02</div>
          </div>

          <div className="space-y-3">
            {TOP_DEVELOPERS.map((dev) => (
              <Link href={`/dashboard/developer/${encodeURIComponent(dev.name)}`} key={dev.rank} className="block group/row">
                <div className="bg-gray-900/40 border border-gray-800/50 p-4 rounded-sm flex items-center gap-4 group-hover/row:border-purple-400/50 group-hover/row:bg-purple-400/5 transition-all cursor-pointer relative overflow-hidden">
                  
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-space-grotesk font-bold text-lg rounded-sm border ${dev.rank === 1 ? 'bg-purple-400/20 border-purple-400 text-purple-400' : dev.rank === 2 ? 'bg-gray-300/20 border-gray-400 text-gray-300' : dev.rank === 3 ? 'bg-orange-400/20 border-orange-500 text-orange-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    {dev.rank}
                  </div>

                  {/* Avatar, Name & Badge */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-sm bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                      <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-200 group-hover/row:text-purple-400 transition-colors truncate">{dev.name}</div>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded-sm font-mono">{dev.badge}</div>
                        <div className="text-[9px] text-gray-500 font-mono">{dev.address}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-[#d4af37]">{dev.earned}</div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="text-[9px] text-gray-500 font-mono uppercase">{dev.completed} Jobs</div>
                      <div className="w-1 h-1 rounded-full bg-gray-700" />
                      <div className="text-[9px] text-emerald-400 font-mono uppercase">{dev.successRate}% SR</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  )
}
