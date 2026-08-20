import { useEffect, useRef } from 'react'

/**
 * Lightweight point-cloud → mesh sphere rendered on a small canvas: a silver
 * cloud of points on a sphere, slowly rotating, with a few depth-sorted links —
 * evoking a 3D model being scanned / reconstructed. No libraries, no images.
 * Falls back to a single static frame under prefers-reduced-motion, and pauses
 * when off-screen or the tab is hidden.
 */
export function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    // Fibonacci sphere point cloud
    const N = 340
    const pts: { x: number; y: number; z: number; ice: boolean }[] = []
    const gold = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = gold * i
      pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r, ice: i % 17 === 0 })
    }

    let W = 0
    let H = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let angle = 0.4
    let raf = 0
    let running = false

    const draw = () => {
      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * 0.4
      ctx.clearRect(0, 0, W, H)

      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const tiltC = Math.cos(-0.42)
      const tiltS = Math.sin(-0.42)

      const proj = pts.map((p) => {
        // rotate Y
        let x = p.x * cosA - p.z * sinA
        let z = p.x * sinA + p.z * cosA
        let y = p.y
        // tilt X
        const y2 = y * tiltC - z * tiltS
        const z2 = y * tiltS + z * tiltC
        y = y2
        z = z2
        const depth = (z + 1) / 2 // 0..1
        return { sx: cx + x * R, sy: cy + y * R, depth, ice: p.ice }
      })
      proj.sort((a, b) => a.depth - b.depth)

      // faint links between near neighbours (subtle mesh)
      ctx.lineWidth = 1
      for (let i = 0; i < proj.length; i += 3) {
        const a = proj[i]
        const b = proj[Math.min(proj.length - 1, i + 7)]
        const dx = a.sx - b.sx
        const dy = a.sy - b.sy
        if (dx * dx + dy * dy < 44 * 44) {
          ctx.strokeStyle = `rgba(184,192,200,${0.05 + a.depth * 0.10})`
          ctx.beginPath()
          ctx.moveTo(a.sx, a.sy)
          ctx.lineTo(b.sx, b.sy)
          ctx.stroke()
        }
      }

      // points
      for (const p of proj) {
        const size = 0.7 + p.depth * 1.8
        const alpha = 0.18 + p.depth * 0.7
        if (p.ice) {
          ctx.fillStyle = `rgba(110,231,255,${Math.min(1, alpha + 0.15)})`
          ctx.shadowColor = 'rgba(110,231,255,0.6)'
          ctx.shadowBlur = 6
        } else {
          ctx.fillStyle = `rgba(210,216,222,${alpha})`
          ctx.shadowBlur = 0
        }
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
    }

    const loop = () => {
      angle += 0.0022
      draw()
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reduce) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    draw() // static first frame (also the reduced-motion result)

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()), { threshold: 0 })
        : null
    io ? io.observe(canvas) : start()

    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    const onResize = () => {
      resize()
      draw()
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-visual" aria-hidden="true" />
}
