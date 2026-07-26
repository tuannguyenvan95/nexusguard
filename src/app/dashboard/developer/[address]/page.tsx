'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Cpu, Code2, Users, Briefcase, Activity, Trophy, Medal } from 'lucide-react'
import Link from 'next/link'

export default function DeveloperProfilePage() {
  const router = useRouter()
  const params = useParams()
  const devName = decodeURIComponent(params.address as string)
  
  // Mock data for the demo
  const devInfo = {
    name: devName,
    avatar: `https://i.pravatar.cc/150?u=${devName.toLowerCase()}`,
    wallet: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
    completed: Math.floor(Math.random() * 20) + 1,
    earned: (Math.random() * 50000 + 1000).toLocaleString('en-US', { maximumFractionDigits: 0 }),
    successRate: Math.floor(Math.random() * 15) + 85,
    badge: 'ELITE'
  }

  const mockJobs = [
    { id: 1, title: 'Smart Contract Audit for DeFi Protocol', amount: '5,000 USDC', status: 'Completed', date: '2 days ago' },
    { id: 2, title: 'Zero-Knowledge Proof Implementation', amount: '12,000 USDC', status: 'Completed', date: '1 week ago' },
    { id: 3, title: 'Frontend Integration for NFT Marketplace', amount: '3,500 USDC', status: 'In Progress', date: 'Just now' }
  ]

  return (
    <div className="space-y-8 font-mono">
      <button 
        onClick={() => router.back()}
        className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Dev Info Card */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="glass p-6 rounded-sm relative text-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-400/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-400/50" />
            
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full mb-4 border-2 border-purple-400/50 overflow-hidden">
              <img src={devInfo.avatar} alt={devInfo.name} className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-space-grotesk font-bold text-white uppercase flex items-center justify-center gap-2 mb-1">
              {devInfo.name}
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </h1>
            
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">ID: {devInfo.wallet}</p>
            
            <div className="inline-block px-3 py-1 bg-purple-400/10 border border-purple-400/30 text-purple-400 rounded-sm font-bold text-sm mb-6 flex items-center gap-2 mx-auto w-max">
              <Trophy className="w-4 h-4" />
              {devInfo.badge} HUNTER
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-gray-900/50 p-3 rounded-sm border border-gray-800/50">
                <div className="text-[10px] text-gray-500 uppercase">Jobs Done</div>
                <div className="text-lg font-bold text-white">{devInfo.completed}</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-sm border border-gray-800/50">
                <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                <div className="text-lg font-bold text-emerald-400">{devInfo.successRate}%</div>
              </div>
              <div className="col-span-2 bg-gray-900/50 p-3 rounded-sm border border-gray-800/50">
                <div className="text-[10px] text-gray-500 uppercase">Total Earned</div>
                <div className="text-xl font-bold text-[#d4af37]">{devInfo.earned} USDC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Work History */}
        <div className="flex-1 space-y-6">
          <div className="glass p-6 rounded-sm relative">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gray-700" />
            
            <h2 className="text-xl font-space-grotesk font-bold text-white uppercase flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
              <Code2 className="w-5 h-5 text-purple-400" />
              Work History
            </h2>

            <div className="space-y-4">
              {mockJobs.map(job => (
                <div key={job.id} className="bg-gray-900/40 border border-gray-800/50 p-4 rounded-sm flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-200 mb-1">{job.title}</div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${
                        job.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 
                        'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-[10px] text-gray-500">{job.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#d4af37]">{job.amount}</div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  )
}
