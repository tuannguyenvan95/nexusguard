'use client'

import { Scale, FileText, Download, Activity, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function CompliancePage() {
  const [mounted, setMounted] = useState(false)
  const [isAuditing, setIsAuditing] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRunAudit = () => {
    setIsAuditing(true)
    setTimeout(() => {
      setIsAuditing(false)
      setShowReport(true)
    }, 2500)
  }

  const mockInvoices = [
    { id: 'INV-2026-042', job: 'Frontend UI', amount: '$2,500.00', tax: '$0.00', total: '$2,500.00', status: 'Paid', date: 'Oct 26, 2026' },
    { id: 'INV-2026-041', job: 'Audit', amount: '$5,000.00', tax: '$500.00', total: '$5,500.00', status: 'Draft', date: 'Oct 24, 2026' },
    { id: 'INV-2026-040', job: 'Backend API', amount: '$3,200.00', tax: '$0.00', total: '$3,200.00', status: 'Paid', date: 'Oct 20, 2026' },
    { id: 'INV-2026-039', job: 'Design System', amount: '$1,800.00', tax: '$180.00', total: '$1,980.00', status: 'Paid', date: 'Oct 15, 2026' },
  ]

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-1 flex items-center gap-3">
            <Scale className="w-8 h-8 text-[#d4af37]" />
            Compliance_&_Invoices
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Automated tax rules and document generation</p>
        </div>
        <button 
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="border border-[#d4af37] bg-[#d4af37]/5 hover:bg-[#d4af37]/20 text-[#d4af37] px-6 py-2 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {isAuditing ? 'Auditing Network...' : 'Run Compliance Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Generator */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-50 text-[#d4af37]" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current opacity-50 text-[#d4af37]" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-current opacity-50 text-[#d4af37]" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-50 text-[#d4af37]" />

          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
            <FileText className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">MANUAL_INVOICE_GENERATOR</h3>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Create a one-off invoice. Taxes calculated automatically based on jurisdiction.</p>
          
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Provider Address / ID</label>
                <input type="text" placeholder="0x..." className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-gray-300" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Jurisdiction</label>
                <select className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-gray-300">
                  <option>United States (US)</option>
                  <option>Vietnam (VN)</option>
                  <option>Singapore (SG)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Description</label>
              <input type="text" placeholder="e.g. Smart Contract Audit" className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-gray-300" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Amount (USDC)</label>
              <input type="number" placeholder="0.00" className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-emerald-400" />
            </div>
            <button type="button" className="w-full mt-6 border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] font-bold py-3 rounded-sm transition-colors uppercase tracking-widest text-xs">
              Generate Draft
            </button>
          </form>
        </div>

        {/* Tax Summary */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-500" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gray-500" />
          
          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
            <Scale className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">TAX_RULES_SUMMARY</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-sm border border-gray-800 bg-black/30 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-300 uppercase tracking-widest text-xs">US Contractors (W-9)</h4>
                <span className="text-emerald-400 text-[10px] font-bold border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded-sm uppercase">Active</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">0% withholding. Requires W-9 collection before first payment over $600.</p>
            </div>
            
            <div className="p-4 rounded-sm border border-gray-800 bg-black/30 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-300 uppercase tracking-widest text-xs">Vietnam (FCT)</h4>
                <span className="text-emerald-400 text-[10px] font-bold border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded-sm uppercase">Active</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">10% Foreign Contractor Tax applied to all service payments sent to VN residents.</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-500">Estimated Q4 Tax Liability</span>
                <span className="text-emerald-400 font-bold">$1,450.00 USDC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-500" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gray-500" />
        
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
          <FileText className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">RECENT_INVOICES_LOG</h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="pb-3 font-bold w-32">Invoice #</th>
                <th className="pb-3 font-bold w-32">Date</th>
                <th className="pb-3 font-bold">Job / Desc</th>
                <th className="pb-3 font-bold w-24">Status</th>
                <th className="pb-3 font-bold text-right w-32">Total</th>
                <th className="pb-3 font-bold text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-[#d4af37]/5 transition-colors">
                  <td className="py-4 text-gray-300 font-bold">{inv.id}</td>
                  <td className="py-4 text-gray-500">{inv.date}</td>
                  <td className="py-4 text-gray-400">{inv.job}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'Paid' 
                        ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' 
                        : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-bold text-emerald-400">{inv.total}</td>
                  <td className="py-4 text-center">
                    <button className="text-[#d4af37] hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                      <Download className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-widest">PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Report Modal */}
      {showReport && mounted && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0a0e1a] border border-emerald-500/50 rounded-sm max-w-lg w-full p-6 relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <button 
              onClick={() => setShowReport(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-space-grotesk text-white tracking-widest uppercase">AUDIT_REPORT_COMPLETE</h2>
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest">Global Agentic Tax Compliance Scan</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-black/50 p-4 border border-gray-800 rounded-sm font-mono text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Transactions Scanned (30d):</span>
                  <span className="text-white font-bold">1,248 Tx</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Active Escrow Contracts:</span>
                  <span className="text-white">56</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">KYC / AML Flags Raised:</span>
                  <span className="text-yellow-500 font-bold">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Missing Tax Forms (W-9/W-8BEN):</span>
                  <span className="text-yellow-500 font-bold">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Smart Contract Anomalies:</span>
                  <span className="text-emerald-400 font-bold">0 (Secure)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Critical Legal Violations:</span>
                  <span className="text-emerald-400 font-bold">0</span>
                </div>
                
                <div className="border-t border-gray-800 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Taxes Auto-Withheld (Q4):</span>
                  <span className="text-[#d4af37] font-bold text-sm">$1,450.00 USDC</span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Action Required</p>
                  <p className="text-[10px] text-gray-400 uppercase leading-relaxed">
                    - Provider <strong>0x4B2...</strong> is missing W-9 form for upcoming $800 payment.<br/>
                    - 2 transactions blocked from restricted jurisdictions (OFAC List).<br/>
                    <em>Payments suspended by Agent until resolved.</em>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowReport(false)}
                className="w-full mt-4 border border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3 rounded-sm transition-colors uppercase tracking-widest text-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

