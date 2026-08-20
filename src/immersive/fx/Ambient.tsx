import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointSprite } from '../hero/heroAssets'

/** Drifting silver/ice motes filling the corridor — depth, atmosphere, "debris". */
export function ParticleField({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const ice = new THREE.Color('#6ee7ff')
    const silver = new THREE.Color('#aab3bd')
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = 16 - Math.random() * 128
      const c = Math.random() < 0.08 ? ice : silver
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [count])
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.06,
        map: pointSprite(),
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.05) * 0.01
  })
  return <points ref={ref} geometry={geo} material={mat} />
}

/** Faint spatial grid floor — the sense of standing inside a built volume. */
export function SpatialGrid() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(300, 80, new THREE.Color('#3a4550'), new THREE.Color('#20272e'))
    const m = g.material as THREE.Material | THREE.Material[]
    const apply = (mm: THREE.Material) => {
      mm.transparent = true
      mm.opacity = 0.28
      mm.depthWrite = false
    }
    if (Array.isArray(m)) m.forEach(apply)
    else apply(m)
    return g
  }, [])
  return (
    <>
      <primitive object={grid} position={[0, -2.4, -45]} />
    </>
  )
}
