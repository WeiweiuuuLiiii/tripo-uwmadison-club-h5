import { useEffect, useRef } from 'react'
import { useJourney } from '../immersive/store'
import { ZONES } from '../immersive/rail'
import { frame } from '../immersive/store'

/**
 * Compact 01–07 spatial progress indicator. The active zone comes from the store
 * (changes rarely); the fill bar reads frame.offset via its own rAF so it tracks
 * scroll smoothly without triggering any React re-render.
 */
export function ProgressRail() {
  const zoneIndex = useJourney((s) => s.zoneIndex)
  const fillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (fillRef.current) fillRef.current.style.height = `${(frame.offset * 100).toFixed(1)}%`
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <nav className="prog-rail" aria-label="探索进度">
      <span className="pr-track">
        <span className="pr-fill" ref={fillRef} />
      </span>
      <ol>
        {ZONES.map((z, i) => (
          <li key={z.id} className={i === zoneIndex ? 'on' : i < zoneIndex ? 'done' : ''}>
            <span className="pr-num">{z.id}</span>
            <span className="pr-name">{z.cn}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
