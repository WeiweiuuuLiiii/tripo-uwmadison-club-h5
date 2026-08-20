import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import '../styles/immersive.css'
import { useProgress } from '@react-three/drei'
import { Loader } from '../overlay/Loader'
import { Panels } from '../overlay/Panels'
import { ProgressRail } from '../overlay/ProgressRail'
import { ModeToggle } from '../overlay/ModeToggle'
import { useJourney, frame } from './store'
import { preloadCore } from './models'
import { prefersReducedMotion } from '../lib/mode'

const Canvas3D = lazy(() => import('./Canvas3D'))
preloadCore()

/**
 * Immersive shell: a FIXED WebGL world behind normal-flow HTML sections that
 * scroll over it. The camera follows the document scroll (see Rig). The overlay
 * is fully semantic HTML — text, buttons, disclaimer, QR — never drawn to canvas.
 * The loader shows REAL asset progress (useProgress) until the GLB world is ready.
 */
export default function ImmersiveApp({ onFail }: { onFail: () => void }) {
  const { active, progress } = useProgress()
  const zoneIndex = useJourney((s) => s.zoneIndex)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    frame.reducedMotion = prefersReducedMotion()
  }, [])

  useEffect(() => {
    if (active) started.current = true
  }, [active])

  useEffect(() => {
    // hide once real loading has begun and finished…
    if (started.current && !active && progress >= 100) {
      const t = window.setTimeout(() => setDone(true), 600)
      return () => window.clearTimeout(t)
    }
    return
  }, [active, progress])

  useEffect(() => {
    // …and a hard cap so the loader can never hang the page
    const cap = window.setTimeout(() => setDone(true), 20000)
    return () => window.clearTimeout(cap)
  }, [])

  const atJoin = zoneIndex === 6

  return (
    <div className="immersive">
      <div className="canvas-layer" aria-hidden="true">
        <Suspense fallback={null}>
          <Canvas3D onFail={onFail} />
        </Suspense>
        <div className="fx-scan" />
        <div className="fx-vignette" />
      </div>

      <div className="overlay-layer">
        <Panels />
      </div>

      <ProgressRail />
      <ModeToggle />

      <div className={`join-cta${atJoin ? ' hidden' : ''}`}>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('z07')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          立即加入
        </button>
      </div>

      {!done && <Loader progress={progress} done={started.current && !active && progress >= 100} />}
    </div>
  )
}
