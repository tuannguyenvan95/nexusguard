'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrainCircuit, ShieldAlert, TerminalSquare, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getEthereumProvider } from '@/lib/ethereum'

interface JobRow {
  id: string;
  title: string;
  amount: string;
  status: string;
  provider: string;
  date: string;
  risk: string;
  agent: string;
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [localJobs, setLocalJobs] = useState<JobRow[]>([])
  const [currentWallet, setCurrentWallet] = useState('')
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentName, setCurrentName] = useState('NEXUS CLIENT')

  useEffect(() => {
    async function fetchJobs() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('nexus_jobs').select('*').order('created_at', { ascending: false })
        if (data && !error) {
          setLocalJobs(data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    async function fetchUser() {
      let address = localStorage.getItem('nexusguard_wallet')
      if (!address && typeof window !== 'undefined') {
        const ethereum = getEthereumProvider()
        if (ethereum) {
          try {
            const accounts = (await ethereum.request({ method: 'eth_accounts' })) as string[]
            if (accounts && accounts.length > 0) address = accounts[0]
          } catch {}
        }
      }
      if (address) setCurrentWallet(address.toLowerCase())
      
      setCurrentAvatar(localStorage.getItem('nexusguard_avatar'))
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User')
      }
    }
    
    fetchJobs()
    fetchUser()
  }, [])
  
  const mockJobs = [
    { id: 'job_001', title: 'Smart Contract Audit', amount: '5,000 USDC', status: 'Open', provider: '0x123...abc', date: 'Oct 24, 2026', risk: 'LOW', agent: 'ESCROW NODE' },
    { id: 'job_002', title: 'Frontend Dashboard UI', amount: '2,500 USDC', status: 'Submitted', provider: '0x456...def', date: 'Oct 22, 2026', risk: 'MEDIUM', agent: 'ESCROW NODE' },
    { id: 'job_003', title: 'Subsquid Indexer Setup', amount: '1,200 USDC', status: 'Draft', provider: '--', date: 'Oct 26, 2026', risk: 'N/A', agent: 'PENDING...' },
    { id: 'job_004', title: 'Security Review Phase 1', amount: '8,000 USDC', status: 'Completed', provider: '0x789...ghi', date: 'Oct 15, 2026', risk: 'LOW', agent: 'GUARDIAN NODE' },
  ]

  const tabs = ['All', 'Open', 'Draft', 'Funded', 'Submitted', 'Completed']

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.2)]'
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

  // Deterministic fake tx hash per job (stable across renders — Math.random
  // in JSX would flicker on every re-render).
  const jobTxHash = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(8, '0').toUpperCase() + (id.length * 7919).toString(16).toUpperCase().padStart(4, '0');
  }

  const getProviderInfo = (providerStr: string) => {
    if (!providerStr || providerStr === '--') return { name: 'UNKNOWN', avatar: null };
    
    // Check if it's a JSON string
    try {
      if (providerStr.startsWith('{')) {
        const data = JSON.parse(providerStr);
        return { name: data.name || data.address || 'UNKNOWN', avatar: data.avatar || null };
      }
    } catch {
      // Ignore and fallback
    }

    const pLow = providerStr.toLowerCase();
    
    // Check if it's the current user (fallback for old jobs)
    if (currentWallet && (pLow === currentWallet || pLow.includes(currentWallet.substring(0, 6).toLowerCase()))) {
      return { name: currentName, avatar: currentAvatar };
    }
    
    // Mock other companies
    if (pLow.includes('0x123')) return { name: 'ACME NETWORK', avatar: 'https://i.pravatar.cc/150?u=acme' };
    if (pLow.includes('0x456')) return { name: 'NEXUS LABS', avatar: 'https://i.pravatar.cc/150?u=nexus' };
    if (pLow.includes('0x789')) return { name: 'CYBER SECURITY LLC', avatar: 'https://i.pravatar.cc/150?u=cyber' };
    
    return { name: providerStr.length > 15 ? `${providerStr.substring(0, 6)}...${providerStr.substring(providerStr.length - 4)}` : providerStr, avatar: null };
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-px">
        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all duration-300 relative whitespace-nowrap ${
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

        {/* Search Bar */}
        <div className="relative w-full md:w-64 pb-2 md:pb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none md:pb-0 pb-2">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="SEARCH JOBS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-gray-800 focus:border-[#d4af37]/50 rounded-sm py-2 pl-10 pr-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...localJobs, ...mockJobs.filter(mj => !localJobs.some(lj => lj.id === mj.id || lj.title === mj.title))]
          .filter(j => activeTab === 'All' ? true : j.status === activeTab)
          .filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.id.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((job) => {
            const providerInfo = getProviderInfo(job.provider)
            
            return (
            <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block group">
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-sm p-6 hover:border-[#d4af37]/50 hover:bg-gray-900/60 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(212,175,55,0.08)] transition-all duration-300 relative flex flex-col h-full overflow-hidden">
                {/* Background Hash Log (Aesthetic) */}
                <div className="absolute top-2 right-4 text-[8px] font-mono text-gray-800 select-none opacity-20 pointer-events-none tracking-widest">
                  TX: {jobTxHash(job.id)}
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      {/* Provider Logo / Avatar */}
                      <div className="relative w-8 h-8 rounded-sm bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
                        {providerInfo.avatar ? (
                          <Image src={providerInfo.avatar} alt={providerInfo.name} fill sizes="32px" className="object-cover" />
                        ) : (
                          <span className="text-[#d4af37] font-bold font-space-grotesk">{providerInfo.name ? providerInfo.name.charAt(0).toUpperCase() : 'N'}</span>
                        )}
                      </div>
                      {/* Provider Name and Job ID */}
                      <div className="flex flex-col">
                        <div className="text-[11px] text-gray-300 font-bold font-mono tracking-widest uppercase">
                          {providerInfo.name}
                        </div>
                        <div className="text-[9px] text-[#d4af37] font-mono tracking-widest flex items-center gap-1 mt-0.5">
                          <TerminalSquare className="w-2.5 h-2.5" />
                          ID: {job.id}
                        </div>
                      </div>
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

              <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4 mt-auto">
                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Budget</div>
                  <div className="font-mono text-[#d4af37] font-bold text-xs">{job.amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">Due Date</div>
                  <div className="text-gray-300 font-mono text-xs">{job.date}</div>
                </div>
              </div>

              {/* Call to action on hover or based on status */}
              <div className={`mt-4 pt-4 border-t border-gray-800 flex justify-end ${job.status === 'Submitted' || job.status === 'Open' || job.status === 'Funded' || job.status === 'In Progress' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                <span className={`text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 ${job.status === 'Submitted' ? 'text-purple-400' : (job.status === 'Open' || job.status === 'Funded' || job.status === 'In Progress') ? 'text-blue-400' : 'text-[#d4af37]'}`}>
                  {job.status === 'Submitted' ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> CLICK TO VALIDATE DELIVERABLE &rarr;</>
                  ) : (job.status === 'Open' || job.status === 'Funded' || job.status === 'In Progress') ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> APPLY FOR JOB &rarr;</>
                  ) : (
                    <>VIEW CONTRACT DETAILS &rarr;</>
                  )}
                </span>
              </div>
            </div>
            </Link>
            )
          })}
      </div>
    </div>
  )
}
