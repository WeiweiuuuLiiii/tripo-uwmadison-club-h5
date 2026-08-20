import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { frame } from './store'

/**
 * A real GLB placed in the world: cloned (skeleton-safe), auto-fit to a target
 * size, optionally spinning / floating, and playing its own animation clip.
 * Used for the animated character, vehicles, environment diorama, etc.
 */
export function Model({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fit = 2,
  yOffset = 0,
  spin = 0,
  float = 0,
  animate = true,
  animation,
}: {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  fit?: number
  yOffset?: number
  spin?: number
  float?: number
  animate?: boolean
  animation?: string
}) {
  const gltf = useGLTF(url, false, true)
  const scene = useMemo(() => skeletonClone(gltf.scene), [gltf])
  const { actions, names } = useAnimations(gltf.animations, scene)
  const spinRef = useRef<THREE.Group>(null)

  const norm = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const c = new THREE.Vector3()
    box.getCenter(c)
    const s = fit / Math.max(size.x, size.y, size.z || 1)
    return { s, cx: c.x, cy: box.min.y, cz: c.z } // rest models on their base (min.y)
  }, [scene, fit])

  useEffect(() => {
    if (!animate || frame.reducedMotion || names.length === 0) return
    const key = animation && actions[animation] ? animation : names[0]
    const a = actions[key]
    a?.reset().fadeIn(0.4).play()
    return () => {
      a?.fadeOut(0.2)
    }
  }, [actions, names, animate, animation])

  const t = useRef(0)
  useFrame((_, delta) => {
    if (frame.reducedMotion) return
    const d = Math.min(delta, 0.05)
    t.current += d
    if (spinRef.current) {
      if (spin) spinRef.current.rotation.y += d * spin
      if (float) spinRef.current.position.y = Math.sin(t.current * 1.2) * float
    }
  })

  return (
    <group position={position} rotation={rotation as unknown as THREE.Euler}>
      <group ref={spinRef}>
        <group scale={norm.s} position={[-norm.cx * norm.s, (-norm.cy + yOffset) * norm.s, -norm.cz * norm.s]}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}
