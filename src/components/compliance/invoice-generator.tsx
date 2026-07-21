'use client';

import { useState } from 'react';
import { FileText, Download, Building, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InvoiceGenerator() {
  const [jobId, setJobId] = useState('');
  const [jurisdiction, setJurisdiction] = useState<'VN' | 'US'>('US');
  const [fromName, setFromName] = useState('NexusGuard Agentic');
  const [toName, setToName] = useState('');

  // Mock job data
  const jobs = [
    { id: '1', title: 'Smart Contract Audit', amount: 5000 },
    { id: '2', title: 'Frontend Development', amount: 2500 },
  ];

  const selectedJob = jobs.find(j => j.id === jobId);
  const subtotal = selectedJob ? selectedJob.amount : 0;
  const taxRate = jurisdiction === 'VN' ? 0.10 : 0;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Generate Invoice
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Completed Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
            >
              <option value="">Choose a job...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title} (${job.amount})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tax Jurisdiction</label>
            <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-black/20">
              <button
                type="button"
                onClick={() => setJurisdiction('US')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                  jurisdiction === 'US' ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                )}
              >
                <Globe className="w-4 h-4" /> United States (0%)
              </button>
              <button
                type="button"
                onClick={() => setJurisdiction('VN')}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
                  jurisdiction === 'VN' ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                )}
              >
                <Building className="w-4 h-4" /> Vietnam (10%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">From Entity</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bill To</label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Client name"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <button 
            disabled={!selectedJob || !toName}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white p-8 rounded-2xl text-gray-900 relative shadow-2xl overflow-hidden min-h-[400px]">
        {/* Subtle watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="text-8xl font-bold rotate-[-45deg] tracking-tighter">NEXUS</span>
        </div>
        
        {(!selectedJob || !toName) ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <p className="text-gray-500 font-medium">Fill required fields to preview</p>
          </div>
        ) : null}

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">INVOICE</h3>
              <p className="text-gray-500 text-sm mt-1">INV-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
            </div>
            <div className="text-right">
              <div className="w-8 h-8 rounded-lg bg-blue-600 ml-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-lg">⬡</span>
              </div>
              <p className="font-bold text-gray-900">{fromName}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-bold text-gray-900 text-lg">{toName || 'Client Name'}</p>
          </div>

          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-3 font-bold text-gray-900 uppercase tracking-wider">Description</th>
                <th className="text-right py-3 font-bold text-gray-900 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 font-medium">{selectedJob?.title || 'Service Description'}</td>
                <td className="py-4 text-right font-medium">${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="w-1/2 ml-auto space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Tax ({jurisdiction} - {taxRate * 100}%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t-2 border-gray-900">
              <span>Total Due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
