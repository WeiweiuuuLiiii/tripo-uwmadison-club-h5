import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import '../styles/immersive.css'
import { useProgress } from '@react-three/drei'
import { Loader } from '../overlay/Loader'
import { Panels } from '../overlay/Panels'
import { ProgressRail } from '../overlay/ProgressRail'
import { ModeToggle } from '../overlay/ModeToggle'
import { GyroButton } from '../overlay/GyroButton'
import { useScrollLock } from '../overlay/useScrollLock'
import { useJourney, frame } from './store'
import { preloadCore } from './models'
import { prefersReducedMotion } from '../lib/mode'

const Canvas3D = lazy(() => import('./Canvas3D'))
preloadCore()

export default function ImmersiveApp({ onFail }: { onFail: () => void }) {
  const { active, progress } = useProgress()
  const zoneIndex = useJourney((s) => s.zoneIndex)
  const expandedZone = useJourney((s) => s.expandedZone)
  const [done, setDone] = useState(false)
  const started = useRef(false)
  const expanded = expandedZone !== null

  // While a card is expanded: freeze the outer scroll (camera holds this zone),
  // let the card body scroll on its own.
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

  // gyro amplitude: calm while reading a card, and near the QR
  useEffect(() => {
    frame.gyroGain = expanded ? 0.18 : zoneIndex === 6 ? 0.15 : 1
  }, [expanded, zoneIndex])

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
