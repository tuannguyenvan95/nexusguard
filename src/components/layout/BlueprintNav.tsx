'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export function BlueprintNav() {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Team', path: '/dashboard/team' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Treasury', path: '/dashboard/treasury' },
    { name: 'Agents', path: '/dashboard/agents' },
    { name: 'Compliance', path: '/dashboard/compliance' }
  ]

  return (
    <div className="w-full border-b border-gray-800 bg-[#030712]/60 backdrop-blur-md px-4 md:px-8 pt-2">
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`relative px-4 py-3 text-xs md:text-sm font-mono uppercase tracking-widest transition-colors whitespace-nowrap
                ${isActive ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              {/* Corner accents for active tab */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[#d4af37]" />
                  <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-[#d4af37]" />
                </>
              )}
              
              {tab.name}
              
              {isActive && (
                <motion.div 
                  layoutId="blueprint-nav-indicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d4af37]"
                  style={{ boxShadow: '0 -2px 10px rgba(212,175,55,0.5)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
