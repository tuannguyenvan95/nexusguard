import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight font-display mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
            NexusGuard
          </span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 font-medium mb-8 max-w-3xl">
          Autonomous Agentic Compliance & Treasury Operating System
        </p>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl leading-relaxed">
          The next generation of treasury management. AI agents autonomously manage escrows, 
          ensure compliance, and execute programmable payments on the Arc Network.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-1">
            Get Started
          </Link>
          <Link href="#features" className="px-8 py-4 rounded-xl border border-gray-600 text-gray-300 font-semibold text-lg hover:border-gray-400 hover:text-white transition-all transform hover:-translate-y-1 backdrop-blur-sm">
            Learn More
          </Link>
        </div>
      </section>

      {/* Built on Arc Section */}
      <section className="relative z-10 py-10 border-y border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 uppercase tracking-widest mb-6 font-semibold">
            Powered by Circle's Arc Network
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['USDC Native', 'Sub-second Finality', 'ERC-8004', 'ERC-8183'].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-md hover:border-blue-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">AI-Powered Agents</h3>
            <p className="text-gray-400 leading-relaxed">
              5 specialized agents handle everything from task validation to payment processing, working 24/7 to manage your treasury.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-md hover:border-purple-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Escrow & Payments</h3>
            <p className="text-gray-400 leading-relaxed">
              Secure ERC-8183 job contracts with automated USDC escrow. Funds are cryptographically locked until AI validation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-md hover:border-emerald-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Compliance Built-in</h3>
            <p className="text-gray-400 leading-relaxed">
              Automated invoicing and tax rule application for US & VN jurisdictions. Stay compliant without the overhead.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-24 bg-black/40">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How it Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Team', desc: 'Invite members via email seamlessly' },
              { step: '2', title: 'Post Jobs', desc: 'Fund USDC escrow automatically' },
              { step: '3', title: 'AI Validates', desc: 'LLM scores deliverables objectively' },
              { step: '4', title: 'Auto Payment', desc: 'Funds released instantly on approval' }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 border-2 border-gray-700 relative z-10">
                  {item.step}
                </div>
                {i !== 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-gray-700 to-transparent"></div>
                )}
                <h4 className="text-lg font-bold mb-2 text-white">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-gray-800/50 py-8 bg-black/60">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            NexusGuard © 2026 • Built for Programmable Money Hackathon
          </p>
        </div>
      </footer>
    </main>
  )
}
