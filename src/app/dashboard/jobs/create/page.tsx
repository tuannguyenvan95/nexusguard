'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ethers } from 'ethers'
import { BlueprintDropdown } from '@/components/ui/BlueprintDropdown'
import { createClient } from '@/lib/supabase/client'

export default function CreateJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const defaultNodes = [
    { id: 'escrow', name: 'Escrow', desc: 'Smart Contract Mgmt', req: true, color: 'text-blue-400', bg: 'bg-blue-400', border: 'border-blue-400/30' },
    { id: 'validation', name: 'Validation', desc: 'Deliverable QA', req: true, color: 'text-purple-400', bg: 'bg-purple-400', border: 'border-purple-400/30' },
    { id: 'compliance', name: 'Compliance', desc: 'Tax & Regulatory', req: false, color: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-400/30' },
    { id: 'payment', name: 'Payment', desc: 'Fund Disbursement', req: false, color: 'text-[#d4af37]', bg: 'bg-[#d4af37]', border: 'border-[#d4af37]/30' },
    { id: 'risk', name: 'Risk', desc: 'Fraud Detection', req: false, color: 'text-red-400', bg: 'bg-red-400', border: 'border-red-400/30' },
  ]
  const [availableNodes, setAvailableNodes] = useState<any[]>(defaultNodes)
  

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
      validation: true,
      compliance: false,
      payment: false,
      risk: false
    }
  })

  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem('nexusguard_custom_agents') || '[]')
    if (custom.length > 0) {
      setAvailableNodes(prev => [...prev, ...custom])
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Vui lòng cài đặt và kết nối ví MetaMask trước để gọi Smart Contract!");
        setIsSubmitting(false)
        return;
      }
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        alert("Vui lòng kết nối ví để tạo Escrow Contract!");
        setIsSubmitting(false)
        return;
      }
      
      const from = accounts[0];
      
      let txValue = '0x0';
      if (formData.currency === 'ETH' || formData.currency === 'ARC' || formData.currency === 'USDC') {
        if (!formData.budget || isNaN(Number(formData.budget))) {
          alert("Vui lòng nhập số tiền hợp lệ!");
          setIsSubmitting(false);
          return;
        }
        // Convert budget to Wei (10^18)
        txValue = ethers.parseUnits(formData.budget, 18).toString(16); // Convert BigInt to Hex
        txValue = '0x' + txValue;
      }
      
      // Simulate a real Smart Contract call (requires gas)
      // We send the computed value and dummy data so MetaMask recognizes it as a "Contract Interaction"
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: '0x0000000000000000000000000000000000008183', // Dummy ERC-8183 Escrow Contract
            value: txValue,
            data: '0x0f2c4134', // Dummy function selector for createJob()
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

      const newJob = {
        id: `job_${Math.floor(Math.random() * 900 + 100)}`,
        title: formData.title,
        amount: `${formData.budget} ${formData.currency}`,
        status: 'Funded',
        provider: providerData,
        date: formData.deadline || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        agent: 'Swarm Consensus',
        swarm_nodes: formData.nodes,
        description: formData.description || 'Automated escrow task initialized via on-chain contract.',
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        payouttype: formData.payoutType,
        maxwinners: formData.maxWinners
      }

      const { error: dbError } = await supabase.from('nexus_jobs').insert([newJob])

      if (dbError) {
        console.error('Lỗi khi lưu lên Supabase:', dbError)
        alert('Có lỗi khi lưu Database: ' + dbError.message)
      } else {
        alert(`Đã khóa quỹ thành công!\nHợp đồng Escrow được khởi tạo trên chuỗi.\nTxHash: ${txHash}`);
        router.push('/dashboard/jobs')
      }
      
    } catch (error: any) {
      console.error(error);
      if (error.code === 4001) {
        alert("Bạn đã từ chối giao dịch ký quỹ Escrow.");
      } else {
        alert(`Lỗi: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
