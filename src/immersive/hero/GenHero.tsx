import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { frame } from '../store'
import { MODELS } from '../models'
import { pointSprite } from './heroAssets'

/**
 * The generation hero — a REAL textured GLB (DamagedHelmet, CC BY 4.0) shown as
 * three synchronized states driven by the scroll-derived reveal:
 *   exploded point cloud → wireframe mesh → fully textured PBR model.
 * The point cloud and wireframe are built from the actual model geometry, so the
 * silhouette that assembles is the real helmet, not a primitive.
 */
export function GenHero({
  position = [0, 0, 0],
  scale = 1,
  spin = 0.3,
  mode = 'generate',
}: {
  position?: [number, number, number]
  scale?: number
  spin?: number
  mode?: 'generate' | 'solid'
}) {
  const gltf = useGLTF(MODELS.helmet, false, true)
  const spinRef = useRef<THREE.Group>(null)

  const uScatter = useMemo(() => ({ value: 1 }), [])

  const built = useMemo(() => {
    const src = gltf.scene
    src.updateWorldMatrix(true, true)
    let mesh: THREE.Mesh | null = null
    src.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !mesh) mesh = o as THREE.Mesh
    })
    const m = mesh as unknown as THREE.Mesh
    // bake world transform so points/wire/textured share one space
    const geo = m.geometry.clone().applyMatrix4(m.matrixWorld)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const center = new THREE.Vector3()
    new THREE.Box3().setFromBufferAttribute(pos).getCenter(center)
    const scatter = new Float32Array(pos.count * 3)
    const p = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).sub(center)
      const dir = p.clone().normalize()
      const mag = 0.4 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 1.4
      scatter[i * 3] = dir.x * mag
      scatter[i * 3 + 1] = dir.y * mag
      scatter[i * 3 + 2] = dir.z * mag
    }
    geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
    const edges = new THREE.EdgesGeometry(geo, 24)

    // textured clone with its own (clonable) materials so we can fade opacity
    const textured = src.clone(true)
    const mats: THREE.Material[] = []
    textured.traverse((o) => {
      const mm = o as THREE.Mesh
      if (mm.isMesh) {
        const mat = (mm.material as THREE.MeshStandardMaterial).clone()
        mat.transparent = true
        mat.envMapIntensity = 1.1
        mm.material = mat
        mats.push(mat)
      }
    })

    // fit whole thing into ~1.8 units around origin
    const box = new THREE.Box3().setFromObject(src)
    const c = new THREE.Vector3()
    box.getCenter(c)
    const size = new THREE.Vector3()
    box.getSize(size)
    const fit = 1.8 / Math.max(size.x, size.y, size.z)

    return { geo, edges, textured, mats, center, c, fit }
  }, [gltf])

  const pointsMat = useMemo(() => {
    const mm = new THREE.PointsMaterial({
      size: 0.03,
      map: pointSprite(),
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      color: new THREE.Color('#cfe8ff'),
      blending: THREE.AdditiveBlending,
    })
    mm.onBeforeCompile = (shader) => {
      shader.uniforms.uScatter = uScatter
      shader.vertexShader =
        'attribute vec3 aScatter;\nuniform float uScatter;\n' +
        shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed += aScatter * uScatter;')
    }
    return mm
  }, [uScatter])
  const wireMat = useMemo(() => new THREE.LineBasicMaterial({ color: new THREE.Color('#8fd8e8'), transparent: true, opacity: 0, depthWrite: false }), [])

  const pointsRef = useRef<THREE.Points>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  useFrame((_, delta) => {
    const r = mode === 'generate' ? frame.reveal : 1
    uScatter.value = Math.max(0, 1 - r * 1.7)
    const pOp = Math.max(0, 1 - THREE.MathUtils.smoothstep(r, 0, 0.5))
    pointsMat.opacity = pOp
    if (pointsRef.current) pointsRef.current.visible = pOp > 0.01
    const wOp = Math.sin(THREE.MathUtils.clamp(r, 0, 1) * Math.PI)
    wireMat.opacity = wOp * 0.85
    if (wireRef.current) wireRef.current.visible = wOp > 0.01
    const tOp = THREE.MathUtils.smoothstep(r, 0.5, 1)
    for (const m of built.mats) m.opacity = tOp

    if (spinRef.current && !frame.reducedMotion) {
      spinRef.current.rotation.y += Math.min(delta, 0.05) * spin
    }
  })

  return (
    <group position={position} scale={scale}>
      <group ref={spinRef}>
        <group scale={built.fit} position={[-built.c.x * built.fit, -built.c.y * built.fit, -built.c.z * built.fit]}>
          <primitive object={built.textured} />
          <points ref={pointsRef} geometry={built.geo} material={pointsMat} />
          <lineSegments ref={wireRef} geometry={built.edges} material={wireMat} />
        </group>
      </group>
    </group>
  )
}
