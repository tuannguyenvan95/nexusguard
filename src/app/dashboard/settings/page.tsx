'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Settings, Shield, Bell, Key, Globe, Database } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useWallet } from '@/hooks/useWallet'
import { formatWalletAddress } from '@/lib/wallet'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { isLightMode, setTheme } = useTheme()
  const { address: walletAddress, walletKind, isConnecting, connect, disconnect } = useWallet()

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> }
  ]

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-space-grotesk font-bold mb-1 text-[#d4af37] tracking-tight uppercase flex items-center gap-3">
          <Settings className="w-8 h-8" />
          System Settings_
        </h1>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Configuration & Preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation */}
        <motion.div variants={itemVariants} className="w-full lg:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-mono text-sm uppercase tracking-wider transition-colors ${
                activeTab === tab.id 
                ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Settings Content */}
        <motion.div variants={itemVariants} className="flex-1 glass p-6 rounded-sm relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#d4af37]/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#d4af37]/50" />
          
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-lg font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#d4af37]" />
                  Global Preferences
                </h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Display Theme</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-sm font-mono text-xs uppercase transition-colors cursor-pointer border ${
                        !isLightMode
                          ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]'
                          : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      Dark Mode
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-sm font-mono text-xs uppercase transition-colors cursor-pointer border ${
                        isLightMode
                          ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]'
                          : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      Light Mode
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Language</label>
                  <select className="w-full max-w-xs bg-gray-900 border border-gray-700 rounded-sm px-3 py-2 text-white font-mono text-sm outline-none focus:border-[#d4af37] transition-colors">
                    <option value="en">English (US)</option>
                    <option value="vi">Vietnamese (VN)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-lg font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Security & Connections
                </h2>
              </div>
              <p className="text-sm font-mono text-gray-400">Manage your wallet connections and two-factor authentication.</p>
              
              <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-sm flex items-center justify-between group hover:border-gray-700 transition-colors">
                <div>
                  <div className="text-sm font-bold text-gray-200">MetaMask Wallet</div>
                  <div className="text-xs font-mono text-gray-500 mt-1">
                    {walletAddress ? (
                      <span className="text-emerald-400">
                        {formatWalletAddress(walletAddress)} · Connected on Arc Testnet
                        {walletKind ? <span className="text-gray-500 lowercase"> ({walletKind})</span> : null}
                      </span>
                    ) : (
                      'Not connected — connect to fund escrows and receive USDC.'
                    )}
                  </div>
                </div>
                {walletAddress ? (
                  <button
                    onClick={disconnect}
                    className="px-3 py-1.5 border border-red-500/50 text-red-400 rounded-sm text-xs font-mono hover:bg-red-500/10 transition-colors uppercase"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => connect()}
                    disabled={isConnecting}
                    className="px-3 py-1.5 border border-[#d4af37]/50 text-[#d4af37] rounded-sm text-xs font-mono hover:bg-[#d4af37]/10 transition-colors uppercase disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-lg font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Alerts & Notifications
                </h2>
              </div>
              <div className="space-y-4">
                {['Job Updates', 'Bounty Payouts', 'Agent Validations', 'Platform Announcements'].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800 rounded-sm cursor-pointer hover:border-gray-700 transition-colors">
                    <span className="text-sm font-mono text-gray-300">{item}</span>
                    <input type="checkbox" className="accent-[#d4af37] w-4 h-4" defaultChecked={i !== 3} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-lg font-space-grotesk font-bold text-white uppercase flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  API Access
                </h2>
              </div>
              <div className="p-6 bg-gray-900/50 border border-dashed border-gray-700 rounded-sm text-center">
                <Key className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-400 mb-1">Developer API Keys</h3>
                <p className="text-xs font-mono text-gray-500 mb-4">Generate keys to interact with NexusGuard via API.</p>
                <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/50 text-blue-400 rounded-sm text-xs font-mono hover:bg-blue-500/20 transition-colors uppercase">Generate New Key</button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </motion.div>
  )
}
