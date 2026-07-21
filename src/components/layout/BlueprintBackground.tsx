'use client'

import { useEffect, useRef } from 'react'

export function BlueprintBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    // Fine grid for architectural blueprint look
    const primaryGrid = 100
    const secondaryGrid = 20
    let offset = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      ctx.beginPath()
      
      // Draw secondary (fine) grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let x = (offset * 0.5) % secondaryGrid; x < width; x += secondaryGrid) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = (offset * 0.5) % secondaryGrid; y < height; y += secondaryGrid) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Draw primary (main) grid
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      for (let x = offset % primaryGrid; x < width; x += primaryGrid) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = offset % primaryGrid; y < height; y += primaryGrid) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Crosshairs at intersections
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)' // Architectural Gold/Bronze
      ctx.lineWidth = 1
      const chSize = 4
      for (let x = offset % primaryGrid; x < width; x += primaryGrid) {
        for (let y = offset % primaryGrid; y < height; y += primaryGrid) {
          ctx.moveTo(x - chSize, y)
          ctx.lineTo(x + chSize, y)
          ctx.moveTo(x, y - chSize)
          ctx.lineTo(x, y + chSize)
        }
      }
      ctx.stroke()

      offset += 0.2
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#030712]" // Midnight Deep Blue
    />
  )
}
