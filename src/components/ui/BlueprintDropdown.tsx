'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface BlueprintDropdownProps {
  options: string[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function BlueprintDropdown({ options, value, onChange, placeholder = "Select...", className = "" }: BlueprintDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/50 border border-gray-700 hover:border-[#d4af37] rounded-sm px-4 py-2.5 text-[#d4af37] font-mono text-sm flex justify-between items-center transition-colors focus:outline-none"
      >
        <span>{value || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-[#030712] border border-[#d4af37]/50 rounded-sm shadow-2xl overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
              {options.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-mono transition-colors hover:bg-[#d4af37]/10 hover:text-[#d4af37]
                      ${value === option ? 'text-[#d4af37] bg-[#d4af37]/5' : 'text-gray-400'}
                    `}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
