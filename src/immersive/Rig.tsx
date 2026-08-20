import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroReveal, lookCurve, pathCurve, railU, zoneOf } from './rail'
import { frame, useJourney } from './store'

/** document scroll → 0..1 progress. */
function scrollProgress(): number {
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  return max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0
}

/**
 * Turns native document scroll into a guided camera. Position/look are sampled
 * from the two Catmull-Rom rails via the dwell reparam (railU), damped for
 * momentum, then a small clamped drag offset lets the user peek off-axis without
 * ever leaving the path.
 */
export function Rig() {
  const { camera } = useThree()
  const setZone = useJourney((s) => s.setZone)
  const setReady = useJourney((s) => s.setReady)

  const pos = useRef(new THREE.Vector3(...pathCurve.getPointAt(0).toArray()))
  const look = useRef(new THREE.Vector3(...lookCurve.getPointAt(0).toArray()))
  const started = useRef(false)

  useEffect(() => {
    frame.offset = scrollProgress()
    const onScroll = () => {
      frame.offset = scrollProgress()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    // Drag-to-look: horizontal drag = yaw, slight vertical = pitch, clamped and
    // eased back to centre on release. Passive listeners never block scrolling.
    let dragging = false
    let sx = 0
    let sy = 0
    const down = (e: PointerEvent) => {
      dragging = true
      sx = e.clientX
      sy = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const w = window.innerWidth || 1
      frame.dragYaw = THREE.MathUtils.clamp(((e.clientX - sx) / w) * 0.5, -0.14, 0.14)
      frame.dragPitch = THREE.MathUtils.clamp(((e.clientY - sy) / w) * 0.3, -0.06, 0.06)
    }
    const up = () => {
      dragging = false
    }
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  useFrame((_, delta) => {
    const offset = frame.offset
    frame.reveal = heroReveal(offset)

    const u = railU(offset)
    const targetPos = pathCurve.getPointAt(u)
    const targetLook = lookCurve.getPointAt(Math.min(u + 0.015, 1))

    const dt = Math.min(delta, 0.05)
    const k = 1 - Math.pow(0.0016, dt) // frame-rate independent damping
    pos.current.lerp(targetPos, k)
    look.current.lerp(targetLook, k)

    camera.position.copy(pos.current)
    camera.lookAt(look.current)
    // finalCamera = scrollRail + gyroOffset + dragOffset
    const yaw = frame.dragYaw + frame.gyroYaw
    const pitch = frame.dragPitch + frame.gyroPitch
    camera.rotateY(yaw)
    camera.rotateX(pitch)
    // positional parallax from the gyro (near objects shift more than far)
    const MAX_YAW = 0.157 // rad ≈ 9°
    const MAX_PITCH = 0.105 // rad ≈ 6°
    camera.translateX(THREE.MathUtils.clamp((frame.gyroYaw / MAX_YAW) * 0.42, -0.42, 0.42))
    camera.translateY(THREE.MathUtils.clamp((frame.gyroPitch / MAX_PITCH) * 0.22, -0.22, 0.22))
    // finger drag recentres; gyro is held by its own low-pass
    frame.dragYaw = THREE.MathUtils.lerp(frame.dragYaw, 0, 1 - Math.pow(0.02, dt))
    frame.dragPitch = THREE.MathUtils.lerp(frame.dragPitch, 0, 1 - Math.pow(0.02, dt))

    if (!frame.locked) setZone(zoneOf(offset))
    if (!started.current) {
      started.current = true
      setReady(true)
    }
  })

  return null
}
