'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Code, Link as LinkIcon, Loader2, Wallet, AtSign } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { createClient } from '@/lib/supabase/client'

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string

  // Initial State Setup
  const [jobStatus, setJobStatus] = useState('Open')
  const [isApplying, setIsApplying] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAiValidating, setIsAiValidating] = useState(false)
  const [validationLogs, setValidationLogs] = useState<string[]>([])
  const [aiReport, setAiReport] = useState<string>('')

  const [githubUrl, setGithubUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [submitterWallet, setSubmitterWallet] = useState('')
  const [socialHandle, setSocialHandle] = useState('')
  const [payoutTxHash, setPayoutTxHash] = useState('')

  // Mock data based on ID
  const [job, setJob] = useState({
    id,
    title: id === 'job_002' ? 'Frontend Dashboard UI' : 'Smart Contract Audit',
    amount: '2,500 USDC',
    provider: '0x456...def',
    description: 'Build a stunning Next.js App Router dashboard using Tailwind CSS. Must include dark mode glassmorphism elements and responsive charts.',
    requirements: ['Next.js 15 App Router', 'Tailwind CSS', 'Framer Motion', 'Fully Responsive'],
    createdAt: 'Oct 20, 2026',
    deadline: 'Oct 28, 2026',
    payoutType: 'winner_takes_all',
    maxWinners: '1',
    agent: 'Claude 3.5 Sonnet',
    applicant: [] as string[],
    payoutTxs: [] as {address: string, txHash: string}[]
  })

  useEffect(() => {
    async function fetchJobData() {
      const supabase = createClient()
      const { data, error } = await supabase.from('nexus_jobs').select('*').eq('id', id).single()

      if (data && !error) {
        let parsedApplicants: string[] = []
        if (data.applicant) {
          try {
            const parsed = JSON.parse(data.applicant)
            parsedApplicants = Array.isArray(parsed) ? parsed : [data.applicant]
          } catch (e) {
            parsedApplicants = [data.applicant]
          }
        }
        let parsedPayoutTxs: {address: string, txHash: string}[] = []
        if (data.payout_txs) {
          try {
            const parsed = typeof data.payout_txs === 'string' ? JSON.parse(data.payout_txs) : data.payout_txs
            parsedPayoutTxs = Array.isArray(parsed) ? parsed : []
          } catch (e) {
            console.error(e)
          }
        }

        setJob({
          id: data.id,
          title: data.title,
          amount: data.amount,
          provider: data.provider,
          description: data.description || 'Automated escrow task initialized via on-chain contract.',
          requirements: data.requirements || ['Proof of Work Verification', 'AI Consensus Validation', 'Secure Fund Release'],
          createdAt: data.date,
          deadline: data.date,
          payoutType: data.payouttype || 'winner_takes_all',
          maxWinners: data.maxwinners || '1',
          agent: data.agent || 'Claude 3.5 Sonnet',
          applicant: parsedApplicants,
          payoutTxs: parsedPayoutTxs
        })
        if (data.status) {
          setJobStatus(data.status)
        }
      } else {
        // Fallback for mock jobs
        const mockJobs = [
          { id: 'job_001', title: 'Smart Contract Audit', amount: '5,000 USDC', status: 'Open', provider: '0x123...abc', date: 'Oct 24, 2026', risk: 'LOW', agent: 'ESCROW NODE', description: 'Audit the ERC-8183 escrow contract.', requirements: ['Solidity', 'Foundry'] },
          { id: 'job_002', title: 'Frontend Dashboard UI', amount: '2,500 USDC', status: 'Submitted', provider: '0x456...def', date: 'Oct 22, 2026', risk: 'MEDIUM', agent: 'ESCROW NODE', description: 'Build a stunning Next.js App Router dashboard.', requirements: ['Next.js', 'Tailwind'] },
        ]
        const hardcodedJob = mockJobs.find(j => j.id === id)
        if (hardcodedJob) {
          setJob({
            id: hardcodedJob.id,
            title: hardcodedJob.title,
            amount: hardcodedJob.amount,
            provider: hardcodedJob.provider,
            description: hardcodedJob.description,
            requirements: hardcodedJob.requirements,
            createdAt: hardcodedJob.date,
            deadline: hardcodedJob.date,
            payoutType: 'winner_takes_all',
            maxWinners: '1',
            agent: hardcodedJob.agent,
            applicant: [],
            payoutTxs: []
          })
          setJobStatus(hardcodedJob.status)
        }
      }
    }
    fetchJobData()
  }, [id])

  const handleApplyJob = async () => {
    setIsApplying(true)
    
    // Try to get wallet address
    let applicantAddress = '0x123...abc (Simulated)'
    try {
      const ethereum = (window as any).ethereum
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          applicantAddress = accounts[0]
        }
      }
    } catch (e) {
      console.log(e)
    }

    setTimeout(async () => {
      let updatedApplicants = Array.isArray(job.applicant) ? [...job.applicant] : []
      if (!updatedApplicants.includes(applicantAddress)) {
        updatedApplicants.push(applicantAddress)
      }
      const applicantsJson = JSON.stringify(updatedApplicants)

      const supabase = createClient()
      const { error } = await supabase.from('nexus_jobs').update({ status: 'In Progress', applicant: applicantsJson }).eq('id', job.id)
      
      if (!error) {
        setJobStatus('In Progress')
        setJob(prev => ({ ...prev, applicant: updatedApplicants }))
      } else {
        alert('Lỗi cập nhật CSDL: ' + error.message)
      }
      setIsApplying(false)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!githubUrl || !previewUrl || !submitterWallet) return
    
    setIsSubmitting(true)
    // Simulate transaction delay
    setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('nexus_jobs').update({ status: 'Submitted' }).eq('id', job.id)

      setIsSubmitting(false)
      setIsModalOpen(false)
      setJobStatus('Submitted')
      
      // Auto-trigger AI validation after a brief moment
      setTimeout(() => {
        handleAiValidation()
      }, 800)
    }, 2000)
  }

  const handleAiValidation = async () => {
    setIsAiValidating(true)
    setValidationLogs([
      '> INITIATING AI ESCROW VALIDATION...',
      `> CONNECTING TO API: /api/evaluate`,
      `> ASSIGNED AGENT: ${job.agent || 'ESCROW NODE'}`,
      '> WAITING FOR AI ANALYSIS...'
    ])

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          githubUrl: githubUrl || "https://github.com/org/repo/pull/42",
          previewUrl: previewUrl || "dashboard-preview.vercel.app",
          submitterWallet: submitterWallet || "0x789...abc",
          agent: job.agent
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setValidationLogs(prev => [
          ...prev, 
          '> AI RESPONSE RECEIVED.', 
          '> ESCROW CONDITIONS MET. TX AUTHORIZED.',
          `> TX HASH: ${data.txHash.substring(0,12)}... CONFIRMED.`,
          '> JOB COMPLETED. FUNDS SETTLED.'
        ])
        setTimeout(async () => {
          setIsAiValidating(false)
          setJobStatus('Completed')
          setPayoutTxHash(data.txHash)
          setAiReport(data.report)
          
          const updatedPayoutTxs = [...(job.payoutTxs || [])]
          updatedPayoutTxs.push({ address: submitterWallet, txHash: data.txHash })
          
          setJob(prev => ({ ...prev, payoutTxs: updatedPayoutTxs }))

          const supabase = createClient()
          await supabase.from('nexus_jobs').update({ status: 'Completed', payout_txs: JSON.stringify(updatedPayoutTxs) }).eq('id', job.id)
        }, 1500)
      } else {
        setValidationLogs(prev => [...prev, '> ERROR: API CALL FAILED.'])
        setTimeout(() => setIsAiValidating(false), 2000)
      }
    } catch (err) {
      setValidationLogs(prev => [...prev, '> ERROR: NETWORK TIMEOUT.'])
      setTimeout(() => setIsAiValidating(false), 2000)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 font-mono">
        {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight">{job.title}_</h1>
            <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold border ${jobStatus === 'Submitted' ? 'text-purple-400 bg-purple-400/10 border-purple-400/30' : jobStatus === 'Open' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : jobStatus === 'In Progress' ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' : 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30'}`}>
              {jobStatus}
            </span>
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-widest">JOB_ID: {job.id} | ERC-8183 ESCROW CONTRACT</p>
        </div>
        
        {jobStatus === 'In Progress' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            SUBMIT DELIVERABLE
          </button>
        )}
        {(jobStatus === 'Open' || jobStatus === 'Funded') && (
          <button 
            onClick={handleApplyJob}
            disabled={isApplying}
            className="border border-blue-400 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            {isApplying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> APPLYING...</>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                APPLY FOR JOB
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details + Action Area) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-8 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-500" />

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">JOB DETAILS</h3>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm">{job.description}</p>
            
            <h4 className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest border-b border-gray-800 pb-1">REQUIREMENTS</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-8 text-sm">
              {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">BUDGET</div>
                <div className="font-bold text-[#d4af37] text-sm">{job.amount}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">PROVIDER</div>
                <div className="text-sm text-gray-300">{job.provider}</div>
              </div>
              {/* Removed single applied by */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">CREATED</div>
                <div className="text-sm text-gray-300">{job.createdAt}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">DEADLINE</div>
                <div className="text-sm text-gray-300">{job.deadline}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">PAYOUT MODEL</div>
                <div className="text-sm text-gray-300 capitalize">{job.payoutType.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">SUBMISSIONS</div>
                <div className="text-sm text-gray-300">{Array.isArray(job.applicant) ? job.applicant.length : 0} / {job.maxWinners}</div>
              </div>
              </div>
            </div>
          </div>

          {Array.isArray(job.applicant) && job.applicant.length > 0 && (
            <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">APPLICANTS LIST</h3>
              <div className="space-y-2">
                {job.applicant.map((app: string, idx: number) => {
                  const payout = (job.payoutTxs || []).find((p: any) => p.address.toLowerCase() === app.toLowerCase())
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/50 border border-gray-800 rounded-sm">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-300 font-mono text-sm">{app}</span>
                      </div>
                      {payout && (
                        <a 
                          href={`https://testnet.arcscan.app/tx/${payout.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#d4af37] text-xs hover:underline flex items-center gap-1 font-mono"
                        >
                          <span className="hidden sm:inline">TX: </span>{payout.txHash.substring(0, 6)}...{payout.txHash.substring(payout.txHash.length - 4)} <LinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {jobStatus === 'Submitted' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#d4af37]/5 border border-[#d4af37]/30 rounded-sm p-8 relative"
            >
               {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4af37]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4af37]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />

              <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-4">SUBMITTED DELIVERABLE</h3>
              <div className="bg-black/50 border border-gray-800 rounded-sm p-4 mb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">Submitter:</span>
                  <span className="text-gray-200 text-sm font-mono truncate">{submitterWallet || "0x789...abc"}</span>
                </div>
                {socialHandle && (
                  <div className="flex items-center gap-3">
                    <AtSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">Contact:</span>
                    <span className="text-[#d4af37] text-sm truncate">{socialHandle}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Code className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">GitHub PR:</span>
                  <a href={githubUrl || "#"} className="text-[#d4af37] hover:underline text-sm truncate">{githubUrl || "github.com/org/repo/pull/42"}</a>
                </div>
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">Preview:</span>
                  <a href={previewUrl || "#"} className="text-[#d4af37] hover:underline text-sm truncate">{previewUrl || "dashboard-preview.vercel.app"}</a>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Provider notes: "Completed all requirements. Code is ready for AI Validation."</p>
            </motion.div>
          )}

          {jobStatus === 'Completed' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/5 border border-emerald-500/30 rounded-sm p-8 relative"
            >
               {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500" />

              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">AGENT SETTLEMENT COMPLETE</h3>
              <div className="bg-black/50 border border-emerald-900 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Escrow Validated By:</span>
                  <span className="text-emerald-400">{job.agent || 'ESCROW AI NODE'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Human Approval:</span>
                  <span className="text-emerald-400 line-through">NOT REQUIRED</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-gray-800">
                  <span className="text-gray-400">USDC Transferred:</span>
                  <span className="text-emerald-400 font-bold">{job.amount}</span>
                </div>
              </div>
              
              {aiReport && (
                <div className="mt-6 pt-6 border-t border-emerald-900/50 text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-black/30 p-4 rounded-sm">
                  {aiReport}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column (Timeline) */}
        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-500" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gray-500" />
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">ESCROW TIMELINE</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-[#d4af37] before:via-gray-800 before:to-transparent">
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 border border-[#d4af37] bg-black text-[#d4af37] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Check className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 border border-[#d4af37]/30 bg-[#d4af37]/5">
                  <div className="font-bold text-[#d4af37] text-xs uppercase tracking-wider mb-1">CREATED</div>
                  <div className="text-[10px] text-gray-500">Oct 20, 14:00</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 border border-[#d4af37] bg-black text-[#d4af37] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                  $
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 border border-[#d4af37]/30 bg-[#d4af37]/5">
                  <div className="font-bold text-[#d4af37] text-xs uppercase tracking-wider mb-1">FUNDED ESCROW</div>
                  <div className="text-[10px] text-gray-500">Oct 21, 09:30</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold transition-colors ${jobStatus === 'Submitted' || jobStatus === 'Completed' ? 'border-[#d4af37] bg-[#d4af37] text-black' : 'border-gray-700 bg-black text-gray-600'}`}>
                  ↑
                </div>
                <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 border transition-colors ${jobStatus === 'Submitted' || jobStatus === 'Completed' ? 'border-[#d4af37]/30 bg-[#d4af37]/5' : 'border-gray-800 bg-gray-900/50'}`}>
                  <div className={`font-bold text-xs uppercase tracking-wider mb-1 ${jobStatus === 'Submitted' || jobStatus === 'Completed' ? 'text-[#d4af37]' : 'text-gray-500'}`}>SUBMITTED</div>
                  <div className="text-[10px] text-gray-500">{jobStatus === 'Submitted' || jobStatus === 'Completed' ? 'Oct 26, 16:45' : 'PENDING'}</div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors ${jobStatus === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-gray-700 bg-black text-gray-600'}`}>
                  <Code className="w-4 h-4" />
                </div>
                <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 border transition-colors ${jobStatus === 'Completed' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-800 bg-gray-900/50 opacity-50'}`}>
                  <div className={`font-bold text-xs uppercase tracking-wider mb-1 ${jobStatus === 'Completed' ? 'text-emerald-500' : 'text-gray-500'}`}>AI VALIDATION & SETTLEMENT</div>
                  <div className="text-[10px] text-gray-500">{jobStatus === 'Completed' ? 'Oct 26, 16:50' : 'PENDING'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Submit Deliverable */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-[#030712] border border-[#d4af37]/50 shadow-2xl shadow-[#d4af37]/10 p-6 rounded-sm"
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4af37]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4af37]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />

            <h2 className="text-xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-2">Submit Deliverable_</h2>
            <p className="text-gray-400 text-xs font-mono mb-6">Enter your repository and preview links to submit your work for AI Validation.</p>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Submitter Wallet (For Reward)</label>
                <input
                  type="text"
                  required
                  value={submitterWallet}
                  onChange={(e) => setSubmitterWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">Social Handle <span className="text-gray-600">(Optional)</span></label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@username (X/Discord/Telegram)"
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">GitHub Pull Request URL</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Live Preview URL (Vercel/Netlify)</label>
                <input
                  type="url"
                  required
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-2 text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] px-4 py-2 text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING...</>
                  ) : (
                    'CONFIRM SUBMISSION'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Terminal Output Simulation */}
      {isAiValidating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-[#030712] border border-purple-500/50 shadow-2xl shadow-purple-500/20 p-6 rounded-sm font-mono"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <h2 className="text-xl font-space-grotesk font-bold text-purple-400 uppercase tracking-tight">Escrow Agent Verification_</h2>
            </div>
            
            <div className="space-y-3 h-64 overflow-y-auto">
              {validationLogs.map((log, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={`text-sm ${log.includes('PASSED') || log.includes('COMPLETED') || log.includes('MET') || log.includes('CONFIRMED') ? 'text-emerald-400' : 'text-purple-300'}`}
                >
                  {log}
                </motion.div>
              ))}
              <div className="w-2 h-4 bg-purple-400 animate-pulse mt-2" />
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}
