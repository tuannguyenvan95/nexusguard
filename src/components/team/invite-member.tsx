'use client';

import { useState } from 'react';
import { Mail, Shield, Send, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InviteMember() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  
  const pendingInvites = [
    { email: 'alex@example.com', role: 'Contractor', date: '2 hours ago' },
    { email: 'sarah@example.com', role: 'Admin', date: '1 day ago' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Invite Team Member</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="email" 
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        
        <div className="relative w-full md:w-48 shrink-0">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
          >
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Contractor">Contractor</option>
          </select>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]">
          <Send className="w-4 h-4" />
          Send Invite
        </button>
      </div>

      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pending Invites</h3>
          <div className="space-y-3">
            {pendingInvites.map((invite, idx) => (
              <div key={idx} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{invite.role}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="text-xs text-gray-500">{invite.date}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel Invite">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
