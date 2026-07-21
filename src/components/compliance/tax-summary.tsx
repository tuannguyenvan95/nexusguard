'use client';

import { useState } from 'react';
import { Download, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaxSummary() {
  const [year, setYear] = useState('2024');
  const years = ['2024', '2025', '2026'];

  // Mock data based on year
  const data = {
    '2024': { income: 125000, tax: 4500, usIncome: 80000, vnIncome: 45000 },
    '2025': { income: 210000, tax: 8200, usIncome: 128000, vnIncome: 82000 },
    '2026': { income: 0, tax: 0, usIncome: 0, vnIncome: 0 },
  }[year] || { income: 0, tax: 0, usIncome: 0, vnIncome: 0 };

  const netIncome = data.income - data.tax;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          Tax Liability Summary
        </h2>
        
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                year === y ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Income (USDC)</p>
          <p className="text-2xl font-bold text-white">${data.income.toLocaleString()}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <p className="text-amber-400/80 text-sm font-medium mb-1">Est. Tax Liability</p>
          <p className="text-2xl font-bold text-amber-400">${data.tax.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
          <p className="text-emerald-400/80 text-sm font-medium mb-1">Net Retained</p>
          <p className="text-2xl font-bold text-emerald-400">${netIncome.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Jurisdiction</th>
              <th className="px-4 py-3">Gross Income</th>
              <th className="px-4 py-3">Tax Rate</th>
              <th className="px-4 py-3 rounded-tr-lg">Tax Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                United States (Agentic LLC)
              </td>
              <td className="px-4 py-4 text-gray-300">${data.usIncome.toLocaleString()}</td>
              <td className="px-4 py-4 text-gray-400">0% (Pass-through)</td>
              <td className="px-4 py-4 text-white font-medium">$0</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Vietnam (Contractors)
              </td>
              <td className="px-4 py-4 text-gray-300">${data.vnIncome.toLocaleString()}</td>
              <td className="px-4 py-4 text-gray-400">10% (VAT/CIT)</td>
              <td className="px-4 py-4 text-amber-400 font-medium">${(data.vnIncome * 0.1).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>
  );
}
