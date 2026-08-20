import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Environment, PerformanceMonitor } from '@react-three/drei'
import { Rig } from './Rig'
import { ZoneField } from './zones/Zones'
import { ParticleField } from './fx/Ambient'
import { QUALITY, qualityTier } from '../lib/mode'

const BASE = import.meta.env.BASE_URL
const Q = QUALITY[qualityTier()]

/**
 * Director: drives `frameloop="demand"` at ~30fps while the tab is VISIBLE (so
 * animated GLBs and the camera keep moving), and stops entirely when hidden —
 * matching the 30fps target + pause-on-hidden budget. Also the runtime watchdog:
 * no first frame in time, or a lost GL context → hand off to the fail UI.
 */
function Director({ onFail }: { onFail: () => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)

  useFrame(() => {
    frames.current++
  })

  useEffect(() => {
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      if (t - last >= 30) {
        last = t
        invalidate()
      }
    }
    raf = requestAnimationFrame(loop)

    // Always render on interaction, independent of the visibility-gated heartbeat,
    // so scrolling can never freeze even if a webview mis-reports document.hidden.
    const wake = () => invalidate()
    for (const ev of ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchstart', 'touchmove'] as const)
      window.addEventListener(ev, wake, { passive: true })
    const onVis = () => !document.hidden && invalidate()
    document.addEventListener('visibilitychange', onVis)

    const wd = window.setTimeout(() => {
      if (frames.current === 0) onFail()
    }, 6000)
    const onLost = (e: Event) => {
      e.preventDefault()
      onFail()
    }
    gl.domElement.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(wd)
      for (const ev of ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchstart', 'touchmove'] as const)
        window.removeEventListener(ev, wake)
      document.removeEventListener('visibilitychange', onVis)
      gl.domElement.removeEventListener('webglcontextlost', onLost)
    }
  }, [invalidate, gl, onFail])

  return null
}

export default function Canvas3D({ onFail }: { onFail: () => void }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, Q.dprMax]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
      camera={{ fov: 44, near: 0.1, far: 300, position: [0, 0.9, 15] }}
      onCreated={({ gl }) => {
        gl.setClearColor('#06080b', 1)
        gl.toneMapping = 3 // ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <color attach="background" args={['#06080b']} />
      <fog attach="fog" args={['#06080b', 16, 108]} />
      <hemisphereLight args={['#c9d4de', '#0b1014', 0.55]} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} color="#eaf2f8" />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#6ee7ff" />
      <Suspense fallback={null}>
        <Environment files={`${BASE}env/studio_1k.hdr`} environmentIntensity={Q.envIntensity} background={false} />
        <Rig />
        <ParticleField count={Q.particles} />
        <ZoneField />
      </Suspense>
      <PerformanceMonitor />
      <AdaptiveDpr />
      <Director onFail={onFail} />
    </Canvas>
  )
}
