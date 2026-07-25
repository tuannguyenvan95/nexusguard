'use client'

import { Shield, BrainCircuit, Activity, Clock, Terminal, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { BlueprintDropdown } from '@/components/ui/BlueprintDropdown'

export default function TeamPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Developer')
  const [isInviting, setIsInviting] = useState(false)

  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [editMemberRole, setEditMemberRole] = useState('')

  const [mockMembers, setMockMembers] = useState([
    { id: 1, name: 'Alex Rivera', email: 'alex@acme.network', role: 'Admin', score: 98, avatar: 'A', status: 'ACTIVE', wallet: '0x71C...3B9E', agent: 'GUARDIAN NODE', earned: '12,500 USDC' },
    { id: 2, name: 'Sam Chen', email: 'sam@acme.network', role: 'Developer', score: 92, avatar: 'S', status: 'SYNCING', wallet: '0x4F2...9A1B', agent: 'VALIDATION NODE', earned: '4,200 USDC' },
    { id: 3, name: 'Taylor Swift', email: 'taylor@acme.network', role: 'Designer', score: 88, avatar: 'T', status: 'OFFLINE', wallet: '0x9E1...4C2D', agent: 'STRATEGY NODE', earned: '1,800 USDC' },
    { id: 4, name: 'Jordan Lee', email: 'jordan@acme.network', role: 'Treasury', score: 95, avatar: 'J', status: 'ACTIVE', wallet: '0x2D4...7F5A', agent: 'COMPLIANCE NODE', earned: '8,900 USDC' },
  ])

  const [previewLink, setPreviewLink] = useState<string | null>(null)
  
  // M2M Ledger State
  const [nanoLedger, setNanoLedger] = useState<any[]>([
    { id: 'tx_1', from: 'VALIDATOR NODE', to: 'COMPLIANCE NODE', amount: '0.005 USDC', reason: 'Risk Analysis Data' },
    { id: 'tx_2', from: 'ESCROW NODE', to: 'VALIDATOR NODE', amount: '0.002 USDC', reason: 'PR Validation Check' },
    { id: 'tx_3', from: 'STRATEGY NODE', to: 'GUARDIAN NODE', amount: '0.010 USDC', reason: 'Anomaly Security Scan' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setNanoLedger(prev => {
        const nodes = ['VALIDATOR', 'COMPLIANCE', 'ESCROW', 'STRATEGY', 'GUARDIAN']
        const from = nodes[Math.floor(Math.random() * nodes.length)]
        let to = nodes[Math.floor(Math.random() * nodes.length)]
        while (to === from) to = nodes[Math.floor(Math.random() * nodes.length)]
        
        const amount = (Math.random() * 0.05).toFixed(3)
        const reasons = ['API Query', 'Risk Score', 'Audit Check', 'Data Sync', 'Consensus Vote']
        const reason = reasons[Math.floor(Math.random() * reasons.length)]
        
        const newTx = { id: `tx_${Date.now()}`, from: `${from} NODE`, to: `${to} NODE`, amount: `${amount} USDC`, reason }
        return [newTx, ...prev].slice(0, 8)
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsInviting(true)
    setPreviewLink(null)
    setTerminalOutput(['[SYS] Initializing secure invite protocol...'])
    
    // Simulate terminal animation
    setTimeout(() => setTerminalOutput(prev => [...prev, '[AUTH] Generating cryptographic zero-knowledge proofs...']), 500)
    setTimeout(() => setTerminalOutput(prev => [...prev, '[NET] Broadcasting node injection request to Swarm...']), 1200)

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })
      const data = await res.json()

      if (data.previewUrl) {
        setTimeout(() => {
          setTerminalOutput(prev => [...prev, '[SUCCESS] SMTP relay confirmed. Node injected successfully.'])
          setPreviewLink(data.previewUrl)
          setMockMembers([...mockMembers, {
            id: Date.now(),
            name: 'Pending Invite...',
            email: email,
            role: role,
            score: 0,
            avatar: '?',
            status: 'SYNCING',
            wallet: 'AWAITING...',
            agent: 'ASSIGNING...',
            earned: '0 USDC'
          }])
          setEmail('')
        }, 2000)
        
        setTimeout(() => {
          setIsInviting(false)
          setTerminalOutput([])
        }, 4000)
      } else {
        alert("Error: " + (data.error || "Unable to send email."))
        setIsInviting(false)
        setTerminalOutput([])
      }
    } catch (err) {
      alert("Server connection error.")
      setIsInviting(false)
      setTerminalOutput([])
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold mb-1 text-[#d4af37] uppercase tracking-tight">Team Management_</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Manage your team members and their roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Section */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative flex flex-col">
          {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#d4af37]/50" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#d4af37]/50" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#d4af37]/50" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#d4af37]/50" />

        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Invite New Member</h3>
        <form className="flex flex-col sm:flex-row sm:flex-wrap gap-4" onSubmit={handleInvite}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="flex-auto min-w-[200px] bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <div className="w-full sm:w-40 z-50 flex-none">
            <BlueprintDropdown 
              options={['Developer', 'Designer', 'Treasury', 'Admin']}
              value={role}
              onChange={setRole}
            />
          </div>
          <button 
            type="submit"
            disabled={isInviting}
            className="flex-none border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 disabled:opacity-50 text-[#d4af37] px-6 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isInviting ? (
              <>
                <Terminal className="w-4 h-4 animate-pulse" />
                DEPLOYING...
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                SEND SECURE INVITE
              </>
            )}
          </button>
        </form>

        {/* Available Nodes to assign */}
        <div className="mt-8 border-t border-gray-800 pt-6 flex-1">
          <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BrainCircuit className="w-3 h-3" /> Available AI Nodes For Assignment
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'ESCROW NODE v4.0', status: 'IDLE', util: '0%', icon: '💰' },
              { name: 'TREASURY NODE v2.2', status: 'ACTIVE', util: '92%', icon: '🏦' },
              { name: 'VALIDATOR NODE v1.1', status: 'IDLE', util: '0%', icon: '✅' },
              { name: 'GUARDIAN NODE v3.0', status: 'ACTIVE', util: '45%', icon: '🛡️' },
              { name: 'STRATEGY NODE v1.5', status: 'MAINTENANCE', util: '--', icon: '🧠' },
              { name: 'ANALYTICS NODE v2.1', status: 'IDLE', util: '0%', icon: '📊' },
            ].map((node, i) => (
              <div key={i} className="bg-black/30 border border-gray-800/50 rounded-sm p-3 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-[10px] font-bold text-gray-300 font-mono flex items-center gap-1.5">
                    <span className="text-xs">{node.icon}</span> {node.name}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-2 border-t border-gray-800/50">
                  <span className={node.status === 'IDLE' ? 'text-emerald-400' : node.status === 'ACTIVE' ? 'text-blue-400' : 'text-yellow-500'}>
                    [{node.status}]
                  </span>
                  <span className="text-gray-500">Util: {node.util}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Output Simulation */}
        {terminalOutput.length > 0 && (
          <div className="mt-4 p-4 bg-black/60 border border-gray-800 rounded-sm font-mono text-[10px] sm:text-xs space-y-1 h-32 overflow-y-auto">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className={line.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                <span className="text-gray-600 mr-2">{new Date().toISOString().split('T')[1].slice(0,8)}</span> 
                {line}
              </div>
            ))}
          </div>
        )}

        {previewLink && (
          <div className="mt-4 p-4 border border-[#d4af37]/30 bg-[#d4af37]/5 rounded-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[#d4af37] font-bold text-sm uppercase tracking-wide">📧 Email Invitation Sent!</span>
              <span className="text-gray-400 text-xs font-mono mt-1">A real email has been sent via SMTP server.</span>
            </div>
            <a 
              href={previewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#b08d20] transition-colors"
            >
              View Inbox
            </a>
          </div>
          )}
        </div>

        {/* M2M Nano-transactions Ledger */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative flex flex-col">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-emerald-500/50" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-emerald-500/50" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-emerald-500/50" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-emerald-500/50" />

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-emerald-400" /> M2M ECONOMY (ARC NANOPAYMENTS)
            </h3>
          </div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Live sub-cent transactions between autonomous agents</p>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {nanoLedger.map((tx) => (
              <div key={tx.id} className="bg-black/50 border border-gray-800 rounded-sm p-3 hover:border-emerald-500/30 transition-colors group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-gray-300 font-mono group-hover:text-emerald-400 transition-colors">{tx.from} &rarr; {tx.to}</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">{tx.amount}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest">
                  <span className="text-gray-500">Service: {tx.reason}</span>
                  <span className="text-gray-600">No Human Appr.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMembers.map((member) => (
          <div 
            key={member.id} 
            onClick={() => setSelectedMember(member)}
            className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 hover:border-[#d4af37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer transition-all relative group flex flex-col h-full"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-700 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-700 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-700 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-700 group-hover:border-[#d4af37] transition-colors" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-gray-700 bg-black/50 flex items-center justify-center text-xl font-space-grotesk font-bold text-gray-300 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-colors relative">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    member.avatar
                  )}
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black ${
                    member.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                    member.status === 'SYNCING' ? 'bg-yellow-500 animate-spin' : 'bg-gray-500'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-lg uppercase tracking-tight">{member.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-gray-500 text-[10px] font-mono">{member.email}</p>
                    <span className="text-gray-700 text-[10px]">•</span>
                    <p className="text-gray-500 text-[10px] font-mono">{member.wallet}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 mt-2">
              <div className="bg-black/30 border border-gray-800 rounded-sm p-3 flex items-center gap-3">
                <BrainCircuit className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                <div>
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Agent Overseer</p>
                  <p className="text-xs font-bold text-gray-300 group-hover:text-purple-400 transition-colors uppercase tracking-widest">{member.agent}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 border-t border-gray-800 pt-4">
              <div>
                <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1"><Shield className="w-3 h-3"/> Role</div>
                <span className="font-mono text-gray-300 text-[11px] uppercase truncate block">
                  {member.role}
                </span>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Score</div>
                <div className="text-[#d4af37] font-mono text-[11px] font-bold">{member.score}/100</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Paid</div>
                <div className="text-emerald-400 font-mono text-[11px] font-bold truncate block">{member.earned}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 border border-gray-700 rounded-sm p-6 w-full max-w-lg font-mono relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
              <div 
                className="w-16 h-16 border border-[#d4af37] bg-[#d4af37]/10 flex items-center justify-center text-2xl font-space-grotesk font-bold text-[#d4af37] relative group cursor-pointer"
                onClick={() => {
                  const url = window.prompt("Enter Logo/Avatar image URL (leave empty to revert to text):", selectedMember.avatarUrl || "");
                  if (url !== null) {
                    const updatedMembers = mockMembers.map((m: any) => m.id === selectedMember.id ? {...m, avatarUrl: url} : m);
                    setMockMembers(updatedMembers);
                    setSelectedMember({...selectedMember, avatarUrl: url});
                  }
                }}
              >
                {selectedMember.avatarUrl ? (
                  <img src={selectedMember.avatarUrl} alt={selectedMember.name} className="w-full h-full object-cover" />
                ) : (
                  selectedMember.avatar
                )}
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-mono uppercase tracking-widest text-center px-1">Change Logo</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-200 uppercase tracking-tight">{selectedMember.name}</h2>
                <p className="text-gray-400 text-xs mt-1">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-sm">
                  <span className="text-[10px] text-gray-500 block uppercase mb-1">Status</span>
                  <span className={`text-xs font-bold ${selectedMember.status === 'ACTIVE' ? 'text-emerald-400' : 'text-yellow-400'}`}>{selectedMember.status}</span>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-sm">
                  <span className="text-[10px] text-gray-500 block uppercase mb-1">Trust Score</span>
                  <span className="text-xs font-bold text-[#d4af37]">{selectedMember.score}/100</span>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-sm">
                <span className="text-[10px] text-gray-500 block uppercase mb-2">Connected Wallet</span>
                <div className="text-gray-300 text-xs truncate font-bold">{selectedMember.wallet}</div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-sm">
                <span className="text-[10px] text-gray-500 block uppercase mb-2">Total Earned</span>
                <div className="text-emerald-400 text-sm font-bold">{selectedMember.earned}</div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-sm">
                <span className="text-[10px] text-gray-500 block uppercase mb-2">Member Role</span>
                {isEditingRole ? (
                  <div className="z-50 relative">
                    <BlueprintDropdown 
                      options={['Developer', 'Designer', 'Treasury', 'Admin']}
                      value={editMemberRole}
                      onChange={setEditMemberRole}
                    />
                  </div>
                ) : (
                  <div className="text-gray-300 text-xs font-bold uppercase tracking-widest">{selectedMember.role}</div>
                )}
              </div>

              <div className="bg-black/50 border border-gray-800 p-4 rounded-sm">
                <span className="text-[10px] text-gray-500 block uppercase mb-2">Assigned Agent Protocol</span>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">{selectedMember.agent}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  setMockMembers(mockMembers.filter((m: any) => m.id !== selectedMember.id));
                  setSelectedMember(null);
                }}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-colors"
              >
                REVOKE ACCESS
              </button>
              {isEditingRole ? (
                <button 
                  onClick={() => {
                    const updatedMembers = mockMembers.map((m: any) => m.id === selectedMember.id ? {...m, role: editMemberRole} : m);
                    setMockMembers(updatedMembers);
                    setSelectedMember({...selectedMember, role: editMemberRole});
                    setIsEditingRole(false);
                  }}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  SAVE ROLE
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingRole(true)}
                  className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/50 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  EDIT ROLE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
