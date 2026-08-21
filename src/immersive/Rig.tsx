import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroReveal, lookCurve, pathCurve } from './rail'
import { activeSection, initSectionRail, railProgress } from './sectionRail'
import { frame, useJourney } from './store'

/**
 * Drives the camera from NATIVE document scroll via real DOM section positions
 * (sectionRail), so it stays correct as cards expand and section heights change.
 * The camera dwells on the current zone while you read, then eases to the next as
 * that section arrives. Desktop mice can lightly drag to look; touch never drags
 * (single-finger swipes belong entirely to native page scroll).
 */
export function Rig() {
  const { camera } = useThree()
  const setZone = useJourney((s) => s.setZone)
  const setReady = useJourney((s) => s.setReady)

  const pos = useRef(new THREE.Vector3(...pathCurve.getPointAt(0).toArray()))
  const look = useRef(new THREE.Vector3(...lookCurve.getPointAt(0).toArray()))
  const started = useRef(false)

  useEffect(() => {
    const disposeRail = initSectionRail()

    // Desktop mouse-drag look only. Touch is ignored so page scroll is untouched.
    let dragging = false
    let sx = 0
    let sy = 0
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dragging = true
      sx = e.clientX
      sy = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return
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
      disposeRail()
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  useFrame((_, delta) => {
    const u = railProgress()
    frame.offset = u
    frame.reveal = heroReveal(u)

    const targetPos = pathCurve.getPointAt(u)
    const targetLook = lookCurve.getPointAt(Math.min(u + 0.015, 1))
    const dt = Math.min(delta, 0.05)
    const k = 1 - Math.pow(0.0016, dt) // frame-rate independent damping (absorbs height changes smoothly)
    pos.current.lerp(targetPos, k)
    look.current.lerp(targetLook, k)

    camera.position.copy(pos.current)
    camera.lookAt(look.current)
    camera.rotateY(frame.dragYaw)
    camera.rotateX(frame.dragPitch)
    frame.dragYaw = THREE.MathUtils.lerp(frame.dragYaw, 0, 1 - Math.pow(0.02, dt))
    frame.dragPitch = THREE.MathUtils.lerp(frame.dragPitch, 0, 1 - Math.pow(0.02, dt))

    setZone(activeSection())
    if (!started.current) {
      started.current = true
      setReady(true)
    }
  })

  return null
}
