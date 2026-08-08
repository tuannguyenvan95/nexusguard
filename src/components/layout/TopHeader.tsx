'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Home, LogOut, Volume2, VolumeX, Wallet, Droplets, Sun, Moon, ChevronDown, User, Settings, Briefcase, FileCode2, Send, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { useAudio } from '@/hooks/useAudio'
import { useIsClient } from '@/hooks/useIsClient'
import { useWallet } from '@/hooks/useWallet'
import { formatWalletAddress } from '@/lib/wallet'

export function TopHeader() {
  const router = useRouter()
  const mounted = useIsClient()
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'light';
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { isMuted, toggleMute, playClick, playSuccess } = useAudio()
  const { address: walletAddress, walletKind, isConnecting, error: walletError, connect, disconnect } = useWallet()

  useEffect(() => {
    // Apply saved theme to <html> (state is initialized lazily already)
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light-theme')
    }

    // Handle click outside for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const openWalletModal = () => {
    playClick()
    setShowWalletModal(true)
  }

  const handleConnect = async () => {
    playClick()
    const account = await connect()
    if (account) {
      playSuccess()
      setShowWalletModal(false)
    }
  }

  const handleDisconnect = () => {
    playClick()
    disconnect()
  }

  const handleSignOut = async () => {
    playClick()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const detectedKind = walletKind

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
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => {
                playClick()
                setShowUserMenu(!showUserMenu)
              }}
              className={`flex items-center gap-2 border px-3 py-1.5 rounded-sm transition-colors group cursor-pointer ${
                showUserMenu ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#d4af37]/30 hover:border-[#d4af37]/60 bg-[#d4af37]/5'
              }`}
            >
              <Wallet className="w-4 h-4 text-[#d4af37]" />
              <span className="text-sm font-mono text-gray-300">{formatWalletAddress(walletAddress)}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#0a0e1a] border border-gray-800 rounded-sm shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Profile Section */}
                <div className="px-4 py-2 border-b border-gray-800/50 mb-1">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-xs text-emerald-400 font-mono font-bold truncate">{formatWalletAddress(walletAddress)}</p>
                  {detectedKind && (
                    <p className="text-[10px] text-gray-500 font-mono mt-1 capitalize">{detectedKind} connected</p>
                  )}
                </div>

                <div className="px-2 space-y-0.5">
                  <button 
                    onClick={() => {
                      playClick()
                      setShowUserMenu(false)
                      router.push('/dashboard/profile')
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-sm transition-colors"
                  >
                    <User className="w-4 h-4 text-[#d4af37]" />
                    My Profile
                  </button>

                  <button 
                    onClick={() => {
                      playClick()
                      setShowUserMenu(false)
                      router.push('/dashboard/settings')
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-sm transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings & Connections
                  </button>
                </div>

                <div className="px-2 my-2 py-2 border-y border-gray-800/50 space-y-0.5">
                  <div className="px-3 py-1 mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">My Jobs</span>
                  </div>
                  <button 
                    onClick={() => {
                      playClick()
                      setShowUserMenu(false)
                      router.push('/dashboard/jobs')
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-1.5 pl-8 text-xs text-gray-400 hover:text-[#d4af37] hover:bg-gray-800/50 rounded-sm transition-colors"
                  >
                    <FileCode2 className="w-3 h-3" />
                    Created Projects
                  </button>
                  <button 
                    onClick={() => {
                      playClick()
                      setShowUserMenu(false)
                      router.push('/dashboard/jobs')
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-1.5 pl-8 text-xs text-gray-400 hover:text-[#d4af37] hover:bg-gray-800/50 rounded-sm transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Submitted Work
                  </button>
                </div>

                <div className="px-2 space-y-0.5 mt-1">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      handleDisconnect()
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Disconnect Wallet
                  </button>

                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={openWalletModal}
              disabled={isConnecting}
              className="flex items-center gap-2 border border-gray-600 hover:border-[#d4af37] bg-gray-900/50 hover:bg-[#d4af37]/10 px-3 py-1.5 rounded-sm transition-colors"
            >
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-300">
                {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </span>
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-sm border border-transparent hover:border-red-500/30 hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
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
            <h2 className="text-xl font-bold text-white mb-1 font-space-grotesk">Connect Wallet</h2>
            <p className="text-xs text-gray-500 mb-6">Connect to Arc Network (Testnet) to fund escrows and receive USDC.</p>

            {/* Connection error from the wallet / provider */}
            {walletError && (
              <div className="mb-4 flex items-start gap-2 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded-sm">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{walletError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-[#111] hover:bg-[#222] border border-gray-800 hover:border-[#d4af37] text-white p-4 rounded-lg flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                <div className="flex items-center gap-3">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width={32} height={32} className="w-8 h-8" />
                  <span className="font-medium">MetaMask</span>
                </div>
                {isConnecting ? (
                  <span className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-2 py-1 rounded animate-pulse">Connecting...</span>
                ) : (
                  <span className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-2 py-1 rounded">
                    {detectedKind === 'metamask' ? 'Detected' : 'Popular'}
                  </span>
                )}
              </button>
              
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-[#111] hover:bg-[#222] border border-gray-800 hover:border-blue-600 text-white p-4 rounded-lg flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">C</span>
                  </div>
                  <span className="font-medium">Coinbase Wallet</span>
                </div>
                {detectedKind === 'coinbase' && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Detected
                  </span>
                )}
              </button>

              {!detectedKind && (
                <p className="text-center text-[11px] text-gray-600 pt-1">
                  No wallet extension detected. Install the MetaMask or Coinbase Wallet browser extension to connect.
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}
