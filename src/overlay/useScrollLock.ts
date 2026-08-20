import { useEffect } from 'react'
import { frame } from '../immersive/store'

/**
 * While `locked`, freeze the OUTER document scroll (which drives the 3D camera)
 * so the camera stays in the current zone, while still allowing the expanded
 * card's own body (`selector`) to scroll with natural inertia. iOS-safe: we
 * preventDefault page-scroll gestures rather than `position:fixed` the body, so
 * the scroll position is never lost and the camera never jumps to the top.
 * Long-press (no movement) is untouched, so QR recognition keeps working.
 */
export function useScrollLock(locked: boolean, selector = '.hud-body') {
  useEffect(() => {
    if (!locked) return
    const root = document.documentElement
    root.classList.add('scroll-locked')
    frame.locked = true

    const insideScrollable = (t: EventTarget | null): HTMLElement | null => {
      let el = t as HTMLElement | null
      while (el && el !== document.body) {
        if (el.matches?.(selector)) return el
        el = el.parentElement
      }
      return null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!insideScrollable(e.target)) e.preventDefault()
    }
    const onWheel = (e: WheelEvent) => {
      if (!insideScrollable(e.target)) e.preventDefault()
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      root.classList.remove('scroll-locked')
      frame.locked = false
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('wheel', onWheel)
    }
  }, [locked, selector])
}
