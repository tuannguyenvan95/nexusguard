'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrainCircuit, ShieldAlert, TerminalSquare } from 'lucide-react'

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('All')
  
  const mockJobs = [
    { id: 'job_001', title: 'Smart Contract Audit', amount: '5,000 USDC', status: 'Funded', provider: '0x123...abc', date: 'Oct 24, 2026', risk: 'LOW', agent: 'ESCROW NODE' },
    { id: 'job_002', title: 'Frontend Dashboard UI', amount: '2,500 USDC', status: 'Submitted', provider: '0x456...def', date: 'Oct 22, 2026', risk: 'MEDIUM', agent: 'ESCROW NODE' },
    { id: 'job_003', title: 'Subsquid Indexer Setup', amount: '1,200 USDC', status: 'Draft', provider: '--', date: 'Oct 26, 2026', risk: 'N/A', agent: 'PENDING...' },
    { id: 'job_004', title: 'Security Review Phase 1', amount: '8,000 USDC', status: 'Completed', provider: '0x789...ghi', date: 'Oct 15, 2026', risk: 'LOW', agent: 'GUARDIAN NODE' },
  ]

  const tabs = ['All', 'Draft', 'Funded', 'Submitted', 'Completed']

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Funded': return 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
      case 'Submitted': return 'text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_10px_rgba(192,132,252,0.2)]'
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
      case 'Draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'LOW': return 'text-emerald-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-red-400'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold mb-1 text-[#d4af37] uppercase tracking-tight">Jobs & Escrow_</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Manage ERC-8183 job contracts and automated escrows</p>
        </div>
        <Link 
          href="/dashboard/jobs/create"
          className="border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] px-5 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 group relative overflow-hidden"
        >
          {/* Scanline effect on hover */}
          <div className="absolute inset-0 w-full h-[1px] bg-[#d4af37]/50 -translate-y-full group-hover:animate-scanline" />
          <TerminalSquare className="w-4 h-4 group-hover:animate-pulse" /> 
          [+] INITIATE NEW CONTRACT
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-px">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all duration-300 relative ${
              activeTab === tab 
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,1)]" />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockJobs.filter(j => activeTab === 'All' || j.status === activeTab).map((job) => (
          <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block group">
            <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-sm p-6 hover:border-[#d4af37]/50 hover:bg-gray-900/60 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(212,175,55,0.08)] transition-all duration-300 relative flex flex-col h-full overflow-hidden">
              {/* Background Hash Log (Aesthetic) */}
              <div className="absolute top-2 right-4 text-[8px] font-mono text-gray-800 select-none opacity-20 pointer-events-none tracking-widest">
                TX: {Math.random().toString(36).substring(2, 15).toUpperCase()}
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] text-[#d4af37] font-mono tracking-widest mb-1.5 flex items-center gap-2">
                    <TerminalSquare className="w-3 h-3" />
                    ID: {job.id}
                  </div>
                  <h3 className="text-xl font-space-grotesk font-bold text-gray-200 group-hover:text-[#d4af37] transition-colors uppercase tracking-tight">{job.title}</h3>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border rounded-sm ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="bg-black/30 border border-gray-800/50 rounded-sm p-3 mb-6 flex justify-between items-center group-hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    <div>
                      <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">AI Escrow Agent</div>
                      <div className="text-[11px] font-bold text-gray-300 group-hover:text-purple-400 transition-colors uppercase tracking-widest">{job.agent}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1 justify-end">
                      <ShieldAlert className="w-3 h-3" /> Risk
                    </div>
                    <div className={`text-[11px] font-bold font-mono uppercase tracking-widest ${getRiskColor(job.risk)}`}>{job.risk}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-800 pt-4 mt-auto">
                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Budget</div>
                  <div className="font-mono text-[#d4af37] font-bold text-xs">{job.amount}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Provider</div>
                  <div className="text-gray-300 font-mono text-xs">{job.provider}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Due Date</div>
                  <div className="text-gray-300 font-mono text-xs">{job.date}</div>
                </div>
              </div>

              {/* Call to action on hover or based on status */}
              <div className={`mt-4 pt-4 border-t border-gray-800 flex justify-end ${job.status === 'Submitted' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                <span className={`text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 ${job.status === 'Submitted' ? 'text-purple-400' : 'text-[#d4af37]'}`}>
                  {job.status === 'Submitted' ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> CLICK TO VALIDATE DELIVERABLE &rarr;</>
                  ) : (
                    <>VIEW CONTRACT DETAILS &rarr;</>
                  )}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
