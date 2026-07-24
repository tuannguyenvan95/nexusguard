'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Wallet, Activity, Code2, CheckCircle2, CircleDashed } from 'lucide-react'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function ProfilePage() {
  const [userAddress, setUserAddress] = useState<string>('Not Connected')
  const [createdJobs, setCreatedJobs] = useState<any[]>([])

  useEffect(() => {
    // Lấy địa chỉ ví từ localStorage hoặc ethereum window
    const fetchWallet = async () => {
      let address = localStorage.getItem('nexusguard_wallet')
      if (!address && typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            address = accounts[0]
          }
        } catch (err) {}
      }
      if (address) setUserAddress(address)
    }

    // Lấy danh sách jobs đã tạo từ localStorage
    const fetchJobs = () => {
      const storedJobs = localStorage.getItem('nexusguard_jobs')
      if (storedJobs) {
        try {
          setCreatedJobs(JSON.parse(storedJobs))
        } catch (e) {}
      }
    }

    fetchWallet()
    fetchJobs()
  }, [])

  const formatAddress = (addr: string) => {
    if (addr === 'Not Connected') return addr
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Dữ liệu Mock cho Demo
  const stats = [
    { label: 'Wallet Balance', value: '15,240 ARC', change: '+2.5%', id: 'BAL-01' },
    { label: 'Escrow Deposits', value: '4,500 USDC', change: '3 Active Jobs', id: 'ESC-02' },
    { label: 'Projects Created', value: createdJobs.length.toString(), change: 'Total', id: 'PRJ-03' },
    { label: 'Jobs Completed', value: '12', change: 'As Developer', id: 'CPL-04' }
  ]

  const mockParticipatedJobs = [
    { id: 'JOB_#102', title: 'Audit Smart Contract', status: 'Completed', reward: '2,000 USDC' },
    { id: 'JOB_#105', title: 'Frontend Dashboard', status: 'In Progress', reward: '1,500 USDC' },
    { id: 'JOB_#108', title: 'API Integration', status: 'Submitted', reward: '800 USDC' },
  ]

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl font-space-grotesk font-bold mb-1 text-[#d4af37] tracking-tight uppercase">User Profile_</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Identity, Balances & Reputation</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-gray-500 font-mono uppercase">Network</div>
          <div className="text-sm text-emerald-400 font-mono flex items-center gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Arc Testnet
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity & Socials */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Card */}
          <motion.div variants={itemVariants} className="glass glass-hover p-6 rounded-sm relative group">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-sm border-2 border-[#d4af37] bg-gray-900 flex items-center justify-center p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#d4af37]" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-space-grotesk font-bold text-white uppercase">{formatAddress(userAddress)}</h2>
                <p className="text-xs text-gray-500 font-mono uppercase">NexusGuard Citizen</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-sm flex items-center justify-between group-hover:border-[#d4af37]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  <span className="text-sm font-mono text-gray-300">Twitter</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-sm">Connected</span>
              </div>
              <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-sm flex items-center justify-between group-hover:border-[#d4af37]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  <span className="text-sm font-mono text-gray-300">GitHub</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-sm">Connected</span>
              </div>
            </div>
          </motion.div>

          {/* Verification Status */}
          <motion.div variants={itemVariants} className="glass glass-hover p-6 rounded-sm relative">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verification Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-400">KYC Level 1</span>
                  <span className="text-emerald-400">Verified</span>
                </div>
                <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-full h-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-400">Developer Reputation</span>
                  <span className="text-[#d4af37]">92/100</span>
                </div>
                <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#d4af37] w-[92%] h-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Stats & Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                key={i} 
                className="glass glass-hover p-5 rounded-sm flex flex-col justify-between h-28 relative group"
              >
                <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono">{stat.id}</div>
                <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider">{stat.label}</h3>
                <div>
                  <div className="text-xl font-space-grotesk font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[#d4af37] text-[10px] font-mono">{stat.change}</div>
                </div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]/30 group-hover:border-[#d4af37]" />
              </motion.div>
            ))}
          </div>

          {/* Created Jobs List */}
          <motion.div variants={itemVariants} className="glass glass-hover p-6 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#d4af37]/50" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Created Projects
              </h3>
              <div className="text-[10px] text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded-sm">DATA.MY_JOBS</div>
            </div>

            {createdJobs.length > 0 ? (
              <div className="space-y-3">
                {createdJobs.slice(0, 3).map((job: any) => (
                  <Link href={`/dashboard/jobs/${job.id}`} key={job.id}>
                    <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-sm hover:border-[#d4af37]/50 transition-colors flex justify-between items-center group cursor-pointer mb-3">
                      <div>
                        <div className="text-xs text-gray-500 font-mono mb-1">{job.id}</div>
                        <div className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors">{job.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-white mb-1">{job.amount} USDC</div>
                        <div className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-gray-800 text-gray-300 uppercase">{job.status}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {createdJobs.length > 3 && (
                  <Link href="/dashboard/jobs">
                    <div className="text-center text-xs font-mono text-[#d4af37] hover:text-white transition-colors p-2 cursor-pointer">
                      View all {createdJobs.length} jobs →
                    </div>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CircleDashed className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-mono">No projects created yet.</p>
                <Link href="/dashboard/jobs/create" className="text-[#d4af37] text-xs font-mono hover:underline mt-2 inline-block">
                  [+] Initiate New Contract
                </Link>
              </div>
            )}
          </motion.div>

          {/* Participated Jobs */}
          <motion.div variants={itemVariants} className="glass glass-hover p-6 rounded-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Participation
              </h3>
            </div>
            <div className="space-y-3">
              {mockParticipatedJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 border-b border-gray-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <div>
                      <div className="text-xs font-bold text-gray-200">{job.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{job.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-emerald-400">{job.reward}</div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">{job.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}
