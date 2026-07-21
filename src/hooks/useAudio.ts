'use client'

import { useCallback, useEffect, useState } from 'react'

// Simple Web Audio API synthesizer for sci-fi UI sounds
export function useAudio() {
  const [isMuted, setIsMuted] = useState(true) // Default muted per web standards
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  useEffect(() => {
    // Only initialize AudioContext after user interaction to avoid warnings,
    // or just let it initialize (it starts suspended).
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioCtx(ctx)
    
    // Check local storage for preference
    const saved = localStorage.getItem('nexusguard-muted')
    if (saved === 'false') setIsMuted(false)
      
    return () => {
      ctx.close()
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev
      localStorage.setItem('nexusguard-muted', String(newVal))
      return newVal
    })
  }, [])

  const playClick = useCallback(() => {
    if (isMuted || !audioCtx) return

    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.1)
  }, [audioCtx, isMuted])

  const playSuccess = useCallback(() => {
    if (isMuted || !audioCtx) return

    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(400, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1)
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.15)
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.25)

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.15)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.3)
  }, [audioCtx, isMuted])

  return { isMuted, toggleMute, playClick, playSuccess }
}
