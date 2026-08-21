import { frame } from './store'

/**
 * DeviceOrientation → a responsive, normalised look signal (frame.gyroX/gyroY in
 * -1..1, read in the Rig). It's RELATIVE to a calibrated neutral pose and shaped
 * so small tilts already produce an obvious response, with an adaptive One-Euro
 * filter (fast when you move quickly, stable when you hold still). The Rig maps
 * this normalised signal to per-zone camera position + look-at offsets, so it
 * reads as moving through a space — not spinning a model in place.
 */

const MAX_DEG = 16 // tilt that reaches full range
const DEAD_DEG = 0.3 // tiny — only filters real hand shake
const CALIB_N = 12 // frames averaged for the neutral centre

// ---- adaptive One-Euro filter ----
const alpha = (cutoff: number, dt: number) => {
  const tau = 1 / (2 * Math.PI * cutoff)
  return 1 / (1 + tau / dt)
}
class OneEuro {
  private minCutoff: number
  private beta: number
  private dCutoff: number
  private xPrev = 0
  private dxPrev = 0
  private init = false
  constructor(minCutoff = 1.0, beta = 0.7, dCutoff = 1.0) {
    this.minCutoff = minCutoff
    this.beta = beta
    this.dCutoff = dCutoff
  }
  filter(x: number, dt: number): number {
    if (dt <= 0) dt = 1 / 60
    if (!this.init) {
      this.xPrev = x
      this.init = true
      return x
    }
    const dx = (x - this.xPrev) / dt
    const edx = this.dxPrev + alpha(this.dCutoff, dt) * (dx - this.dxPrev)
    this.dxPrev = edx
    const cutoff = this.minCutoff + this.beta * Math.abs(edx)
    const ex = this.xPrev + alpha(cutoff, dt) * (x - this.xPrev)
    this.xPrev = ex
    return ex
  }
  reset() {
    this.init = false
    this.xPrev = 0
    this.dxPrev = 0
  }
}
const fx = new OneEuro()
const fy = new OneEuro()

// ---- non-linear response: strong small-tilt feedback, smooth clamp near max ----
function shape(deg: number): number {
  const s = Math.sign(deg)
  const a = Math.abs(deg) - DEAD_DEG
  if (a <= 0) return 0
  const t = Math.min(a / MAX_DEG, 1)
  const shaped = 1 - Math.pow(1 - t, 1.7)
  return s * shaped
}

let listening = false
let raf = 0
let lastT = 0
const rawTarget = { x: 0, y: 0 }

// calibration
let calib: Array<{ b: number; g: number }> = []
let zero: { beta: number; gamma: number } | null = null
let onStatus: ((s: 'calibrating' | 'ready') => void) | null = null

function orientationAngle(): number {
  const a =
    (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number'
      ? screen.orientation.angle
      : (window as unknown as { orientation?: number }).orientation) ?? 0
  return typeof a === 'number' ? a : 0
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  const beta = Math.max(-90, Math.min(90, e.beta))
  const gamma = Math.max(-90, Math.min(90, e.gamma))

  if (!zero) {
    calib.push({ b: beta, g: gamma })
    if (calib.length >= CALIB_N) {
      zero = { beta: median(calib.map((c) => c.b)), gamma: median(calib.map((c) => c.g)) }
      calib = []
      onStatus?.('ready')
    }
    return
  }

  let dB = beta - zero.beta
  const dG = gamma - zero.gamma
  if (dB > 180) dB -= 360
  if (dB < -180) dB += 360

  // sudden huge jump → sensor glitch: re-centre softly
  if (Math.abs(dB) > 70 || Math.abs(dG) > 70) {
    zero = { beta, gamma }
    return
  }

  const angle = orientationAngle()
  let yawDeg: number
  let pitchDeg: number
  if (angle === 90) {
    yawDeg = dB
    pitchDeg = dG
  } else if (angle === 270 || angle === -90) {
    yawDeg = -dB
    pitchDeg = -dG
  } else if (angle === 180) {
    yawDeg = -dG
    pitchDeg = -dB
  } else {
    yawDeg = dG // portrait
    pitchDeg = dB
  }
  rawTarget.x = shape(yawDeg)
  rawTarget.y = shape(pitchDeg)
}

function loop(t: number) {
  raf = requestAnimationFrame(loop)
  const dt = lastT ? (t - lastT) / 1000 : 1 / 60
  lastT = t
  // ramp amplitude toward its target (~400ms) so expand→freeze and collapse→restore are smooth
  frame.gyroGain += (frame.gyroGainTarget - frame.gyroGain) * (1 - Math.pow(0.001, Math.min(dt, 0.05)))
  const g = frame.gyroGain
  frame.gyroX = fx.filter(rawTarget.x, dt) * g
  frame.gyroY = fy.filter(rawTarget.y, dt) * g
}

export function recenter() {
  zero = null
  calib = []
  rawTarget.x = 0
  rawTarget.y = 0
  fx.reset()
  fy.reset()
  onStatus?.('calibrating')
}

export function startGyro(status?: (s: 'calibrating' | 'ready') => void): boolean {
  onStatus = status ?? null
  if (listening) {
    recenter()
    return true
  }
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return false
  recenter()
  window.addEventListener('deviceorientation', onOrient, true)
  window.addEventListener('orientationchange', recenter)
  lastT = 0
  raf = requestAnimationFrame(loop)
  listening = true
  return true
}

export function stopGyro() {
  if (!listening) return
  window.removeEventListener('deviceorientation', onOrient, true)
  window.removeEventListener('orientationchange', recenter)
  cancelAnimationFrame(raf)
  frame.gyroX = 0
  frame.gyroY = 0
  rawTarget.x = 0
  rawTarget.y = 0
  listening = false
}

/** iOS 13+ needs an explicit permission grant inside a user gesture. */
export async function requestGyroPermission(): Promise<boolean> {
  try {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (DOE && typeof DOE.requestPermission === 'function') {
      const res = await DOE.requestPermission()
      if (res !== 'granted') return false
    }
    const DME = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (DME && typeof DME.requestPermission === 'function') {
      try {
        await DME.requestPermission()
      } catch {
        /* motion optional */
      }
    }
    return 'DeviceOrientationEvent' in window
  } catch {
    return false
  }
}
