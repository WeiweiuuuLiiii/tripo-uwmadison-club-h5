/**
 * Mode resolution for the immersive experience.
 *
 * DEFAULT IS 3D. We only fall back to Lite when WebGL genuinely can't run, when
 * the user explicitly chose Lite (a real preference, not a failure), or via
 * ?lite=1. Weak-ish devices still get 3D — we scale QUALITY (dpr/texture/model
 * budget) instead of taking the world away. There is NO permanent failure lock.
 */

const PREF_KEY = 'tripo-mode' // user's explicit toggle choice: '3d' | 'lite'

export type Mode = '3d' | 'lite'
export type Quality = 'high' | 'med' | 'low'

function webglOK(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

let _mode: Mode | undefined
export function resolveMode(): Mode {
  if (_mode) return _mode
  _mode = _resolve()
  return _mode
}

function _resolve(): Mode {
  if (typeof window === 'undefined') return 'lite'
  let q: URLSearchParams | null = null
  try {
    q = new URLSearchParams(window.location.search)
  } catch {
    /* ignore */
  }

  // explicit URL overrides win and update the stored preference
  if (q?.get('lite') === '1') {
    setModePref('lite')
    return 'lite'
  }
  if (q?.get('lite') === '0' || q?.get('mode') === '3d') {
    clearModePref()
    return webglOK() ? '3d' : 'lite'
  }

  // an explicit user toggle choice
  const pref = readPref()
  if (pref === 'lite') return 'lite'
  if (pref === '3d') return webglOK() ? '3d' : 'lite'

  // DEFAULT: immersive 3D whenever WebGL is available
  return webglOK() ? '3d' : 'lite'
}

function readPref(): Mode | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY)
    return v === '3d' || v === 'lite' ? v : null
  } catch {
    return null
  }
}
export function setModePref(m: Mode) {
  try {
    window.localStorage.setItem(PREF_KEY, m)
  } catch {
    /* ignore */
  }
}
export function clearModePref() {
  try {
    window.localStorage.removeItem(PREF_KEY)
  } catch {
    /* ignore */
  }
}

/** Reduced motion CALMS the camera/particles — it never disables the 3D world. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Quality tier scales dpr / texture / model budget — NOT whether 3D runs. */
export function qualityTier(): Quality {
  if (typeof navigator === 'undefined') return 'med'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8
  const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8
  if (mem <= 3 || cores <= 3) return 'low'
  if (mem <= 6 || cores <= 6) return 'med'
  return 'high'
}

export const QUALITY = {
  high: { dprMax: 1.5, particles: 1400, envIntensity: 1.0 },
  med: { dprMax: 1.3, particles: 900, envIntensity: 0.9 },
  low: { dprMax: 1.0, particles: 500, envIntensity: 0.8 },
} as const

/** Switch modes from the visible toggle: persist the choice and reload cleanly. */
export function switchMode(to: Mode) {
  setModePref(to)
  try {
    const u = new URL(window.location.href)
    u.searchParams.delete('lite')
    u.searchParams.delete('mode')
    window.location.replace(u.toString())
  } catch {
    window.location.reload()
  }
}
