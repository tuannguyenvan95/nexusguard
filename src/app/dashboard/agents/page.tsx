'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ShieldCheck, Cpu, Scale, CreditCard, ShieldAlert, Activity, Terminal } from 'lucide-react'

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const [agentConfigs, setAgentConfigs] = useState<Record<string, any>>({})
  const [currentModalConfig, setCurrentModalConfig] = useState<any>({})
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [newAgentForm, setNewAgentForm] = useState({ name: '', role: '', endpoint: '' })

  const [activeAgents, setActiveAgents] = useState([
    { name: 'Escrow', role: 'Smart Contract Mgmt', status: 'Active', uptime: '99.9%', color: 'blue', icon: ShieldCheck },
    { name: 'Validation', role: 'Deliverable QA', status: 'Active', uptime: '99.8%', color: 'purple', icon: Cpu },
    { name: 'Compliance', role: 'Tax & Regulatory', status: 'Active', uptime: '100%', color: 'emerald', icon: Scale },
    { name: 'Payment', role: 'Fund Disbursement', status: 'Active', uptime: '99.9%', color: 'yellow', icon: CreditCard },
    { name: 'Risk', role: 'Fraud Detection', status: 'Active', uptime: '99.9%', color: 'red', icon: ShieldAlert },
  ])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('nexusguard_agent_configs')
    if (saved) {
      setAgentConfigs(JSON.parse(saved))
    }
  }, [])

  const getDefaultConfig = (name: string) => {
    switch(name) {
      case 'Validation': return { strictness: 'Standard (Balanced)', model: 'GPT-4o (OpenAI)' }
      case 'Escrow': return { threshold: 100, multisig: true }
      case 'Compliance': return { kyc: true, tax: 'US (W-9 / 1099-NEC)' }
      case 'Payment': return { batch: true, gas: 50 }
      case 'Risk': return { maxTx: 10000, blockVpn: true }
      default: return {}
    }
  }

  useEffect(() => {
    if (selectedAgent) {
      setCurrentModalConfig(agentConfigs[selectedAgent.name] || getDefaultConfig(selectedAgent.name))
    }
  }, [selectedAgent, agentConfigs])

  const handleSaveConfig = () => {
    if (!selectedAgent) return
    const newConfigs = { ...agentConfigs, [selectedAgent.name]: currentModalConfig }
    setAgentConfigs(newConfigs)
    localStorage.setItem('nexusguard_agent_configs', JSON.stringify(newConfigs))
    setSelectedAgent(null)
  }

  const getPrimaryConfigDisplay = (name: string, config: any) => {
    switch(name) {
      case 'Validation': return `Model: ${config.model.split(' ')[0]}`
      case 'Escrow': return `Limit: ${config.threshold} USDC`
      case 'Compliance': return `Tax: ${config.tax.split(' ')[0]}`
      case 'Payment': return `Max Gas: ${config.gas} Gwei`
      case 'Risk': return `Max Tx: $${config.maxTx}`
      default: return ''
    }
  }

  const handleDeployAgent = () => {
    if (!newAgentForm.name || !newAgentForm.role) return;
    const newAgent = {
      name: newAgentForm.name,
      role: newAgentForm.role,
      status: 'Active',
      uptime: '100%',
      color: 'emerald',
      icon: Terminal
    }
    setActiveAgents([...activeAgents, newAgent])
    setShowDeployModal(false)
    setNewAgentForm({ name: '', role: '', endpoint: '' })
  }

  const mockActions = [
    { time: '10:45:22', agent: 'Validation', action: 'Approved deliverable score: 95/100', target: 'Job #002', hash: '0xabc...123' },
    { time: '10:45:24', agent: 'Escrow', action: 'Unlocked funds for payment', target: 'Job #002', hash: '0xdef...456' },
    { time: '10:45:25', agent: 'Compliance', action: 'Generated W-9 tax record', target: 'Provider 0x456', hash: '--' },
    { time: '10:45:26', agent: 'Payment', action: 'Executed 2,500 USDC transfer', target: 'Job #002', hash: '0xghi...789' },
    { time: '09:12:05', agent: 'Risk', action: 'Flagged suspicious IP', target: 'Login attempt', hash: '--' },
    { time: '08:30:00', agent: 'Escrow', action: 'Locked 5,000 USDC', target: 'Job #001', hash: '0xjkl...012' },
  ]

  const getAgentColorStyle = (color: string) => {
    switch(color) {
      case 'blue': return 'text-blue-400 border-blue-400/30 bg-blue-400/5 group-hover:border-blue-400/60 group-hover:bg-blue-400/10'
      case 'purple': return 'text-purple-400 border-purple-400/30 bg-purple-400/5 group-hover:border-purple-400/60 group-hover:bg-purple-400/10'
      case 'emerald': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5 group-hover:border-emerald-400/60 group-hover:bg-emerald-400/10'
      case 'yellow': return 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/5 group-hover:border-[#d4af37]/60 group-hover:bg-[#d4af37]/10'
      case 'red': return 'text-red-400 border-red-400/30 bg-red-400/5 group-hover:border-red-400/60 group-hover:bg-red-400/10'
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/5 group-hover:border-gray-400/60 group-hover:bg-gray-400/10'
    }
  }
  
  const getAgentGlow = (color: string) => {
    switch(color) {
      case 'blue': return 'shadow-[0_0_15px_rgba(96,165,250,0.3)]'
      case 'purple': return 'shadow-[0_0_15px_rgba(192,132,252,0.3)]'
      case 'emerald': return 'shadow-[0_0_15px_rgba(52,211,153,0.3)]'
      case 'yellow': return 'shadow-[0_0_15px_rgba(212,175,55,0.3)]'
      case 'red': return 'shadow-[0_0_15px_rgba(248,113,113,0.3)]'
      default: return ''
    }
  }

  const getAgentBadge = (agentName: string) => {
    const agent = activeAgents.find(a => a.name === agentName)
    if (!agent) return 'text-gray-400 border-gray-400/30 bg-gray-400/5'
    return getAgentColorStyle(agent.color).split('group-hover')[0]
  }

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-1 flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#d4af37]" />
            Agent_Swarm
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Monitor and configure your autonomous workforce</p>
        </div>
        <button 
          onClick={() => setShowDeployModal(true)}
          className="border border-[#d4af37] bg-[#d4af37]/5 hover:bg-[#d4af37]/20 text-[#d4af37] px-6 py-2 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          Deploy New Agent
        </button>
      </div>

      {/* Agents Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeAgents.map((agent) => {
          const Icon = agent.icon
          return (
            <div 
              key={agent.name}
              onClick={() => setSelectedAgent(agent)}
              className={`group bg-gray-900/40 border rounded-sm p-5 relative transition-all duration-300 ${getAgentColorStyle(agent.color)} cursor-pointer hover:-translate-y-1`}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-50" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current opacity-50" />
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-current opacity-50" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-50" />

              <div className={`w-12 h-12 mx-auto rounded-full bg-black/50 flex items-center justify-center mb-4 border border-current relative ${getAgentGlow(agent.color)} transition-shadow`}>
                <Icon className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0e1a] animate-pulse"></div>
              </div>
              
              <h3 className="font-bold text-center uppercase tracking-widest text-xs mb-1 group-hover:text-white transition-colors">{agent.name}</h3>
              <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider mb-2 h-6 opacity-80 group-hover:opacity-100 transition-opacity">{agent.role}</p>
              
              <div className="text-[9px] text-[#d4af37] text-center font-bold uppercase tracking-widest mb-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity">
                {mounted ? getPrimaryConfigDisplay(agent.name, agentConfigs[agent.name] || getDefaultConfig(agent.name)) : ''}
              </div>
              
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest border-t border-current/20 pt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <span>Uptime</span>
                <span className="font-bold">{agent.uptime}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Log */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-500" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gray-500" />
        
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
          <Terminal className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">NETWORK_ACTIVITY_LOG</h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="pb-3 font-bold w-24">Timestamp</th>
                <th className="pb-3 font-bold w-36">Node / Agent</th>
                <th className="pb-3 font-bold">Execution Data</th>
                <th className="pb-3 font-bold w-48">Target Entity</th>
                <th className="pb-3 font-bold text-right w-36">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {mockActions.map((action, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-[#d4af37]/5 transition-colors">
                  <td className="py-4 text-gray-500 font-mono">{action.time}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${getAgentBadge(action.agent)}`}>
                      {action.agent}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{action.action}</td>
                  <td className="py-4 text-gray-400 font-mono">{action.target}</td>
                  <td className="py-4 text-right font-mono">
                    {action.hash !== '--' ? (
                      <a href="#" className="text-[#d4af37] hover:underline hover:text-white transition-colors">{action.hash}</a>
                    ) : (
                      <span className="text-gray-700">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Configuration Modal */}
      {selectedAgent && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-mono">
          <div className={`bg-[#0a0e1a] border border-current rounded-sm max-w-md w-full p-6 relative ${getAgentColorStyle(selectedAgent.color).split('group-hover')[0]}`}>
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
              <div className={`w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-current ${getAgentGlow(selectedAgent.color)}`}>
                <selectedAgent.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-space-grotesk text-white tracking-widest uppercase">{selectedAgent.name} NODE</h2>
                <p className="text-xs uppercase tracking-widest">{selectedAgent.role}</p>
              </div>
            </div>

            <div className="space-y-6 text-gray-300">
              {/* Dynamic Config Based on Agent */}
              {selectedAgent.name === 'Validation' && (
                <>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Evaluation Strictness</label>
                    <select 
                      value={currentModalConfig.strictness}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, strictness: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option>Standard (Balanced)</option>
                      <option>Lax (Fast Approval)</option>
                      <option>Strict (High Quality)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Core AI Model</label>
                    <select 
                      value={currentModalConfig.model}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, model: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option>GPT-4o (OpenAI)</option>
                      <option>Claude 3.5 Sonnet (Anthropic)</option>
                      <option>Llama 3 70B (Meta)</option>
                    </select>
                  </div>
                </>
              )}
              {selectedAgent.name === 'Escrow' && (
                <>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Auto-Lock Threshold (USDC)</label>
                    <input 
                      type="number" 
                      value={currentModalConfig.threshold}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, threshold: Number(e.target.value)})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-blue-400" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={currentModalConfig.multisig}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, multisig: e.target.checked})}
                      className="w-4 h-4 accent-blue-500" 
                    />
                    <label className="text-sm">Enable Multi-Sig Fallback</label>
                  </div>
                </>
              )}
              {selectedAgent.name === 'Compliance' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <input 
                      type="checkbox" 
                      checked={currentModalConfig.kyc}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, kyc: e.target.checked})}
                      className="w-4 h-4 accent-emerald-500" 
                    />
                    <label className="text-sm">Enforce strict KYC for providers</label>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Tax Jurisdiction</label>
                    <select 
                      value={currentModalConfig.tax}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, tax: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-emerald-400"
                    >
                      <option>US (W-9 / 1099-NEC)</option>
                      <option>EU (VAT Rules)</option>
                      <option>Global (No specific tax form)</option>
                    </select>
                  </div>
                </>
              )}
              {selectedAgent.name === 'Payment' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <input 
                      type="checkbox" 
                      checked={currentModalConfig.batch}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, batch: e.target.checked})}
                      className="w-4 h-4 accent-yellow-500" 
                    />
                    <label className="text-sm">Batch transactions to save gas</label>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Max Gas Fee Limit (Gwei)</label>
                    <input 
                      type="number" 
                      value={currentModalConfig.gas}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, gas: Number(e.target.value)})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-yellow-400" 
                    />
                  </div>
                </>
              )}
              {selectedAgent.name === 'Risk' && (
                <>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Max Tx Value before Manual Review</label>
                    <input 
                      type="number" 
                      value={currentModalConfig.maxTx}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, maxTx: Number(e.target.value)})}
                      className="w-full bg-black/50 border border-gray-700 rounded-sm p-2 text-sm focus:outline-none focus:border-red-400" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={currentModalConfig.blockVpn}
                      onChange={(e) => setCurrentModalConfig({...currentModalConfig, blockVpn: e.target.checked})}
                      className="w-4 h-4 accent-red-500" 
                    />
                    <label className="text-sm">Block known VPN/Tor exit nodes</label>
                  </div>
                </>
              )}
              
              <button 
                onClick={handleSaveConfig}
                className="w-full mt-6 border border-current bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-sm transition-colors uppercase tracking-widest text-xs"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Deploy New Agent Modal */}
      {showDeployModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0a0e1a] border border-[#d4af37]/30 rounded-sm max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowDeployModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/30">
                <Terminal className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-space-grotesk text-white tracking-widest uppercase">DEPLOY NEW AGENT</h2>
                <p className="text-xs text-[#d4af37] uppercase tracking-widest">Add a custom AI node</p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Agent Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Copyright Checker"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-sm p-3 text-sm focus:outline-none focus:border-[#d4af37]" 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Role / Function</label>
                <input 
                  type="text"
                  placeholder="e.g. Image analysis"
                  value={newAgentForm.role}
                  onChange={(e) => setNewAgentForm({...newAgentForm, role: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-sm p-3 text-sm focus:outline-none focus:border-[#d4af37]" 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">AI Endpoint URL (Webhook)</label>
                <input 
                  type="text"
                  placeholder="https://api.your-ai.com/webhook"
                  value={newAgentForm.endpoint}
                  onChange={(e) => setNewAgentForm({...newAgentForm, endpoint: e.target.value})}
                  className="w-full bg-black/50 border border-gray-700 rounded-sm p-3 text-sm focus:outline-none focus:border-[#d4af37] text-emerald-400" 
                />
              </div>
              
              <button 
                onClick={handleDeployAgent}
                disabled={!newAgentForm.name || !newAgentForm.role}
                className="w-full mt-6 border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 rounded-sm transition-colors uppercase tracking-widest text-xs"
              >
                Initialize Node
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
