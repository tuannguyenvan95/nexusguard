'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Loader2, RefreshCw, Terminal, Droplet, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Link from 'next/link'

export default function TreasuryPage() {
  const [balance, setBalance] = useState<string>('Loading...')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [userAddress, setUserAddress] = useState<string>('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [agentLogs, setAgentLogs] = useState<string[]>([
    '> [TREASURY_AGENT] Monitoring Arc DeFi yields...',
    '> [TREASURY_AGENT] Current Aave USDC APY: 4.2%',
    '> [TREASURY_AGENT] Current Compound USDC APY: 5.1%',
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentLogs(prev => {
        const actions = [
          '> [TREASURY_AGENT] Rebalancing 10,000 USDC to Compound for higher yield.',
          '> [TREASURY_AGENT] Autonomous transaction signed: 0x' + Math.random().toString(16).substring(2, 8).toUpperCase(),
          '> [TREASURY_AGENT] Yield accrued today: +4.25 USDC.',
          '> [TREASURY_AGENT] Detecting low liquidity in Network main wallet...',
          '> [TREASURY_AGENT] Harvesting yield and transferring back to treasury.'
        ]
        const randomAction = actions[Math.floor(Math.random() * actions.length)]
        const newLogs = [...prev, randomAction]
        return newLogs.slice(-5) // Keep last 5 logs
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTransactions = async (address: string, currentBalance: number) => {
    try {
      const res = await fetch(`https://testnet.arcscan.app/api?module=account&action=tokentx&contractaddress=0x3600000000000000000000000000000000000000&address=${address}&page=1&offset=10&sort=desc`)
      const data = await res.json()
      if (data.status === "1" && data.result) {
        setTransactions(data.result)
        
        let runningBalance = currentBalance;
        const history = [];
        history.push({ name: 'Now', balance: runningBalance });

        for (let i = 0; i < data.result.length; i++) {
          const tx = data.result[i];
          const isReceive = tx.to.toLowerCase() === address.toLowerCase();
          const amount = parseFloat(ethers.formatUnits(tx.value, 6));
          
          if (isReceive) {
            runningBalance -= amount;
          } else {
            runningBalance += amount;
          }
          
          const date = new Date(parseInt(tx.timeStamp) * 1000);
          history.push({
            name: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
            balance: runningBalance > 0 ? runningBalance : 0
          });
        }
        
        setChartData(history.reverse());
      } else {
        setTransactions([])
        setChartData([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBalance = async (autoSwitch = false) => {
    try {
      setBalance('Updating...')
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts.length > 0) {
          const chainId = await ethereum.request({ method: 'eth_chainId' })
          if (chainId.toLowerCase() !== '0x4cef52') {
            setBalance('WRONG NETWORK')
            if (autoSwitch) {
              try {
                await ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x4cef52' }],
                })
              } catch (switchError: any) {
                if (switchError.code === 4902) {
                  try {
                    await ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                        chainId: '0x4cef52',
                        chainName: 'Arc Testnet',
                        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                        rpcUrls: ['https://rpc.testnet.arc.network'],
                        blockExplorerUrls: ['https://testnet.arcscan.app'],
                      }]
                    })
                  } catch (e) {
                    console.error(e)
                  }
                }
              }
            }
            return
          }

          const provider = new ethers.BrowserProvider(ethereum)
          const usdcAddress = "0x3600000000000000000000000000000000000000";
          const usdcAbi = [{
            "constant": true,
            "inputs": [{ "name": "_owner", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "balance", "type": "uint256" }],
            "type": "function"
          }];
          const contract = new ethers.Contract(usdcAddress, usdcAbi, provider);
          
          const rawBalance = await contract.balanceOf(accounts[0]);
          // USDC ERC-20 uses 6 decimals
          const formatted = ethers.formatUnits(rawBalance, 6)
          const numFormatted = parseFloat(formatted)
          setBalance(numFormatted.toFixed(2) + ' USDC')
          setUserAddress(accounts[0])
          fetchTransactions(accounts[0], numFormatted)
        }
      } else {
        setBalance('0.0000 USDC (No Wallet)')
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err)
      setBalance('Error fetching')
    }
  }

  // Fetch real balance from MetaMask
  useEffect(() => {
    fetchBalance(false)

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.on('accountsChanged', () => fetchBalance(false));
      eth.on('chainChanged', () => fetchBalance(false));
    }

    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        eth.removeListener('accountsChanged', () => fetchBalance(false));
        eth.removeListener('chainChanged', () => fetchBalance(false));
      }
    }
  }, [])

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    setIsSending(true)
    setTerminalOutput(['[SYS] Initiating secure transaction protocol...'])
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        setTimeout(() => setTerminalOutput(prev => [...prev, '[AUTH] Connecting to Web3 Provider...']), 500)
        const ethereum = (window as any).ethereum
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const from = accounts[0]
        
        setTimeout(() => setTerminalOutput(prev => [...prev, '[NET] Signing transaction with private key...']), 1000)
        const provider = new ethers.BrowserProvider(ethereum)
        const signer = await provider.getSigner()
        
        const usdcAddress = "0x3600000000000000000000000000000000000000";
        const usdcAbi = [{
          "constant": false,
          "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
          ],
          "name": "transfer",
          "outputs": [{ "name": "", "type": "bool" }],
          "type": "function"
        }];
        const contract = new ethers.Contract(usdcAddress, usdcAbi, signer);

        // USDC uses 6 decimals
        const txAmount = ethers.parseUnits(amount, 6)
        
        const tx = await contract.transfer(recipient, txAmount)
        setTerminalOutput(prev => [...prev, `[MEMPOOL] Tx Broadcasted: ${tx.hash.slice(0, 10)}...`])
        setTerminalOutput(prev => [...prev, '[SYS] Awaiting block confirmation...'])
        
        await tx.wait() // wait for confirmation
        
        setTerminalOutput(prev => [...prev, '[SUCCESS] Transaction confirmed! Protocol complete.'])
        alert(`Giao dịch gửi đi thành công!\nTxHash: ${tx.hash}`)
        setRecipient('')
        setAmount('')
        fetchBalance() // auto refresh after sending
      } else {
        setTerminalOutput(prev => [...prev, '[ERROR] Web3 Provider (MetaMask) not found.'])
        alert("Vui lòng cài đặt ví Web3 (MetaMask)!")
      }
    } catch (error: any) {
      console.error(error)
      setTerminalOutput(prev => [...prev, `[FAIL] ${error.message || 'Unknown Error'}`])
      alert("Giao dịch thất bại: " + (error.message || "Lỗi không xác định"))
    } finally {
      setTimeout(() => {
        setIsSending(false)
        setTerminalOutput([])
      }, 4000)
    }
  }

  return (
    <div className="space-y-8 font-mono">
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-[#d4af37] uppercase tracking-tight mb-1">Treasury_</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Manage funds, view transactions, and send payments</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Balance', value: '$124,500.00', color: 'emerald' },
          { label: 'Total Paid (30d)', value: '$18,200.00', color: 'gray' },
          { label: 'Total Earned (30d)', value: '$45,000.00', color: 'blue' },
          { label: 'Pending Escrow', value: '$8,700.00', color: 'yellow' }
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-sm p-6 relative group hover:border-[#d4af37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:-translate-y-1 transition-all duration-300">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600 group-hover:border-[#d4af37] transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600 group-hover:border-[#d4af37] transition-colors" />

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-gray-500 group-hover:text-[#d4af37] transition-colors" />
                {stat.label}
              </h3>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                stat.color === 'emerald' ? 'bg-emerald-500' :
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
            <div className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Send & Chart */}
        <div className="space-y-6 lg:col-span-1 flex flex-col">
          {/* Quick Send Form */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#d4af37]/50" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#d4af37]/50" />
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3 text-[#d4af37]" /> QUICK SEND
              </h3>
              <div className="flex flex-col items-end gap-1">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  Wallet Balance
                  <button onClick={() => fetchBalance(true)} className="hover:text-white transition-colors" title="Refresh Balance">
                    <RefreshCw className="w-3 h-3 text-gray-500 hover:text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#d4af37] text-xs">{balance}</span>
                  <Link href="/dashboard/faucet" className="text-[9px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-1.5 py-0.5 border border-blue-500/30 rounded-sm transition-colors flex items-center gap-1">
                    <Droplet className="w-2.5 h-2.5" /> FAUCET
                  </Link>
                </div>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleQuickSend}>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest">Recipient Address</label>
                <input 
                  type="text" 
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..." 
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest">Amount (USDC)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                />
              </div>
              <button 
                type="submit"
                disabled={isSending}
                className="w-full border border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 text-[#d4af37] font-bold py-3 rounded-sm transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4"
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> ENCRYPTING...</>
                ) : (
                  'CONFIRM & SEND'
                )}
              </button>
            </form>

            {/* Terminal Output Simulation */}
            {terminalOutput.length > 0 && (
              <div className="mt-4 p-3 bg-black/60 border border-gray-800 rounded-sm font-mono text-[9px] space-y-1 h-28 overflow-y-auto">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className={line.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : line.includes('[FAIL]') ? 'text-red-400' : 'text-gray-400'}>
                    <span className="text-gray-600 mr-2">{new Date().toISOString().split('T')[1].slice(0,8)}</span> 
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treasury Chart Real */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 flex-1 flex flex-col relative min-h-[250px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">BALANCE HISTORY</h3>
            <div className="flex-1 w-full h-full min-h-[200px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} width={40} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0e1a', border: '1px solid #d4af37', borderRadius: '2px', fontSize: '11px', fontFamily: 'monospace', boxShadow: '0 0 10px rgba(212,175,55,0.1)' }}
                      itemStyle={{ color: '#d4af37' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Line type="stepAfter" dataKey="balance" stroke="#d4af37" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#d4af37', stroke: '#000', strokeWidth: 2 }} filter="url(#glow)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs">No data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Transactions & Agent Log */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* AI Treasury Agent Box */}
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-sm p-6 relative">
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-blue-500" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-blue-500" />
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-400" /> TREASURY AGENT: AUTONOMOUS YIELD MANAGER
              </h3>
              <div className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-sm border border-blue-500/50 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                AGENT WALLET: $50,000.00 USDC
              </div>
            </div>
            
            <div className="bg-black/60 border border-blue-900/50 rounded-sm p-4 font-mono text-[10px] space-y-2 h-32 overflow-y-auto">
              {agentLogs.map((log, idx) => (
                <div key={idx} className="text-blue-300 opacity-80">
                  <span className="text-blue-500/50 mr-2">{new Date().toISOString().split('T')[1].slice(0,8)}</span> 
                  {log}
                </div>
              ))}
              <div className="w-2 h-3 bg-blue-400 animate-pulse mt-2" />
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-sm p-6 flex flex-col relative flex-1">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-500" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gray-500" />

          <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">TRANSACTION LEDGER</h3>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
                  <th className="pb-3 font-bold pl-2">Time/Date</th>
                  <th className="pb-3 font-bold">Type</th>
                  <th className="pb-3 font-bold">Details</th>
                  <th className="pb-3 font-bold">Hash/Target</th>
                  <th className="pb-3 font-bold text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No transactions recorded in ledger</td>
                  </tr>
                ) : transactions.map((tx, idx) => {
                  const isReceive = tx.to.toLowerCase() === userAddress.toLowerCase()
                  const type = isReceive ? 'RCV' : 'SND'
                  const address = isReceive ? tx.from : tx.to
                  const amount = ethers.formatUnits(tx.value, 6)
                  const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()

                  return (
                    <tr key={tx.hash} className={`border-b border-gray-800/30 group hover:bg-[#d4af37]/5 transition-colors relative ${idx % 2 === 0 ? 'bg-gray-900/10' : ''}`}>
                      <td className="py-4 pl-2 text-gray-400 text-[10px] group-hover:text-white transition-colors">{date}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${isReceive ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10'}`}>
                          {type}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300 text-[11px]">{isReceive ? 'Inbound Transfer' : 'Outbound Transfer'}</td>
                      <td className="py-4 text-gray-500 text-[10px]">
                        <div className="flex flex-col gap-0.5">
                          <a href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                            {tx.hash.slice(0, 10)}...
                          </a>
                          <span>{address.slice(0,8)}...{address.slice(-4)}</span>
                        </div>
                      </td>
                      <td className={`py-4 pr-2 text-right font-bold text-sm ${isReceive ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-[#d4af37] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]'}`}>
                        {isReceive ? '+' : '-'}{parseFloat(amount).toFixed(2)} USDC
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
