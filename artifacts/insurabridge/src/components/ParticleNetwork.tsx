import { useEffect, useRef } from "react"
import { useTheme } from "@/lib/theme-context"

const COLORS_DARK  = ["#00BFA5", "#00897B", "#38bdf8", "#818cf8", "#34d399"]
const COLORS_LIGHT = ["#00897B", "#0284c7", "#7c3aed", "#0891b2", "#059669"]

const MAX_DIST = 140

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
  pulseOffset: number
}

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const particles = useRef<Particle[]>([])
  const frameRef = useRef(0)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isLight = theme === "light"
    const colors = isLight ? COLORS_LIGHT : COLORS_DARK
    const lineAlphaMulti = isLight ? 0.12 : 0.28
    const dotOpacity = isLight ? 0.35 : 0.55
    const glowMult = isLight ? 0.25 : 0.55

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const COUNT = 65

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function init() {
      if (!canvas) return
      particles.current = Array.from({ length: COUNT }, (_, i) => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * (reduced ? 0 : 0.5),
        vy: (Math.random() - 0.5) * (reduced ? 0 : 0.5),
        radius: Math.random() * 2.6 + 1,
        opacity: Math.random() * dotOpacity + (isLight ? 0.15 : 0.3),
        color: colors[i % colors.length],
        pulseOffset: Math.random() * Math.PI * 2,
      }))
    }

    function draw() {
      if (!canvas || !ctx) return
      frameRef.current++
      const t = frameRef.current * 0.012
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const ps = particles.current

      for (const p of ps) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x
          const dy = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * lineAlphaMulti
            ctx.beginPath()
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.strokeStyle = isLight ? `rgba(0,137,123,${alpha})` : `rgba(0,191,165,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      for (const p of ps) {
        const pulse = Math.sin(t + p.pulseOffset) * 0.5 + 0.5
        const r = p.radius * (1 + pulse * 0.45)
        const glowR = r * 7
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
        const glowAlpha = glowMult * pulse
        grd.addColorStop(0, p.color + Math.round(glowAlpha * 255).toString(16).padStart(2, "0"))
        grd.addColorStop(1, p.color + "00")
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        const coreAlpha = Math.round(p.opacity * 0.9 * 255).toString(16).padStart(2, "0")
        ctx.fillStyle = p.color + coreAlpha
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    const ro = new ResizeObserver(() => {
      resize()
      init()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    />
  )
}
