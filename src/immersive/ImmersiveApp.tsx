import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import '../styles/immersive.css'
import { useProgress } from '@react-three/drei'
import { Loader } from '../overlay/Loader'
import { Panels } from '../overlay/Panels'
import { ProgressRail } from '../overlay/ProgressRail'
import { ModeToggle } from '../overlay/ModeToggle'
import { GyroButton } from '../overlay/GyroButton'
import { useScrollLock } from '../overlay/useScrollLock'
import { useVisualViewport } from '../overlay/useVisualViewport'
import { useJourney, frame } from './store'
import { preloadCore } from './models'
import { prefersReducedMotion } from '../lib/mode'
import { recenter } from './gyro'

const Canvas3D = lazy(() => import('./Canvas3D'))
preloadCore()

export default function ImmersiveApp({ onFail }: { onFail: () => void }) {
  const { active, progress } = useProgress()
  const zoneIndex = useJourney((s) => s.zoneIndex)
  const expandedZone = useJourney((s) => s.expandedZone)
  const [done, setDone] = useState(false)
  const started = useRef(false)
  const expanded = expandedZone !== null

  // Keep CSS in sync with the real visible viewport (toolbars/notch) and freeze
  // the outer scroll while a card is expanded (camera holds this zone).
  useVisualViewport()
  useScrollLock(expanded)

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

  // root state: floating UI (rail / toggle / CTA / gyro) re-layouts via CSS
  useEffect(() => {
    const r = document.documentElement
    r.classList.toggle('panel-expanded', expanded)
    return () => r.classList.remove('panel-expanded')
  }, [expanded])

  // gyro amplitude target (ramped in the gyro loop): full while exploring, a
  // touch calmer in the QR zone, fully frozen while reading an expanded card.
  useEffect(() => {
    frame.gyroGainTarget = expanded ? 0 : zoneIndex === 6 ? 0.4 : 1
  }, [expanded, zoneIndex])

  // returning from an expanded card: re-centre on the CURRENT pose so the camera
  // eases from neutral instead of snapping back to the old angle.
  const prevExpanded = useRef(false)
  useEffect(() => {
    if (prevExpanded.current && !expanded) recenter()
    prevExpanded.current = expanded
  }, [expanded])

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
      <GyroButton />

      {!done && <Loader progress={progress} done={started.current && !active && progress >= 100} />}
    </div>
  )
}
