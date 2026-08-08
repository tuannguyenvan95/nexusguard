'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type AudioContextConstructor = typeof AudioContext

// Simple Web Audio API synthesizer for sci-fi UI sounds
export function useAudio() {
  // Default muted per web standards. Read the saved preference once (lazy init),
  // so no effect + setState round-trip is needed.
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('nexusguard-muted') !== 'false'
  })

  // AudioContext lives in a ref — browsers block audio until a user gesture,
  // so we create/resume it lazily inside the first playback call.
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      const Ctor: AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioContextConstructor })
          .webkitAudioContext
      audioCtxRef.current = new Ctor()
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // Close the context when the consuming component unmounts.
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close()
      audioCtxRef.current = null
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
    if (isMuted) return

    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  }, [getAudioContext, isMuted])

  const playSuccess = useCallback(() => {
    if (isMuted) return

    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.15)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05)
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 0.15)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  }, [getAudioContext, isMuted])

  // Urgent descending alarm for critical alerts / offline agents.
  const playAlarm = useCallback(() => {
    if (isMuted) return

    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.45)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.45)
  }, [getAudioContext, isMuted])

  return { isMuted, toggleMute, playClick, playSuccess, playAlarm }
}
