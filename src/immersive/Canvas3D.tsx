import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { Rig } from './Rig'
import { ZoneField } from './zones/Zones'
import { ParticleField, SpatialGrid } from './fx/Ambient'

/**
 * Director: keeps `frameloop="demand"` battery-friendly while still feeling
 * alive. Renders for a short window after any scroll/drag (so damping settles
 * and motes drift), then rests. Pauses entirely when the tab is hidden. Also
 * the runtime Lite watchdog: no first frame in time, or a lost GL context, and
 * we bail to the HTML page instead of showing a frozen/black canvas.
 */
function Director({ goLite }: { goLite: () => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  const lastActive = useRef(0)

  useFrame(() => {
    frames.current++
    // lightweight render-frame counter for perf measurement / QA
    ;(window as unknown as { __wf?: number }).__wf = ((window as unknown as { __wf?: number }).__wf || 0) + 1
  })

  useEffect(() => {
    lastActive.current = performance.now()
    let raf = 0
    let lastTick = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      // render for ~2.2s after the last interaction, capped ~33fps
      if (t - lastActive.current < 2200 && t - lastTick > 30) {
        lastTick = t
        invalidate()
      }
    }
    raf = requestAnimationFrame(loop)

    const wake = () => {
      lastActive.current = performance.now()
      invalidate()
    }
    const onVis = () => {
      if (!document.hidden) wake()
    }
    for (const ev of ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchmove', 'touchstart'] as const)
      window.addEventListener(ev, wake, { passive: true })
    document.addEventListener('visibilitychange', onVis)

    // watchdog: a first frame must render within 3.5s
    const wd = window.setTimeout(() => {
      if (frames.current === 0) goLite()
    }, 3500)
    const onLost = (e: Event) => {
      e.preventDefault()
      goLite()
    }
    gl.domElement.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(wd)
      for (const ev of ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchmove', 'touchstart'] as const)
        window.removeEventListener(ev, wake)
      document.removeEventListener('visibilitychange', onVis)
      gl.domElement.removeEventListener('webglcontextlost', onLost)
    }
  }, [invalidate, gl, goLite])

  return null
}

export default function Canvas3D({ goLite }: { goLite: () => void }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
      camera={{ fov: 44, near: 0.1, far: 260, position: [0, 0.6, 15] }}
      onCreated={({ gl }) => gl.setClearColor('#06080b', 1)}
    >
      <color attach="background" args={['#06080b']} />
      <fog attach="fog" args={['#06080b', 14, 96]} />
      <hemisphereLight args={['#dfe6ec', '#10151a', 0.7]} />
      <Rig />
      <SpatialGrid />
      <ParticleField />
      <ZoneField />
      <PerformanceMonitor />
      <AdaptiveDpr />
      <Director goLite={goLite} />
    </Canvas>
  )
}
