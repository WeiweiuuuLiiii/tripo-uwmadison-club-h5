import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import '../styles/immersive.css'
import { useProgress } from '@react-three/drei'
import { Loader } from '../overlay/Loader'
import { Panels } from '../overlay/Panels'
import { ProgressRail } from '../overlay/ProgressRail'
import { ModeToggle } from '../overlay/ModeToggle'
import { frame } from './store'
import { preloadCore } from './models'
import { prefersReducedMotion } from '../lib/mode'

const Canvas3D = lazy(() => import('./Canvas3D'))
preloadCore()

/**
 * Immersive shell: a FIXED WebGL world behind ONE continuously-scrolling column of
 * HTML sections. The camera follows the native document scroll via real DOM section
 * positions (Rig + sectionRail). Cards expand IN FLOW — no modal, no scroll lock,
 * no nested scrollers — so the page always scrolls straight on into the next zone.
 */
export default function ImmersiveApp({ onFail }: { onFail: () => void }) {
  const { active, progress } = useProgress()
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    frame.reducedMotion = prefersReducedMotion()
  }, [])

  useEffect(() => {
    if (active) started.current = true
  }, [active])

  useEffect(() => {
    if (started.current && !active && progress >= 100) {
      const t = window.setTimeout(() => setDone(true), 600)
      return () => window.clearTimeout(t)
    }
    return
  }, [active, progress])

  useEffect(() => {
    const cap = window.setTimeout(() => setDone(true), 20000)
    return () => window.clearTimeout(cap)
  }, [])

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

      {!done && <Loader progress={progress} done={started.current && !active && progress >= 100} />}
    </div>
  )
}
