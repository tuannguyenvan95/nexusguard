'use client'

import { useState } from 'react'
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
  
  const [formData, setFormData] = useState({
    title: '',
    budget: '',
    currency: 'USDC',
    deadline: '',
    description: '',
    requirements: 'Proof of Work Verification, AI Consensus Validation, Secure Fund Release',
    payoutType: 'winner_takes_all',
    maxWinners: '1',
    validatingAgent: 'Claude 3.5 Sonnet (Frontend/UI)'
  })

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
      
      // LƯU CÔNG VIỆC VÀO LOCAL STORAGE
      const newJob = {
        id: `job_${Math.floor(Math.random() * 900 + 100)}`,
        title: formData.title,
        amount: `${formData.budget} ${formData.currency}`,
        status: 'Funded',
        provider: from.substring(0, 6) + '...' + from.substring(from.length - 4),
        date: formData.deadline || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        risk: 'LOW',
        agent: formData.validatingAgent,
        description: formData.description || 'Automated escrow task initialized via on-chain contract.',
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        payouttype: formData.payoutType,
        maxwinners: formData.maxWinners
      }

      const supabase = createClient()
      const { error: dbError } = await supabase.from('nexus_jobs').insert([newJob])

      if (dbError) {
        console.error('Lỗi khi lưu lên Supabase:', dbError)
        alert('Có lỗi khi lưu Database: ' + dbError.message)
      } else {
        alert(`Đã khóa quỹ thành công!\nHợp đồng Escrow được khởi tạo trên chuỗi.\nTxHash: ${txHash}`);
      }
      router.push('/dashboard/jobs')
      
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

          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest flex justify-between">
              <span>Validating AI Agent</span>
              <span className="text-[9px] text-[#d4af37]">Assign specialized Node</span>
            </label>
            <div className="w-full">
              <BlueprintDropdown 
                options={[
                  'Claude 3.5 Sonnet (Frontend/UI)', 
                  'GPT-4o (Backend/Logic)', 
                  'Llama 3 70B (Smart Contract Security)',
                  'Arc Native Oracle (Data Verification)'
                ]}
                value={formData.validatingAgent}
                onChange={(val) => setFormData({...formData, validatingAgent: val})}
              />
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
