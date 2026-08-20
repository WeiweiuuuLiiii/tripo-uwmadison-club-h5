import * as THREE from 'three'
import { frame } from './store'

/**
 * Real DeviceOrientation → a small, damped, clamped camera look offset written
 * into `frame` (read in the Rig's useFrame — no React re-render). It's RELATIVE
 * to the pose captured when enabled (not absolute compass), with a dead zone,
 * low-pass smoothing, gimbal clamps, and screen-orientation handling. It only
 * ADDS to the scroll-rail camera; it never spins models in place.
 */

const MAX_YAW = THREE.MathUtils.degToRad(9)
const MAX_PITCH = THREE.MathUtils.degToRad(6)
const DEAD_DEG = 1.2 // ignore tiny hand shake
const GAIN = 0.42 // tilt-deg → look-deg

let listening = false
let zero: { beta: number; gamma: number } | null = null
let raf = 0
const target = { yaw: 0, pitch: 0 }

function orientationAngle(): number {
  const a =
    (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number'
      ? screen.orientation.angle
      : (window as unknown as { orientation?: number }).orientation) ?? 0
  return typeof a === 'number' ? a : 0
}

const deadzone = (v: number) => (Math.abs(v) < DEAD_DEG ? 0 : v - Math.sign(v) * DEAD_DEG)

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  const beta = THREE.MathUtils.clamp(e.beta, -90, 90)
  const gamma = THREE.MathUtils.clamp(e.gamma, -90, 90)
  if (!zero) {
    zero = { beta, gamma }
    return
  }
  let dB = beta - zero.beta
  const dG = gamma - zero.gamma
  if (dB > 180) dB -= 360
  if (dB < -180) dB += 360

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

  target.yaw = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(deadzone(yawDeg) * GAIN), -MAX_YAW, MAX_YAW)
  target.pitch = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(deadzone(pitchDeg) * GAIN), -MAX_PITCH, MAX_PITCH)
}

function loop() {
  raf = requestAnimationFrame(loop)
  const g = frame.gyroGain
  // low-pass toward target*gain — no sudden jumps
  frame.gyroYaw += (target.yaw * g - frame.gyroYaw) * 0.08
  frame.gyroPitch += (target.pitch * g - frame.gyroPitch) * 0.08
}

export function recenter() {
  zero = null
}

export function startGyro(): boolean {
  if (listening) return true
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return false
  zero = null
  window.addEventListener('deviceorientation', onOrient, true)
  window.addEventListener('orientationchange', recenter)
  raf = requestAnimationFrame(loop)
  listening = true
  return true
}

export function stopGyro() {
  if (!listening) return
  window.removeEventListener('deviceorientation', onOrient, true)
  window.removeEventListener('orientationchange', recenter)
  cancelAnimationFrame(raf)
  frame.gyroYaw = 0
  frame.gyroPitch = 0
  target.yaw = 0
  target.pitch = 0
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
        /* motion is optional */
      }
    }
    return 'DeviceOrientationEvent' in window
  } catch {
    return false
  }
}
