import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ZONES } from '../rail'
import { frame } from '../store'
import { MODELS } from '../models'
import { Model } from '../Model'
import { GenHero } from '../hero/GenHero'
import { FrameRect, Halo, HoloPanel, VolumeCone } from './primitives'

const A = (i: number) => ZONES[i].anchor

/** A lit pedestal any real model can stand on. */
function Pedestal({ position, r = 1.1 }: { position?: [number, number, number]; r?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[r, r * 1.15, 0.16, 40]} />
        <meshStandardMaterial color="#161b20" metalness={0.85} roughness={0.3} />
      </mesh>
      <Halo radius={r + 0.05} tube={0.015} opacity={0.7} position={[0, 0.02, 0]} />
      <Halo radius={r + 0.4} tube={0.008} opacity={0.3} position={[0, 0.02, 0]} color="#aeb7c0" />
    </group>
  )
}

/** Long reflective floor + emissive grid running the length of the journey — the
 *  ground plane that gives the world depth and catches the HDRI reflections. */
export function WorldFloor() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(320, 90, new THREE.Color('#46525e'), new THREE.Color('#1c232a'))
    const apply = (m: THREE.Material) => {
      m.transparent = true
      m.opacity = 0.32
      m.depthWrite = false
    }
    const mm = g.material as THREE.Material | THREE.Material[]
    Array.isArray(mm) ? mm.forEach(apply) : apply(mm)
    return g
  }, [])
  return (
    <group position={[0, -2.2, -48]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 320]} />
        <meshStandardMaterial color="#0c1014" metalness={0.9} roughness={0.42} />
      </mesh>
      <primitive object={grid} position={[0, 0.02, 0]} />
    </group>
  )
}

/** 01 · PORTAL — a real gateway; the corridor + first models are visible beyond,
 *  and the camera flies THROUGH it into the world (parallax against the floor). */
function ZonePortal() {
  const ring = useRef<THREE.Group>(null)
  useFrame((_, d) => {
    if (ring.current && !frame.reducedMotion) ring.current.rotation.z += Math.min(d, 0.05) * 0.1
  })
  return (
    <group position={A(0)}>
      {/* structural arch */}
      <mesh position={[0, 1.4, 0]}>
        <torusGeometry args={[3.1, 0.14, 16, 64]} />
        <meshStandardMaterial color="#232a31" metalness={0.9} roughness={0.35} emissive="#0a2a33" emissiveIntensity={0.4} />
      </mesh>
      <group ref={ring} position={[0, 1.4, 0]}>
        <Halo radius={2.7} tube={0.03} opacity={0.6} rotation={[0, 0, 0]} />
        <Halo radius={3.5} tube={0.015} opacity={0.28} rotation={[0, 0, 0]} color="#aeb7c0" />
      </group>
      {/* side pylons for a real doorway read */}
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.4, 5.2, 0.4]} />
          <meshStandardMaterial color="#1b2127" metalness={0.85} roughness={0.4} emissive="#08222a" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <VolumeCone position={[0, 5, -1]} height={7} radius={2.4} opacity={0.05} />
    </group>
  )
}

/** 02 · GENERATION CORE — the real DamagedHelmet generates on a lit pedestal. */
function ZoneCore() {
  return (
    <group position={A(1)}>
      <Suspense fallback={null}>
        <GenHero mode="generate" position={[0, 1.7, 0]} scale={1.15} spin={0.28} />
      </Suspense>
      <Pedestal position={[0, 0.0, 0]} r={1.15} />
      <VolumeCone position={[0, 4.6, 0]} height={6} radius={1.9} opacity={0.05} />
    </group>
  )
}

/** 03 · PIPELINE — real assets on a row of workstations the camera dollies past. */
function ZonePipeline() {
  const stations: Array<{ x: number; url: string; fit: number; y: number; spin: number; anim?: string }> = [
    { x: -5.4, url: MODELS.helmet, fit: 1.5, y: 1.5, spin: 0.5 },
    { x: -2.7, url: MODELS.robot, fit: 2.0, y: 0.7, spin: 0, anim: 'Idle' },
    { x: 0, url: MODELS.toycar, fit: 1.9, y: 1.4, spin: 0.6 },
    { x: 2.7, url: MODELS.ferrari, fit: 2.2, y: 1.4, spin: 0.5 },
    { x: 5.4, url: MODELS.fox, fit: 1.7, y: 0.9, spin: 0, anim: 'Survey' },
  ]
  return (
    <group position={A(2)}>
      {stations.map((s, i) => (
        <group key={i} position={[s.x, 0, i % 2 ? -0.8 : 0.4]}>
          <Suspense fallback={null}>
            <Model url={s.url} fit={s.fit} position={[0, s.y, 0]} spin={s.spin} animation={s.anim} float={s.spin ? 0.05 : 0} />
          </Suspense>
          <Pedestal position={[0, s.y - 0.9, 0]} r={0.85} />
          <FrameRect w={1.9} h={2.7} color={i === 1 ? '#6ee7ff' : '#5f6a74'} opacity={i === 1 ? 0.6 : 0.28} position={[0, 1.4, -0.7]} />
        </group>
      ))}
    </group>
  )
}

/** 04 · PROJECT LAB — a lab of workbenches, each previewing a real model. */
function ZoneLab() {
  const benches: Array<{ p: [number, number, number]; url: string; fit: number; spin: number; anim?: string }> = [
    { p: [-3.0, 0.9, 1.6], url: MODELS.robot, fit: 1.9, spin: 0, anim: 'Wave' },
    { p: [0, 0.9, 2.2], url: MODELS.helmet, fit: 1.5, spin: 0.5 },
    { p: [3.0, 0.9, 1.6], url: MODELS.lantern, fit: 1.9, spin: 0.3 },
    { p: [-2.2, 1.7, -2.4], url: MODELS.toycar, fit: 1.5, spin: 0.6 },
    { p: [2.2, 1.7, -2.4], url: MODELS.fox, fit: 1.4, spin: 0, anim: 'Walk' },
  ]
  return (
    <group position={A(3)}>
      {benches.map((b, i) => (
        <group key={i} position={b.p}>
          <Suspense fallback={null}>
            <Model url={b.url} fit={b.fit} spin={b.spin} animation={b.anim} float={0.04} />
          </Suspense>
          <Pedestal position={[0, -0.75, 0]} r={0.7} />
          <HoloPanel w={1.9} h={1.3} position={[0, 0, -0.5]} edge={i === 1 ? '#6ee7ff' : '#8b96a0'} faceOpacity={0.14} />
        </group>
      ))}
    </group>
  )
}

/** 05 · SEMESTER JOURNEY — a glowing track; real assets mark concept→final. */
function ZoneJourney() {
  const dots = useRef<Array<THREE.Mesh | null>>([])
  const xs = useMemo(() => [-6, -3.6, -1.2, 1.2, 3.6, 6], [])
  const marks: Array<{ x: number; url: string; fit: number; anim?: string }> = [
    { x: -4.8, url: MODELS.helmet, fit: 1.4 },
    { x: -1.2, url: MODELS.robot, fit: 1.8, anim: 'Idle' },
    { x: 2.4, url: MODELS.ferrari, fit: 1.9 },
    { x: 6, url: MODELS.city, fit: 3.2 },
  ]
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
      <group position={[0, 0.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 13, 8]} />
          <meshBasicMaterial color="#46525e" transparent opacity={0.7} />
        </mesh>
        {xs.map((x, i) => (
          <mesh key={i} ref={(el) => (dots.current[i] = el)} position={[x, 0, 0]}>
            <icosahedronGeometry args={[0.18, 1]} />
            <meshBasicMaterial color="#59636d" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      {marks.map((m, i) => (
        <group key={i} position={[m.x, 1.5, -0.4]}>
          <Suspense fallback={null}>
            <Model url={m.url} fit={m.fit} spin={m.url === MODELS.city ? 0 : 0.4} animation={m.anim} float={0.05} />
          </Suspense>
        </group>
      ))}
    </group>
  )
}

/** 06 · OPPORTUNITY DECK — a data cockpit: screens + a real model as the core. */
function ZoneDeck() {
  return (
    <group position={A(5)}>
      <Suspense fallback={null}>
        <Model url={MODELS.robot} fit={2.3} position={[0, 0.7, 0]} animation="ThumbsUp" float={0.05} />
      </Suspense>
      <Pedestal position={[0, -0.1, 0]} r={1.0} />
      <HoloPanel w={2.0} h={1.5} position={[-3.0, 1.9, 0.4]} rotation={[0, 0.6, 0]} edge="#8b96a0" faceOpacity={0.2} />
      <HoloPanel w={2.0} h={1.5} position={[-3.1, 0.2, 0.2]} rotation={[0, 0.6, 0]} edge="#8b96a0" faceOpacity={0.16} />
      <HoloPanel w={2.0} h={1.5} position={[3.0, 1.9, 0.4]} rotation={[0, -0.6, 0]} edge="#6ee7ff" faceOpacity={0.2} />
      <HoloPanel w={2.0} h={1.5} position={[3.1, 0.2, 0.2]} rotation={[0, -0.6, 0]} edge="#6ee7ff" faceOpacity={0.16} />
      <VolumeCone position={[0, 5, 0]} height={6} radius={2.6} opacity={0.04} />
    </group>
  )
}

/** 07 · JOIN — a real animated city "digital world" on the demo stage. */
function ZoneJoin() {
  return (
    <group position={A(6)}>
      <Suspense fallback={null}>
        <Model url={MODELS.city} fit={7.5} position={[0, 0.4, -2]} float={0} />
      </Suspense>
      <Suspense fallback={null}>
        <Model url={MODELS.robot} fit={2.6} position={[-2.6, 0.2, 1.2]} rotation={[0, 0.5, 0]} animation="Dance" />
      </Suspense>
      <FrameRect w={8} h={4.2} color="#8b96a0" opacity={0.3} position={[0, 2.4, -4]} />
      <VolumeCone position={[0, 6, -1]} height={7} radius={3} opacity={0.05} />
      <VolumeCone position={[-3, 5.5, 0]} height={6} radius={1.4} opacity={0.035} rotation={[0, 0, 0.2]} />
      <VolumeCone position={[3, 5.5, 0]} height={6} radius={1.4} opacity={0.035} rotation={[0, 0, -0.2]} />
    </group>
  )
}

export function ZoneField() {
  return (
    <>
      <WorldFloor />
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
