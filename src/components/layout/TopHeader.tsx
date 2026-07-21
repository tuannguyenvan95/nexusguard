'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Home, LogOut, Volume2, VolumeX, Wallet, Droplets, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ethers } from 'ethers'
import { useAudio } from '@/hooks/useAudio'

export function TopHeader() {
  const router = useRouter()
  const supabase = createClient()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)

  const { isMuted, toggleMute, playClick } = useAudio()

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem('walletDisconnected') !== 'true') {
      checkIfWalletIsConnected()
    }
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
      setIsLightMode(true)
      document.documentElement.classList.add('light-theme')
    }
  }, [])

  const toggleTheme = () => {
    playClick()
    if (isLightMode) {
      document.documentElement.classList.remove('light-theme')
      localStorage.setItem('theme', 'dark')
      setIsLightMode(false)
    } else {
      document.documentElement.classList.add('light-theme')
      localStorage.setItem('theme', 'light')
      setIsLightMode(true)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = () => {
    playClick()
    setShowWalletModal(true)
  }

  const connectMetaMask = async () => {
    try {
      setShowWalletModal(false)
      setIsConnecting(true)
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Please install MetaMask!");
        setIsConnecting(false)
        return;
      }
      playClick()
      
      // Force account selection for NEW connection
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      // Enforce Arc Testnet (Chain ID: 5042002 -> 0x4cef52)
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4cef52' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x4cef52',
                  chainName: 'Arc Testnet',
                  nativeCurrency: {
                    name: 'USDC',
                    symbol: 'USDC',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.testnet.arc.network'],
                  blockExplorerUrls: ['https://testnet.arcscan.app'],
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        } else {
          console.error(switchError);
        }
      }

      setWalletAddress(accounts[0]);
      localStorage.removeItem('walletDisconnected');
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const disconnectWallet = () => {
    playClick()
    setWalletAddress(null)
    localStorage.setItem('walletDisconnected', 'true')
  }

  const handleSignOut = async () => {
    playClick()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-gray-800 bg-[#030712]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            playClick()
            router.back()
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm px-2 py-1 rounded-sm border border-transparent hover:border-gray-700 hover:bg-gray-800/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={() => {
            playClick()
            router.push('/dashboard')
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm px-2 py-1 rounded-sm border border-transparent hover:border-gray-700 hover:bg-gray-800/30"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <div className="hidden md:block w-px h-4 bg-gray-800 mx-2"></div>
        <div className="hidden md:block text-[#d4af37] text-sm font-medium border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1 rounded-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#d4af37] animate-pulse inline-block mr-2" />
          Arc Network (Testnet)
        </div>
        <button 
          onClick={() => {
            playClick()
            router.push('/dashboard/faucet')
          }}
          className="hidden md:flex text-emerald-400 text-sm font-medium border border-emerald-400/30 bg-emerald-400/5 hover:bg-emerald-400/10 transition-colors px-3 py-1 rounded-sm items-center gap-2 ml-2"
        >
          <Droplets className="w-4 h-4" />
          Faucet
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-sm border border-transparent hover:border-gray-700 hover:bg-gray-800/30"
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button
          onClick={() => {
            playClick()
            toggleMute()
          }}
          className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-sm border border-transparent hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5"
          title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {walletAddress ? (
          <button 
            onClick={disconnectWallet}
            title="Disconnect Wallet"
            className="flex items-center gap-2 border border-[#d4af37]/30 hover:border-red-500/50 bg-[#d4af37]/5 hover:bg-red-500/10 px-3 py-1.5 rounded-sm transition-colors group cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-[#d4af37] group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-mono text-gray-300 group-hover:hidden">{formatAddress(walletAddress)}</span>
            <span className="text-[10px] font-bold text-red-400 hidden group-hover:inline uppercase tracking-widest">DISCONNECT</span>
          </button>
        ) : (
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 border border-gray-600 hover:border-[#d4af37] bg-gray-900/50 hover:bg-[#d4af37]/10 px-3 py-1.5 rounded-sm transition-colors"
          >
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-300">
              {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
            </span>
          </button>
        )}
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-sm border border-transparent hover:border-red-500/30 hover:bg-red-500/10"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>

      {/* Wallet Selection Modal */}
      {showWalletModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-[#d4af37]/30 rounded-xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-6 font-space-grotesk">Connect Wallet</h2>
            <div className="space-y-3">
              <button 
                onClick={connectMetaMask}
                className="w-full bg-[#111] hover:bg-[#222] border border-gray-800 hover:border-[#d4af37] text-white p-4 rounded-lg flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8" />
                  <span className="font-medium">MetaMask</span>
                </div>
                <span className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-2 py-1 rounded">Popular</span>
              </button>
              
              <button 
                onClick={() => alert('WalletConnect integration coming soon!')}
                className="w-full bg-[#111] hover:bg-[#222] border border-gray-800 hover:border-blue-500 text-white p-4 rounded-lg flex items-center gap-3 transition-all opacity-70"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">WC</span>
                </div>
                <span className="font-medium">WalletConnect</span>
              </button>
              
              <button 
                onClick={() => alert('Coinbase Wallet integration coming soon!')}
                className="w-full bg-[#111] hover:bg-[#222] border border-gray-800 hover:border-blue-600 text-white p-4 rounded-lg flex items-center gap-3 transition-all opacity-70"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CB</span>
                </div>
                <span className="font-medium">Coinbase Wallet</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
