'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Wallet, Activity, Code2, CheckCircle2, CircleDashed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('Loading...')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')

  const [socials, setSocials] = useState<{ [key: string]: string }>({})

  const handleSaveName = async () => {
    if (editNameValue.trim()) {
      const newName = editNameValue.trim()
      setUserName(newName)
      localStorage.setItem('nexusguard_name', newName)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({ data: { full_name: newName } })
      }
    }
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectSocial = async (socialName: string) => {
    setIsConnecting(true)
    const supabase = createClient()
    
    const providerMap: Record<string, 'github' | 'google' | 'twitter' | 'discord' | 'azure'> = {
      'GitHub': 'github',
      'Google': 'google',
      'Twitter': 'twitter',
      'Discord': 'discord',
      'Telegram': 'azure' // Fake fallback for telegram if not supported, or just ignore
    }
    
    const oauthProvider = providerMap[socialName]
    
    if (oauthProvider) {
      try {
        // Try linking identity first (if user is logged in)
        const { error } = await supabase.auth.linkIdentity({
          provider: oauthProvider,
          options: {
            redirectTo: `${window.location.origin}/dashboard/profile`
          }
        })
        
        if (error) {
          // Fallback to signInWithOAuth if linkIdentity is not available/fails
          await supabase.auth.signInWithOAuth({
            provider: oauthProvider,
            options: {
              redirectTo: `${window.location.origin}/dashboard/profile`
            }
          })
        }
      } catch (e) {
        console.error(e)
        alert(`Failed to connect ${socialName}. Please check Supabase Provider settings.`)
      }
    } else {
      alert(`${socialName} direct OAuth is not configured yet.`)
    }
    
    setIsConnecting(false)
  }

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

    // Lấy danh sách jobs từ Supabase
    const fetchJobs = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('nexus_jobs').select('*').order('created_at', { ascending: false })
      
      if (data && !error && userAddress && userAddress !== 'Not Connected') {
        const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`.toLowerCase()
        
        const created = data.filter(job => {
          if (!job.provider) return false
          try {
            const p = JSON.parse(job.provider)
            return p.address?.toLowerCase() === shortAddress || p.toLowerCase() === shortAddress
          } catch (e) {
            return job.provider.toLowerCase() === shortAddress
          }
        })
        
        const applied = data.filter(job => job.applicant?.toLowerCase() === userAddress.toLowerCase())
        
        setCreatedJobs(created)
        setAppliedJobs(applied)
      }
    }

    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const storedName = localStorage.getItem('nexusguard_name')
        setUserName(storedName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User')
      } else {
        const storedName = localStorage.getItem('nexusguard_name')
        setUserName(storedName || 'Guest')
      }
    }

    const savedSocials = localStorage.getItem('nexusguard_socials')
    if (savedSocials) {
      try {
        setSocials(JSON.parse(savedSocials))
      } catch (e) {}
    }

    setAvatarUrl(localStorage.getItem('nexusguard_avatar'))
    fetchWallet()
    fetchUser()
  }, [])

  useEffect(() => {
    // Re-fetch jobs when userAddress changes
    const fetchJobs = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('nexus_jobs').select('*').order('created_at', { ascending: false })
      
      if (data && !error && userAddress && userAddress !== 'Not Connected') {
        const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`.toLowerCase()
        
        const created = data.filter(job => {
          if (!job.provider) return false
          try {
            // Check if it's JSON
            const p = JSON.parse(job.provider)
            return p.address?.toLowerCase() === shortAddress || p.toLowerCase() === shortAddress
          } catch (e) {
            // Fallback for plain string
            return job.provider.toLowerCase() === shortAddress
          }
        })
        
        const applied = data.filter(job => job.applicant?.toLowerCase() === userAddress.toLowerCase())
        
        setCreatedJobs(created)
        setAppliedJobs(applied)
      }
    }
    
    if (userAddress !== 'Not Connected') {
      fetchJobs()
    }
  }, [userAddress])

  const formatAddress = (addr: string) => {
    if (addr === 'Not Connected') return addr
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  // Dữ liệu Mock cho Demo
  const stats = [
    { label: 'Wallet Balance', value: '15,240 USDC', change: '+2.5%', id: 'BAL-01' },
    { label: 'Escrow Deposits', value: '4,500 USDC', change: '3 Active Jobs', id: 'ESC-02' },
    { label: 'Projects Created', value: createdJobs.length.toString(), change: 'Total', id: 'PRJ-03' },
    { label: 'Jobs Completed', value: '12', change: 'As Developer', id: 'CPL-04' }
  ]

  // Helper function for status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-orange-400 bg-orange-400/10'
      case 'Submitted': return 'text-purple-400 bg-purple-400/10'
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10'
      case 'Open': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

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
              <div 
                className="w-16 h-16 rounded-sm border-2 border-[#d4af37] bg-gray-900 flex items-center justify-center p-0.5 relative overflow-hidden group cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-[#d4af37]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-mono uppercase tracking-widest text-center px-1">Change Logo</span>
                </div>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = reader.result as string;
                        setAvatarUrl(base64);
                        localStorage.setItem('nexusguard_avatar', base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 group/edit">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      autoFocus
                      className="text-xl font-space-grotesk font-bold text-white uppercase bg-gray-800/50 border border-[#d4af37]/50 rounded-sm px-2 py-1 outline-none w-full max-w-[200px]"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <>
                      <h2 className="text-xl font-space-grotesk font-bold text-white uppercase">{userName}</h2>
                      <button 
                        onClick={() => { setEditNameValue(userName !== 'Loading...' && userName !== 'Guest' && userName !== 'Unknown User' ? userName : ''); setIsEditingName(true); }}
                        className="text-gray-400 hover:text-[#d4af37] transition-colors p-1"
                        title="Edit Name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono uppercase mt-1">{formatAddress(userAddress)} • NexusGuard Citizen</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Twitter', color: '#1DA1F2', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                { name: 'GitHub', color: '#ffffff', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
                { name: 'Discord', color: '#5865F2', path: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
                { name: 'Telegram', color: '#24A1DE', path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
                { name: 'Google', color: '#EA4335', path: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z' }
              ].map((social) => {
                const isConnected = !!socials[social.name]
                return (
                <div key={social.name} className="p-3 bg-gray-900/50 border border-gray-800 rounded-sm flex items-center justify-between group-hover:border-[#d4af37]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" style={{ color: social.color }} fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d={social.path} />
                    </svg>
                    <span className="text-sm font-mono text-gray-300">{social.name}</span>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <a href={socials[social.name]} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-white transition-colors underline">View</a>
                      <button onClick={() => {
                        const newSocials = { ...socials }
                        delete newSocials[social.name]
                        setSocials(newSocials)
                        localStorage.setItem('nexusguard_socials', JSON.stringify(newSocials))
                      }} className="text-[10px] font-mono text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 px-2 py-1 rounded-sm transition-colors uppercase group/btn relative">
                        <span className="group-hover/btn:hidden flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Linked</span>
                        <span className="hidden group-hover/btn:block">Unlink</span>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleConnectSocial(social.name)} className="text-[10px] font-mono text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 px-2 py-1 rounded-sm transition-colors uppercase">
                      Connect
                    </button>
                  )}
                </div>
              )})}
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
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Participation
              </h3>
            </div>

            {appliedJobs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-800 rounded-sm">
                <CircleDashed className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-mono text-sm uppercase">No active participations</p>
                <Link href="/dashboard/jobs" className="text-[#d4af37] text-xs font-mono uppercase tracking-widest mt-2 inline-block hover:underline">
                  Find Jobs to Apply &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((job) => (
                  <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block group">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-sm group-hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-shadow" />
                        <div>
                          <h4 className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{job.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono tracking-widest">ID: {job.id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-emerald-400">{job.amount}</div>
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
