import { useMemo } from 'react'
import * as THREE from 'three'

const ICE = '#6ee7ff'
const SILVER = '#aeb7c0'

/** A glowing rectangular frame (portal gate / workstation arch / screen bezel). */
export function FrameRect({
  w = 2,
  h = 2.6,
  color = ICE,
  opacity = 0.7,
  position,
  rotation,
}: {
  w?: number
  h?: number
  color?: string
  opacity?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), [w, h])
  return (
    <lineSegments geometry={geo} position={position} rotation={rotation}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  )
}

/** A frosted holographic panel: dark translucent face + a bright edge frame. */
export function HoloPanel({
  w = 2.2,
  h = 1.4,
  position,
  rotation,
  tint = '#0c1116',
  edge = SILVER,
  faceOpacity = 0.32,
}: {
  w?: number
  h?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  tint?: string
  edge?: string
  faceOpacity?: number
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={tint} transparent opacity={faceOpacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <FrameRect w={w} h={h} color={edge} opacity={0.55} />
    </group>
  )
}

/** Emissive node marker used on the semester track. `lit` brightens it. */
export function NodeDot({
  position,
  lit = false,
  scale = 1,
}: {
  position?: [number, number, number]
  lit?: boolean
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <icosahedronGeometry args={[0.14, 1]} />
        <meshBasicMaterial color={lit ? ICE : '#59636d'} transparent opacity={lit ? 1 : 0.55} />
      </mesh>
      {lit && (
        <mesh>
          <icosahedronGeometry args={[0.26, 1]} />
          <meshBasicMaterial color={ICE} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/** Cheap volumetric key light — an additive translucent cone. No real shadows. */
export function VolumeCone({
  position,
  rotation,
  height = 6,
  radius = 2.2,
  color = ICE,
  opacity = 0.06,
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  height?: number
  radius?: number
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[radius, height, 24, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/** A thin luminous ring (pedestal halo / portal accent). */
export function Halo({
  radius = 1.4,
  tube = 0.02,
  color = ICE,
  opacity = 0.7,
  position,
  rotation = [Math.PI / 2, 0, 0],
}: {
  radius?: number
  tube?: number
  color?: string
  opacity?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <torusGeometry args={[radius, tube, 8, 80]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}
