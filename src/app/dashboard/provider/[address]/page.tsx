'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Cpu, Code2, Users, Briefcase, Activity } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'


export default function ProviderProfilePage({ params }: { params: { address: string } }) {
  const router = useRouter()
  const providerAddress = decodeURIComponent(params.address)
  
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [providerInfo, setProviderInfo] = useState({ name: 'UNKNOWN', avatar: '', totalSpent: 0, jobsCreated: 0, successRate: 100 })

  const [currentWallet, setCurrentWallet] = useState('')
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [currentName, setCurrentName] = useState('UNKNOWN')

  useEffect(() => {
    fetchProviderData()
  }, [providerAddress])

  const getProviderInfo = (providerStr: string) => {
    if (!providerStr || providerStr === '--') return { name: 'UNKNOWN', avatar: null };
    try {
      if (providerStr.startsWith('{')) {
        const data = JSON.parse(providerStr);
        return { name: data.name || data.address, avatar: data.avatar || null };
      }
    } catch (e) {}
    const pLow = providerStr.toLowerCase();
    if (currentWallet && (pLow === currentWallet || pLow.includes(currentWallet.substring(0, 6).toLowerCase()))) {
      return { name: currentName, avatar: currentAvatar };
    }
    if (pLow.includes('0x123')) return { name: 'ACME NETWORK', avatar: 'https://i.pravatar.cc/150?u=acme' };
    if (pLow.includes('0x456')) return { name: 'NEXUS LABS', avatar: 'https://i.pravatar.cc/150?u=nexus' };
    if (pLow.includes('0x789')) return { name: 'CYBER SECURITY LLC', avatar: 'https://i.pravatar.cc/150?u=cyber' };
    return { name: providerStr.length > 15 ? `${providerStr.substring(0, 6)}...${providerStr.substring(providerStr.length - 4)}` : providerStr, avatar: null };
  }

  const fetchProviderData = async () => {
    setIsLoading(true)
    try {
      let address = localStorage.getItem('nexusguard_wallet')
      if (!address && typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) address = accounts[0]
        } catch (err) {}
      }
      if (address) setCurrentWallet(address.toLowerCase())
      setCurrentAvatar(localStorage.getItem('nexusguard_avatar'))
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User')
      }

      const { data, error } = await supabase.from('nexus_jobs').select('*').order('created_at', { ascending: false })

      
      if (error) throw error
      
      const mockJobs = [
        { id: 'job_001', title: 'Smart Contract Audit', amount: '5,000 USDC', status: 'Open', provider: '0x123...abc', date: 'Oct 24, 2026', risk: 'LOW', agent: 'ESCROW NODE' },
        { id: 'job_002', title: 'Frontend Dashboard UI', amount: '2,500 USDC', status: 'Submitted', provider: '0x456...def', date: 'Oct 22, 2026', risk: 'MEDIUM', agent: 'ESCROW NODE' },
        { id: 'job_003', title: 'Subsquid Indexer Setup', amount: '1,200 USDC', status: 'Draft', provider: '--', date: 'Oct 26, 2026', risk: 'N/A', agent: 'PENDING...' },
        { id: 'job_004', title: 'Security Review Phase 1', amount: '8,000 USDC', status: 'Completed', provider: '0x789...ghi', date: 'Oct 15, 2026', risk: 'LOW', agent: 'GUARDIAN NODE' },
      ]
      
      const allJobs = [...(data || []), ...mockJobs]
      
      let matchedJobs: any[] = []
      let finalName = providerAddress
      let finalAvatar = ''
      
      allJobs.forEach(job => {
        const info = getProviderInfo(job.provider)
        if (info.name.toLowerCase() === providerAddress.toLowerCase()) {
          matchedJobs.push(job)
          finalName = info.name
          finalAvatar = info.avatar || ''
        }
      })

      // If no jobs were found but we have a known provider name from the URL, try to resolve its info directly if it's one of the mock ones.
      if (matchedJobs.length === 0) {
        if (providerAddress.toLowerCase() === 'acme network') finalAvatar = 'https://i.pravatar.cc/150?u=acme'
        if (providerAddress.toLowerCase() === 'nexus labs') finalAvatar = 'https://i.pravatar.cc/150?u=nexus'
        if (providerAddress.toLowerCase() === 'cyber security llc') finalAvatar = 'https://i.pravatar.cc/150?u=cyber'
      }

      setJobs(matchedJobs)
      
      let totalSpent = 0
      matchedJobs.forEach(j => {
        if (j.status === 'Completed' || j.status === 'Funded' || j.status === 'In Progress' || j.status === 'Submitted') {
           const amt = parseFloat((j.amount || '').replace(/,/g, '').replace(/[^\d.]/g, ''))
           if (!isNaN(amt)) totalSpent += amt
        }
      })
      
      setProviderInfo({
        name: finalName,
        avatar: finalAvatar,
        totalSpent,
        jobsCreated: matchedJobs.length,
        successRate: matchedJobs.length > 0 ? 100 : 0
      })

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
      case 'Funded': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'In Progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'Submitted': return 'text-purple-400 bg-purple-400/10 border-purple-400/30'
      case 'Completed': return 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  return (
    <div className="space-y-8 font-mono">
      <button 
        onClick={() => router.back()}
        className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Previous
      </button>

      {isLoading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-sm bg-gray-800 h-24 w-24"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 bg-black/40 border border-gray-800 p-6 rounded-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-[#d4af37]/10 border-2 border-[#d4af37]/30 flex items-center justify-center overflow-hidden mb-4 relative">
                  {providerInfo.avatar ? (
                    <img src={providerInfo.avatar} alt={providerInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-[#d4af37] font-bold font-space-grotesk">{providerInfo.name.charAt(0).toUpperCase()}</span>
                  )}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
                </div>
                <h1 className="text-2xl font-bold text-white font-space-grotesk uppercase tracking-wider">{providerInfo.name}</h1>
                <p className="text-gray-500 text-[10px] mt-1">{providerAddress}</p>
                <div className="mt-3 inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-widest font-bold">
                  VERIFIED ENTERPRISE
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3"/> Total Jobs</span>
                  <span className="text-white font-bold">{providerInfo.jobsCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3"/> Payout Rate</span>
                  <span className="text-emerald-400 font-bold">{providerInfo.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3"/> Total Spent</span>
                  <span className="text-[#d4af37] font-bold">{providerInfo.totalSpent.toLocaleString()} USDC</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h2 className="text-xl font-bold text-white font-space-grotesk uppercase tracking-wider mb-6 flex items-center gap-3">
                <Code2 className="text-[#d4af37] w-5 h-5"/> Job History
              </h2>
              
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-gray-800 text-gray-500 uppercase tracking-widest text-xs">
                    No jobs found for this provider.
                  </div>
                ) : (
                  jobs.map(job => (
                    <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block bg-black/40 border border-gray-800 hover:border-[#d4af37]/50 transition-colors p-5 rounded-sm group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors -mr-16 -mt-16" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-bold text-lg group-hover:text-[#d4af37] transition-colors">{job.title}</h3>
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 border-t border-gray-800/50 pt-4">
                        <div>
                          <span className="text-gray-600 block text-[9px] mb-1">REWARD POOL</span>
                          <span className="text-white font-bold">{job.amount}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-800"></div>
                        <div>
                          <span className="text-gray-600 block text-[9px] mb-1">AI SWARM</span>
                          <span className="text-blue-400 font-bold">{job.agent}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>
                        <div className="hidden sm:block">
                          <span className="text-gray-600 block text-[9px] mb-1">POSTED</span>
                          <span className="text-gray-300">{job.date}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
