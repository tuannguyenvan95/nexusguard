'use client'

import { useEffect, useRef } from 'react'

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    // Grid properties
    const gridSize = 40
    let offset = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Draw Grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)' // Subtle blue grid
      ctx.lineWidth = 1

      ctx.beginPath()
      
      // Vertical lines
      for (let x = offset % gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      
      // Horizontal lines
      for (let y = offset % gridSize; y < height; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      
      ctx.stroke()

      // Draw floating orbs (simple)
      const time = Date.now() / 3000
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)' // Emerald glow
      ctx.beginPath()
      ctx.arc(
        width * 0.2 + Math.sin(time) * 100, 
        height * 0.3 + Math.cos(time) * 100, 
        300, 0, Math.PI * 2
      )
      ctx.fill()

      ctx.fillStyle = 'rgba(139, 92, 246, 0.03)' // Purple glow
      ctx.beginPath()
      ctx.arc(
        width * 0.8 + Math.cos(time * 1.5) * 150, 
        height * 0.7 + Math.sin(time * 1.5) * 150, 
        400, 0, Math.PI * 2
      )
      ctx.fill()

      offset += 0.2 // Move grid slowly
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#0a0e1a]"
    />
  )
}
