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
    const N = 320
    const pts: { x: number; y: number; z: number; ice: boolean }[] = []
    const gold = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = gold * i
      pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r, ice: i % 19 === 0 })
    }

    // Icosahedron wireframe "mesh core" forming inside the cloud
    const g = (1 + Math.sqrt(5)) / 2
    const iv = [
      [-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0],
      [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g],
      [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1],
    ].map(([x, y, z]) => {
      const l = Math.hypot(x, y, z)
      return { x: (x / l) * 0.58, y: (y / l) * 0.58, z: (z / l) * 0.58 }
    })
    const ie = [
      [0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9],
      [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9],
      [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10], [8, 9], [10, 11],
    ]

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

      const rot = (p: { x: number; y: number; z: number }) => {
        const x = p.x * cosA - p.z * sinA
        const z = p.x * sinA + p.z * cosA
        const y2 = p.y * tiltC - z * tiltS
        const z2 = p.y * tiltS + z * tiltC
        return { sx: cx + x * R, sy: cy + y2 * R, depth: (z2 + 1) / 2 }
      }
      const proj = pts.map((p) => ({ ...rot(p), ice: p.ice }))
      proj.sort((a, b) => a.depth - b.depth)

      // mesh core edges (draw behind points for a "forming model" read)
      const ip = iv.map(rot)
      for (const [a, b] of ie) {
        const A = ip[a]
        const B = ip[b]
        const d = (A.depth + B.depth) / 2
        ctx.strokeStyle = `rgba(210,216,222,${0.06 + d * 0.22})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(A.sx, A.sy)
        ctx.lineTo(B.sx, B.sy)
        ctx.stroke()
      }
      for (const v of ip) {
        ctx.fillStyle = `rgba(110,231,255,${0.25 + v.depth * 0.5})`
        ctx.beginPath()
        ctx.arc(v.sx, v.sy, 1.6 + v.depth * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

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

      // points (no shadowBlur — it's a heavy per-draw canvas op; the ice points
      // get a brighter fill + a small halo ring instead)
      for (const p of proj) {
        const size = 0.7 + p.depth * 1.8
        const alpha = 0.18 + p.depth * 0.7
        if (p.ice) {
          ctx.fillStyle = `rgba(140,236,255,${Math.min(1, alpha + 0.25)})`
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = `rgba(110,231,255,${0.18 + p.depth * 0.22})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, size + 2.2, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(210,216,222,${alpha})`
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // ~30fps cap: half the main-thread cost of a 60fps redraw, still smooth.
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < 33) return
      last = t
      angle += 0.0044
      draw()
    }

    let startTimer = 0
    const start = () => {
      if (running || reduce) return
      running = true
      // Defer the animation loop so it doesn't compete with first paint / LCP.
      startTimer = window.setTimeout(() => {
        raf = requestAnimationFrame(loop)
      }, 700)
    }
    const stop = () => {
      running = false
      clearTimeout(startTimer)
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
