'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ethers } from 'ethers'
import { BlueprintDropdown } from '@/components/ui/BlueprintDropdown'
import { createClient } from '@/lib/supabase/client'
import { getErrorMessage } from '@/lib/utils'
import { getEthereumProvider } from '@/lib/ethereum'
import { useWallet } from '@/hooks/useWallet'
import { validateMilestones, calculateMilestoneAmounts, addMilestone, removeMilestone, MAX_MILESTONES } from '@/lib/jobs'
import { ESCROW_V2_ADDRESS } from '@/lib/constants'

interface AgentNode {
  id: string;
  name: string;
  desc: string;
  req: boolean;
  color: string;
  bg: string;
  border: string;
}

export default function CreateJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address: walletAddress } = useWallet()
  
  const defaultNodes: AgentNode[] = [
    { id: 'escrow', name: 'Escrow', desc: 'Smart Contract Mgmt', req: true, color: 'text-blue-400', bg: 'bg-blue-400', border: 'border-blue-400/30' },
    { id: 'validator', name: 'Validator', desc: 'Deliverable QA', req: true, color: 'text-purple-400', bg: 'bg-purple-400', border: 'border-purple-400/30' },
    { id: 'compliance', name: 'Compliance', desc: 'Tax & Regulatory', req: false, color: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-400/30' },
    { id: 'treasury', name: 'Treasury', desc: 'Fund Disbursement', req: false, color: 'text-[#d4af37]', bg: 'bg-[#d4af37]', border: 'border-[#d4af37]/30' },
    { id: 'guardian', name: 'Guardian', desc: 'Fraud Detection', req: false, color: 'text-red-400', bg: 'bg-red-400', border: 'border-red-400/30' },
  ]
  // Load saved custom agents once (lazy init) so we don't setState inside an effect.
  const [availableNodes] = useState<AgentNode[]>(() => {
    if (typeof window === 'undefined') return defaultNodes;
    try {
      const custom = JSON.parse(localStorage.getItem('nexusguard_custom_agents') || '[]')
      return [...defaultNodes, ...custom]
    } catch {
      return defaultNodes
    }
  })
  

  const [milestones, setMilestones] = useState([{ name: 'Final Delivery', percent: 100 }])

  const handleAddMilestone = () => {
    setMilestones(prev => addMilestone(prev))
  }

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(prev => removeMilestone(prev, idx))
  }

  const [formData, setFormData] = useState<{
    title: string,
    budget: string,
    currency: string,
    deadline: string,
    description: string,
    requirements: string,
    payoutType: string,
    maxWinners: string,
    nodes: Record<string, boolean>
  }>({
    title: '',
    budget: '',
    currency: 'USDC',
    deadline: '',
    description: '',
    requirements: 'Proof of Work Verification, AI Consensus Validation, Secure Fund Release',
    payoutType: 'winner_takes_all',
    maxWinners: '1',
    nodes: {
      escrow: true,
      validator: true,
      compliance: false,
      treasury: false,
      guardian: false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (!walletAddress) {
        alert("Vui lòng kết nối ví ở góc trên bên phải để tạo Escrow Contract!");
        setIsSubmitting(false)
        return;
      }

      const ethereum = getEthereumProvider();
      if (!ethereum) {
        alert("Vui lòng cài đặt và kết nối ví MetaMask trước để gọi Smart Contract!");
        setIsSubmitting(false)
        return;
      }
      
      const from = walletAddress;
      
      let txValue = '0x0';
      if (formData.currency === 'ETH' || formData.currency === 'ARC' || formData.currency === 'USDC') {
        if (!formData.budget || isNaN(Number(formData.budget))) {
          alert("Vui lòng nhập số tiền hợp lệ!");
          setIsSubmitting(false);
          return;
        }
        // Convert budget to Wei (10^18)
        txValue = ethers.parseUnits(formData.budget, 18).toString(16);
        txValue = '0x' + txValue;
      }
      
      // Validate milestones sum to 100 (with float tolerance)
      const milestoneCheck = validateMilestones(milestones)
      if (!milestoneCheck.valid) {
        alert(`Tổng % milestone phải bằng 100! (${milestoneCheck.error})`);
        setIsSubmitting(false);
        return;
      }

      // Validate deadline
      if (!formData.deadline) {
        alert("Vui lòng chọn deadline cho Job!");
        setIsSubmitting(false);
        return;
      }
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      const jobId = `job_${Math.floor(Math.random() * 90000 + 10000)}`;
      const milestonePercentages = milestones.map(ms => ms.percent);

      // Encode V2 Smart Contract call data
      const escrowAbiV2 = ["function createJob(string calldata jobId, uint256 milestoneCount, uint256[] calldata milestonePercentages, uint256 deadline) external payable"];
      const iface = new ethers.Interface(escrowAbiV2);
      const dataPayload = iface.encodeFunctionData("createJob", [jobId, milestones.length, milestonePercentages, deadlineTimestamp]);
      
      // V2 Contract Address (shared constant — update in one place)
      const contractAddress = ESCROW_V2_ADDRESS;

      // Send the transaction to the V2 contract
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: contractAddress,
            value: txValue,
            data: dataPayload,
          },
        ],
      });
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      let providerName = localStorage.getItem('nexusguard_name')
      
      if (!providerName && user) {
         providerName = user.user_metadata?.full_name || user.email?.split('@')[0]
      }
      
      if (!providerName) providerName = 'NEXUS CLIENT'

      const shortWallet = from.substring(0, 6) + '...' + from.substring(from.length - 4);
      const providerData = JSON.stringify({
        address: shortWallet,
        name: providerName,
        avatar: localStorage.getItem('nexusguard_avatar') || ''
      });

      const activeNodes = Object.entries(formData.nodes)
        .filter(([, isActive]) => isActive)
        .map(([id]) => id.charAt(0).toUpperCase() + id.slice(1))
        .join(', ');

      // Build milestone data for DB storage
      const budgetNum = Number(formData.budget)
      const milestoneData = calculateMilestoneAmounts(budgetNum, milestones, formData.currency).map((ms) => ({
        ...ms,
        status: 'Pending',
        disputeOpen: false,
        disputeResult: 'None'
      }))

      const newJob = {
        id: jobId,
        title: formData.title,
        amount: `${formData.budget} ${formData.currency}`,
        status: 'Funded',
        provider: providerData,
        date: formData.deadline || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        agent: activeNodes ? `Swarm: ${activeNodes}` : 'Swarm Consensus',
        description: formData.description || 'Automated escrow task initialized via on-chain contract.',
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        payouttype: formData.payoutType,
        maxwinners: formData.maxWinners,
        milestones: JSON.stringify(milestoneData),
        deadline: formData.deadline
      }

      const { error: dbError } = await supabase.from('nexus_jobs').insert([newJob])

      if (dbError) {
        console.error('Lỗi khi lưu lên Supabase:', dbError)
        alert('Có lỗi khi lưu Database: ' + dbError.message)
      } else {
        alert(`Đã khóa quỹ thành công!\nHợp đồng Escrow được khởi tạo trên chuỗi.\nTxHash: ${txHash}`);
        router.push('/dashboard/jobs')
      }
      
    } catch (error) {
      console.error(error);
      if ((error as { code?: number }).code === 4001) {
        alert("Bạn đã từ chối giao dịch ký quỹ Escrow.");
      } else {
        alert(`Lỗi: ${getErrorMessage(error)}`);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const milestonesValid = validateMilestones(milestones).valid

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors font-mono text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-space-grotesk font-bold mb-1 text-[#d4af37] uppercase tracking-tight">Create Job Escrow_</h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Khởi tạo nhiệm vụ và nạp quỹ vào Smart Contract</p>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 p-6 md:p-8 rounded-sm relative">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d4af37]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d4af37]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d4af37]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d4af37]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Job Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="e.g. Frontend Dashboard Upgrade"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Budget / Bounty</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="e.g. 5000"
                />
                <div className="w-32">
                  <BlueprintDropdown 
                    options={['USDC', 'ARC', 'ETH']}
                    value={formData.currency}
                    onChange={(val) => setFormData({...formData, currency: val})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Deadline</label>
              <input 
                type="date" 
                required
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Payout Model</label>
              <div className="w-full">
                <BlueprintDropdown 
                  options={['winner_takes_all', 'pool_funding']}
                  value={formData.payoutType}
                  onChange={(val) => setFormData({...formData, payoutType: val, maxWinners: val === 'winner_takes_all' ? '1' : formData.maxWinners})}
                />
              </div>
            </div>

            <div className={`space-y-2 ${formData.payoutType === 'winner_takes_all' ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Max Submissions / Winners</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.maxWinners}
                onChange={(e) => setFormData({...formData, maxWinners: e.target.value})}
                className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                disabled={formData.payoutType === 'winner_takes_all'}
              />
            </div>
          </div>

          {/* ═══ MILESTONE BUILDER V2 ═══ */}
          <div className="space-y-4 border border-[#d4af37]/20 rounded-sm p-4 bg-[#d4af37]/5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-[#d4af37] uppercase tracking-widest font-bold">⚡ Payment Milestones (V2)</label>
              <button 
                type="button"
                onClick={handleAddMilestone}
                disabled={milestones.length >= MAX_MILESTONES}
                className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-400/10 px-2 py-1 rounded-sm hover:bg-emerald-400/20 transition-colors uppercase tracking-widest disabled:opacity-30"
              >
                + Add Phase
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">Split payment into milestones. Freelancer gets paid as each phase is completed.</p>
            <div className="space-y-2">
              {milestones.map((ms, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full border border-[#d4af37]/40 bg-black flex items-center justify-center text-[10px] font-mono text-[#d4af37] font-bold">{idx + 1}</div>
                  <input
                    type="text"
                    value={ms.name}
                    onChange={(e) => {
                      const updated = [...milestones]
                      updated[idx] = { ...updated[idx], name: e.target.value }
                      setMilestones(updated)
                    }}
                    className="flex-1 bg-black/50 border border-gray-700 rounded-sm px-3 py-2 text-gray-200 font-mono text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder={`Phase ${idx + 1} name`}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={ms.percent}
                      onChange={(e) => {
                        const updated = [...milestones]
                        updated[idx] = { ...updated[idx], percent: Math.max(1, Math.min(100, Number(e.target.value))) }
                        setMilestones(updated)
                      }}
                      className="w-16 bg-black/50 border border-gray-700 rounded-sm px-2 py-2 text-[#d4af37] font-mono text-xs text-center focus:outline-none focus:border-[#d4af37] transition-colors"
                      min="1" max="100"
                    />
                    <span className="text-[10px] text-gray-500 font-mono">%</span>
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Total indicator */}
            <div className={`flex justify-between items-center text-[10px] font-mono px-2 py-1.5 rounded-sm border ${
              milestonesValid
                ? 'border-emerald-500/30 bg-emerald-400/10 text-emerald-400' 
                : 'border-red-500/30 bg-red-400/10 text-red-400'
            }`}>
              <span>Total</span>
              <span className="font-bold">{milestones.reduce((s, m) => s + m.percent, 0)}% {milestonesValid ? '✓' : '(must be 100%)'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest">Job Description</label>
            <textarea 
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
              placeholder="Describe the task, requirements, and acceptance criteria..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest flex justify-between">
              <span>AI System Requirements</span>
              <span className="text-[9px] text-gray-600">Comma separated</span>
            </label>
            <input 
              type="text" 
              required
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-[#d4af37] font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="e.g. Code Coverage > 90%, AI Vision Match"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest flex justify-between">
              <span>Swarm Consensus Nodes</span>
              <span className="text-[9px] text-[#d4af37]">Assign AI Agents</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableNodes.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => {
                    if (!node.req) {
                      setFormData({
                        ...formData, 
                        nodes: { ...formData.nodes, [node.id]: !formData.nodes[node.id as keyof typeof formData.nodes] }
                      })
                    }
                  }}
                  className={`p-3 rounded-sm border ${formData.nodes[node.id as keyof typeof formData.nodes] ? node.border + ' bg-gray-900' : 'border-gray-800 bg-black'} ${!node.req && 'cursor-pointer hover:border-gray-600'} transition-all flex items-start gap-3 relative z-10`}
                >
                  <div className={`mt-0.5 w-3 h-3 rounded-sm flex items-center justify-center border ${formData.nodes[node.id as keyof typeof formData.nodes] ? node.border + ' bg-black' : 'border-gray-600 bg-black'}`}>
                    {formData.nodes[node.id as keyof typeof formData.nodes] && <div className={`w-1.5 h-1.5 rounded-sm ${node.bg || (node.color && node.color.replace('text-', 'bg-'))}`} />}
                  </div>
                  <div>
                    <div className={`text-xs font-bold font-mono uppercase tracking-widest ${formData.nodes[node.id as keyof typeof formData.nodes] ? node.color : 'text-gray-500'}`}>
                      {node.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">{node.desc}</div>
                  </div>
                  {node.req && <div className="ml-auto text-[8px] text-gray-600 uppercase font-bold tracking-widest border border-gray-800 px-1.5 py-0.5 rounded-sm">REQ</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 disabled:opacity-50 disabled:cursor-not-allowed text-[#d4af37] px-6 py-3 rounded-sm font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
                  INITIATING ESCROW...
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                  DEPOSIT TO ESCROW
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Blueprint decorative lines */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent pointer-events-none" />
    </div>
  )
}
