'use client'

import { ExternalLink, Droplets, ShieldCheck, AlertCircle } from 'lucide-react'

export default function FaucetPage() {
  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-1 flex items-center gap-3">
            <Droplets className="w-8 h-8" /> 
            Testnet Faucet_
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Get USDC to pay for gas and smart contract interactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Faucet Instructions */}
        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-[#d4af37]/30 rounded-sm p-8 relative overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4af37]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4af37]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />

            <div className="absolute top-4 right-4 opacity-10">
              <Droplets className="w-24 h-24" />
            </div>

            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">How to get Testnet USDC</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center shrink-0 text-[#d4af37] text-xs font-bold mt-0.5">1</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest mb-1">Copy your Wallet Address</h3>
                  <p className="text-xs text-gray-400">Make sure your MetaMask is connected and copy your public address (0x...).</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center shrink-0 text-[#d4af37] text-xs font-bold mt-0.5">2</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest mb-1">Visit Circle Faucet</h3>
                  <p className="text-xs text-gray-400 mb-3">Click the button below to open the official Circle Faucet in a new tab. This faucet provides USDC on multiple testnets.</p>
                  
                  <a 
                    href="https://faucet.circle.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    REQUEST USDC TESTNET
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center shrink-0 text-[#d4af37] text-xs font-bold mt-0.5">3</div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest mb-1">Select Arc Testnet</h3>
                  <p className="text-xs text-gray-400">On the Circle Faucet page, paste your address and make sure to select <strong>Arc Testnet</strong> from the network list before requesting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Network Info */}
        <div className="space-y-6">
          <div className="bg-black border border-gray-800 rounded-sm p-8 relative">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Network Configuration
            </h3>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Our Agentic Treasury operates exclusively on the Arc Testnet. 
              USDC is used as the native gas token (18 decimals), eliminating the need for a separate gas token.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Network Name</span>
                <span className="text-sm font-bold text-gray-200">Arc Testnet</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">RPC URL</span>
                <span className="text-xs text-[#d4af37]">https://rpc.testnet.arc.network</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Chain ID</span>
                <span className="text-sm font-bold text-gray-200">5042002</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Currency Symbol</span>
                <span className="text-sm font-bold text-emerald-400">USDC</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Block Explorer</span>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  testnet.arcscan.app
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/30 rounded-sm p-6 relative">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Developer Notes
            </h3>
            <ul className="list-disc list-inside text-xs text-gray-300 space-y-2">
              <li><strong>Native USDC:</strong> Used for gas. 18 decimals.</li>
              <li><strong>ERC-20 USDC:</strong> Used for token interactions (transfer, approve). 6 decimals. Address: <code className="bg-black px-1 py-0.5 rounded text-purple-300">0x36...0000</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
