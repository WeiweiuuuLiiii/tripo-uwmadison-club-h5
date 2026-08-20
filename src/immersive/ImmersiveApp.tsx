import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import '../styles/immersive.css'
import { Loader } from '../overlay/Loader'
import { Panels } from '../overlay/Panels'
import { ProgressRail } from '../overlay/ProgressRail'
import { useJourney } from './store'

const Canvas3D = lazy(() => import('./Canvas3D'))

/**
 * The immersive shell: a FIXED WebGL world behind normal-flow HTML sections that
 * scroll over it (native scroll = smooth WeChat momentum). The camera follows the
 * document scroll (see Rig); the overlay stays fully semantic — text, buttons,
 * disclaimer and the QR are real HTML, never drawn into the canvas.
 */
export default function ImmersiveApp({ goLite }: { goLite: () => void }) {
  const ready = useJourney((s) => s.ready)
  const zoneIndex = useJourney((s) => s.zoneIndex)
  const [pct, setPct] = useState(6)
  const [done, setDone] = useState(false)
  const pctRef = useRef(6)

  useEffect(() => {
    if (ready) return
    const id = window.setInterval(() => {
      pctRef.current = Math.min(88, pctRef.current + Math.random() * 9)
      setPct(pctRef.current)
    }, 180)
    return () => window.clearInterval(id)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    setPct(100)
    const t = window.setTimeout(() => setDone(true), 650)
    return () => window.clearTimeout(t)
  }, [ready])

  const atJoin = zoneIndex === 6

  return (
    <div className="immersive">
      <div className="canvas-layer" aria-hidden="true">
        <Suspense fallback={null}>
          <Canvas3D goLite={goLite} />
        </Suspense>
        <div className="fx-scan" />
        <div className="fx-vignette" />
      </div>

      <div className="overlay-layer">
        <Panels />
      </div>

      <ProgressRail />

      <div className={`join-cta${atJoin ? ' hidden' : ''}`}>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('z07')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          立即加入
        </button>
      </div>

      {!done && <Loader progress={pct} done={ready} />}
    </div>
  )
}
