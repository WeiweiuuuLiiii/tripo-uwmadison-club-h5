/**
 * Cinematic-Lite detection. Runs synchronously BEFORE React mounts so we never
 * warm up WebGL on a device (or user) that shouldn't get it. Fail-closed: if
 * anything is uncertain we can only *add* reasons to go Lite, never the reverse.
 *
 * Any one of these forces Lite mode:
 *  - WebGL (2 or 1) cannot be created            → 3D literally can't render
 *  - prefers-reduced-motion: reduce              → user asked for calm
 *  - navigator.deviceMemory <= 3                  → low-RAM phone
 *  - navigator.hardwareConcurrency <= 4           → weak CPU
 *  - connection.saveData === true                 → data-saver on
 *  - ?lite=1 in the URL                           → manual / QA override
 *  - localStorage 'tripo3d-lite' === '1'          → a prior runtime failure
 */

const LS_KEY = 'tripo3d-lite'

function webglBroken(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl =
      c.getContext('webgl2') ||
      c.getContext('webgl') ||
      c.getContext('experimental-webgl')
    if (!gl) return true
    // Some WebViews hand back a context that immediately reports lost.
    const lose = (gl as WebGLRenderingContext).getExtension?.('WEBGL_lose_context')
    void lose
    return false
  } catch {
    return true
  }
}

let _cached: boolean | undefined
export function detectLite(): boolean {
  if (_cached !== undefined) return _cached
  _cached = _detect()
  return _cached
}

function _detect(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.get('lite') === '1') return true
    if (q.get('lite') === '0') {
      // explicit opt back into 3D (also clears a sticky prior failure)
      try {
        window.localStorage.removeItem(LS_KEY)
      } catch {
        /* ignore */
      }
      return webglBroken()
    }
  } catch {
    /* ignore */
  }

  try {
    if (window.localStorage.getItem(LS_KEY) === '1') return true
  } catch {
    /* ignore */
  }

  const mm = window.matchMedia
  if (mm && mm('(prefers-reduced-motion: reduce)').matches) return true

  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 3) return true
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true
  if (nav.connection?.saveData === true) return true

  return webglBroken()
}

/** Persist a runtime fall-back so a reload skips 3D entirely and loads instantly. */
export function stickLite(): void {
  try {
    window.localStorage.setItem(LS_KEY, '1')
  } catch {
    /* ignore */
  }
}
