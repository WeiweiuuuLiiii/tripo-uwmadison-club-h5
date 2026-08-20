import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frame } from '../store'
import { heroEdges, heroGeometry, pointSprite, titaniumMatcap } from './heroAssets'

/**
 * The generation hero. One shared geometry rendered as three cross-faded states:
 *   points (exploded → assembling)  →  wireframe mesh  →  textured titanium.
 * In `generate` mode the blend is driven by the scroll-derived reveal (zone 02);
 * elsewhere it stays fully textured and just turns with the journey.
 */
export function HeroModel({
  position = [0, 0, 0],
  scale = 1,
  mode = 'solid',
  spin = 0.4,
}: {
  position?: [number, number, number]
  scale?: number
  mode?: 'generate' | 'solid'
  spin?: number
}) {
  const group = useRef<THREE.Group>(null)
  const geo = useMemo(() => heroGeometry(), [])
  const edges = useMemo(() => heroEdges(), [])

  const uScatter = useMemo(() => ({ value: 1 }), [])
  const pointsMat = useMemo(() => {
    const m = new THREE.PointsMaterial({
      size: 0.05,
      map: pointSprite(),
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      color: new THREE.Color('#dfe6ec'),
      blending: THREE.AdditiveBlending,
    })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uScatter = uScatter
      shader.vertexShader =
        'attribute vec3 aScatter;\nuniform float uScatter;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n  transformed += aScatter * uScatter;',
        )
    }
    return m
  }, [uScatter])

  const wireMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#8b949e'),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    [],
  )
  const solidMat = useMemo(() => {
    const m = new THREE.MeshMatcapMaterial({ matcap: titaniumMatcap(), transparent: true, opacity: 0 })
    return m
  }, [])
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#6ee7ff'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  const pointsRef = useRef<THREE.Points>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  useFrame((_, delta) => {
    const r = mode === 'generate' ? frame.reveal : 1
    // point cloud: exploded + bright when r≈0, gone by mid-reveal
    uScatter.value = Math.max(0, 1 - r * 1.8)
    const pOp = Math.max(0, 1 - THREE.MathUtils.smoothstep(r, 0.0, 0.55))
    pointsMat.opacity = pOp
    if (pointsRef.current) pointsRef.current.visible = pOp > 0.01
    // wireframe: bell curve, peaks mid-reveal
    const wOp = Math.sin(THREE.MathUtils.clamp(r, 0, 1) * Math.PI) * 0.9
    wireMat.opacity = wOp
    if (wireRef.current) wireRef.current.visible = wOp > 0.01
    // textured titanium: fades in over the back half
    solidMat.opacity = THREE.MathUtils.smoothstep(r, 0.5, 1)
    ringMat.opacity = THREE.MathUtils.smoothstep(r, 0.55, 1) * 0.7

    if (group.current) {
      const dt = Math.min(delta, 0.05)
      group.current.rotation.y += dt * spin + 0.0006
      group.current.rotation.x = -0.12
    }
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <points ref={pointsRef} geometry={geo} material={pointsMat} />
      <lineSegments ref={wireRef} geometry={edges} material={wireMat} />
      <mesh geometry={geo} material={solidMat} />
      {/* equatorial ring — a manufactured detail so the silhouette never reads as a bare sphere */}
      <mesh material={ringMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.28, 0.02, 8, 96]} />
      </mesh>
    </group>
  )
}
