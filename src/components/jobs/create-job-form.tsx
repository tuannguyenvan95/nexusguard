'use client';

import { useState } from 'react';
import { Plus, X, DollarSign, Clock, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JobFormData {
  title: string;
  description: string;
  provider: string;
  budget: number;
  expiry: string;
  milestones: { name: string; percentage: number }[];
}

interface CreateJobFormProps {
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
}

export function CreateJobForm({ onSubmit, onCancel }: CreateJobFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    provider: '',
    budget: 0,
    expiry: '72h',
    milestones: [{ name: 'Final Delivery', percentage: 100 }]
  });

  const providers = ['Alice (Frontend)', 'Bob (Smart Contracts)', 'Charlie (Design)'];
  const expiries = ['24h', '48h', '72h', '1 week'];

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', percentage: 0 }]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index: number, field: 'name' | 'percentage', value: string | number) => {
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      return { ...prev, milestones: newMilestones };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto w-full shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Job</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Job Title *</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input 
              required
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              placeholder="e.g. Smart Contract Audit"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
          <textarea 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px] resize-y"
            placeholder="Describe the scope of work..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Provider *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <select 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
                value={formData.provider}
                onChange={e => setFormData({...formData, provider: e.target.value})}
              >
                <option value="">Select a provider...</option>
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Budget (USDC) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                required
                type="number" 
                min="0"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="0.00"
                value={formData.budget || ''}
                onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Expiry Time *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <select 
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
              value={formData.expiry}
              onChange={e => setFormData({...formData, expiry: e.target.value})}
            >
              {expiries.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-400">Milestones</label>
            <button 
              type="button" 
              onClick={addMilestone}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {formData.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <input 
                  type="text"
                  placeholder="Milestone name"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  value={m.name}
                  onChange={e => updateMilestone(i, 'name', e.target.value)}
                  required
                />
                <div className="relative w-24 shrink-0">
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    placeholder="%"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    value={m.percentage || ''}
                    onChange={e => updateMilestone(i, 'percentage', Number(e.target.value))}
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
                {formData.milestones.length > 1 && (
                  <button type="button" onClick={() => removeMilestone(i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/10">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : null}
          Create Job
        </button>
      </div>
    </form>
  );
}
