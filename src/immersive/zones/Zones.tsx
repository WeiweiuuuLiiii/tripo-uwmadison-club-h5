import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ZONES } from '../rail'
import { frame } from '../store'
import { HeroModel } from '../hero/HeroModel'
import { FrameRect, Halo, HoloPanel, VolumeCone } from './primitives'

const A = (i: number) => ZONES[i].anchor

/** 01 · PORTAL — concentric gate rings the camera flies through. */
function ZonePortal() {
  const g = useRef<THREE.Group>(null)
  useFrame((_, d) => {
    if (g.current) g.current.rotation.z += Math.min(d, 0.05) * 0.12
  })
  return (
    <group position={A(0)}>
      <group ref={g}>
        <Halo radius={2.6} tube={0.03} opacity={0.55} rotation={[0, 0, 0]} />
        <Halo radius={3.4} tube={0.02} opacity={0.32} rotation={[0, 0, 0]} color="#aeb7c0" />
        <Halo radius={4.4} tube={0.015} opacity={0.18} rotation={[0, 0, 0]} color="#aeb7c0" />
      </group>
      <mesh>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#6ee7ff" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/** 02 · GENERATION CORE — the hero generates on a lit pedestal. */
function ZoneCore() {
  return (
    <group position={A(1)}>
      <HeroModel mode="generate" position={[0, 1.7, 0]} scale={1.35} spin={0.28} />
      <Halo radius={1.7} tube={0.02} opacity={0.6} position={[0, 0.05, 0]} />
      <Halo radius={2.3} tube={0.012} opacity={0.28} position={[0, 0.05, 0]} color="#aeb7c0" />
      <VolumeCone position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]} height={5} radius={1.9} opacity={0.05} />
    </group>
  )
}

/** 03 · THE PIPELINE — 5 workstation gates; a model flies station→station. */
function ZonePipeline() {
  const fly = useRef<THREE.Group>(null)
  const gates = useMemo(() => [-4.4, -2.2, 0, 2.2, 4.4], [])
  useFrame(() => {
    // sub-progress across this zone drives the model along the line of gates
    const p = THREE.MathUtils.clamp((frame.offset - 0.29) / (0.43 - 0.29), 0, 1)
    if (fly.current) {
      fly.current.position.x = THREE.MathUtils.lerp(-4.4, 4.4, p)
      fly.current.position.z = -0.2
    }
  })
  return (
    <group position={A(2)}>
      <group position={[0, 1.4, 0]}>
        {gates.map((x, i) => (
          <group key={i} position={[x, 0, i % 2 ? -0.6 : 0.2]}>
            <FrameRect w={1.7} h={2.4} color={i === 1 ? '#6ee7ff' : '#aeb7c0'} opacity={i === 1 ? 0.75 : 0.4} />
            <Halo radius={0.9} tube={0.012} opacity={0.35} position={[0, -1.4, 0]} />
          </group>
        ))}
        <group ref={fly}>
          <HeroModel mode="solid" scale={0.55} spin={0.9} />
        </group>
      </group>
    </group>
  )
}

/** 04 · PROJECT LAB — two spatial layers of holographic workbenches. */
function ZoneLab() {
  return (
    <group position={A(3)}>
      {/* CORE — near, precise */}
      <HoloPanel w={2.4} h={1.5} position={[-2.4, 0.3, 1.6]} rotation={[0, 0.5, 0]} edge="#6ee7ff" faceOpacity={0.36} />
      <HoloPanel w={2.4} h={1.5} position={[0, 0.6, 2.0]} edge="#6ee7ff" faceOpacity={0.36} />
      <HoloPanel w={2.4} h={1.5} position={[2.4, 0.3, 1.6]} rotation={[0, -0.5, 0]} edge="#6ee7ff" faceOpacity={0.36} />
      {/* OPEN — far, open, brighter/airier */}
      <HoloPanel w={2.0} h={1.2} position={[-3.2, 1.6, -2.2]} rotation={[0, 0.4, 0]} edge="#aeb7c0" faceOpacity={0.2} />
      <HoloPanel w={2.0} h={1.2} position={[0, 1.9, -2.6]} edge="#aeb7c0" faceOpacity={0.2} />
      <HoloPanel w={2.0} h={1.2} position={[3.2, 1.6, -2.2]} rotation={[0, -0.4, 0]} edge="#aeb7c0" faceOpacity={0.2} />
    </group>
  )
}

/** 05 · SEMESTER JOURNEY — a glowing track whose 6 nodes light up in sequence. */
function ZoneJourney() {
  const dots = useRef<Array<THREE.Mesh | null>>([])
  const xs = useMemo(() => [-5, -3, -1, 1, 3, 5], [])
  useFrame(() => {
    const p = THREE.MathUtils.clamp((frame.offset - 0.57) / (0.71 - 0.57), 0, 1) * 6
    dots.current.forEach((m, i) => {
      if (!m) return
      const lit = p > i + 0.5
      const mat = m.material as THREE.MeshBasicMaterial
      mat.color.set(lit ? '#6ee7ff' : '#59636d')
      mat.opacity = lit ? 1 : 0.5
    })
  })
  return (
    <group position={A(4)}>
      <group position={[0, 1.3, 0]}>
        {/* track */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 10.4, 6]} />
          <meshBasicMaterial color="#3a4550" transparent opacity={0.6} />
        </mesh>
        {xs.map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh ref={(el) => (dots.current[i] = el)}>
              <icosahedronGeometry args={[0.16, 1]} />
              <meshBasicMaterial color="#59636d" transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
        {/* an evolving model travelling alongside the timeline */}
        <HeroModel mode="solid" position={[0, 1.4, 0]} scale={0.5} spin={0.5} />
      </group>
    </group>
  )
}

/** 06 · OPPORTUNITY DECK — a data cockpit: resources L, deliverables R, career front. */
function ZoneDeck() {
  return (
    <group position={A(5)}>
      <HoloPanel w={2.0} h={1.5} position={[-2.7, 1.9, 0.6]} rotation={[0, 0.6, 0]} edge="#aeb7c0" faceOpacity={0.34} />
      <HoloPanel w={2.0} h={1.5} position={[-2.9, 0.3, 0.4]} rotation={[0, 0.6, 0]} edge="#aeb7c0" faceOpacity={0.28} />
      <HoloPanel w={2.0} h={1.5} position={[2.7, 1.9, 0.6]} rotation={[0, -0.6, 0]} edge="#6ee7ff" faceOpacity={0.34} />
      <HoloPanel w={2.0} h={1.5} position={[2.9, 0.3, 0.4]} rotation={[0, -0.6, 0]} edge="#6ee7ff" faceOpacity={0.28} />
      <HoloPanel w={2.6} h={1.4} position={[0, 1.6, 1.8]} edge="#6ee7ff" faceOpacity={0.3} />
      <VolumeCone position={[0, 4.6, 0]} height={6} radius={2.6} opacity={0.04} />
    </group>
  )
}

/** 07 · JOIN — a demo-day stage with a running hero scene behind the QR. */
function ZoneJoin() {
  return (
    <group position={A(6)}>
      <FrameRect w={6.4} h={3.6} color="#aeb7c0" opacity={0.4} position={[0, 1.8, -1.4]} />
      <HeroModel mode="solid" position={[0, 1.7, 0]} scale={1.15} spin={0.6} />
      <Halo radius={1.9} tube={0.02} opacity={0.6} position={[0, 0.1, 0]} />
      <VolumeCone position={[0, 4.8, 0]} height={6.5} radius={2.4} opacity={0.05} />
      <VolumeCone position={[-2.2, 4.4, 0]} height={6} radius={1.4} opacity={0.035} rotation={[0, 0, 0.18]} />
      <VolumeCone position={[2.2, 4.4, 0]} height={6} radius={1.4} opacity={0.035} rotation={[0, 0, -0.18]} />
    </group>
  )
}

/** All zones mounted persistently (content is tiny); only the ACTIVE zone's
 *  per-frame work matters and stays cheap. No unmount = no dispose/pop-in bugs. */
export function ZoneField() {
  return (
    <>
      <ZonePortal />
      <ZoneCore />
      <ZonePipeline />
      <ZoneLab />
      <ZoneJourney />
      <ZoneDeck />
      <ZoneJoin />
    </>
  )
}
