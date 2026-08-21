import * as THREE from 'three'

/**
 * Maps the NATIVE document scroll to a camera-rail parameter using the REAL DOM
 * section positions — so it stays correct even though sections change height when
 * their cards expand. Section i's centre corresponds to zone-node i; between two
 * centres the parameter eases (smoothstep) so the camera DWELLS on the current
 * zone while you read, then transitions as the next section actually arrives.
 * Centres are cached and only recomputed on resize / expand (ResizeObserver),
 * never per-frame, so there's no layout thrash.
 */

let centers: number[] = [] // document-space Y of each section centre
let count = 0

const smooth = (t: number) => t * t * (3 - 2 * t)

export function initSectionRail(): () => void {
  const measure = () => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.zone'))
    count = els.length
    centers = els.map((el) => el.offsetTop + el.offsetHeight / 2)
  }
  measure()

  const ro = new ResizeObserver(measure)
  document.querySelectorAll<HTMLElement>('.zone').forEach((el) => ro.observe(el))
  window.addEventListener('resize', measure, { passive: true })
  window.addEventListener('orientationchange', measure)
  // re-measure after fonts / images settle
  const t1 = window.setTimeout(measure, 400)
  const t2 = window.setTimeout(measure, 1600)

  return () => {
    ro.disconnect()
    window.removeEventListener('resize', measure)
    window.removeEventListener('orientationchange', measure)
    window.clearTimeout(t1)
    window.clearTimeout(t2)
  }
}

/** camera rail parameter 0..1 from the current scroll + section centres. */
export function railProgress(): number {
  const N = count
  if (N < 2) return 0
  const vc = window.scrollY + window.innerHeight / 2
  if (vc <= centers[0]) return 0
  if (vc >= centers[N - 1]) return 1
  let i = 0
  while (i < N - 1 && vc >= centers[i + 1]) i++
  const span = centers[i + 1] - centers[i] || 1
  const t = THREE.MathUtils.clamp((vc - centers[i]) / span, 0, 1)
  return (i + smooth(t)) / (N - 1)
}

/** the section whose centre is nearest the viewport centre (for the overlay). */
export function activeSection(): number {
  const N = count
  if (N === 0) return 0
  const vc = window.scrollY + window.innerHeight / 2
  let best = 0
  let bd = Infinity
  for (let i = 0; i < N; i++) {
    const dd = Math.abs(centers[i] - vc)
    if (dd < bd) {
      bd = dd
      best = i
    }
  }
  return best
}
