import * as THREE from 'three'

/**
 * The guided rail. Seven zones sit along -Z; the camera dollies forward through
 * them. `railU(offset)` reparametrises raw scroll so the camera SLOWS near each
 * zone (a dwell plateau) and speeds through the gaps — that's what makes pure,
 * tap-free scrolling land every panel centred, then move on.
 */

export type Zone = {
  id: string
  name: string
  cn: string
  anchor: [number, number, number] // where the 3D content for this zone lives
  camPos: [number, number, number] // camera resting point for this zone
  look: [number, number, number] // gaze target (authored, not tangent-locked)
}

export const ZONES: Zone[] = [
  { id: '01', name: 'PORTAL', cn: '入口', anchor: [0, 0, 0], camPos: [0, 0.9, 15], look: [0, 0.5, 0] },
  { id: '02', name: 'GENERATION CORE', cn: '生成核心', anchor: [0, 0, -16], camPos: [0, 1.5, -5.5], look: [0, 1.4, -16] },
  { id: '03', name: 'THE PIPELINE', cn: '创作管线', anchor: [0, 0, -34], camPos: [-3.2, 1.7, -24], look: [0.4, 1.4, -34] },
  { id: '04', name: 'PROJECT LAB', cn: '项目实验室', anchor: [0, 0, -52], camPos: [3.2, 1.9, -42], look: [-0.5, 1.5, -52] },
  { id: '05', name: 'SEMESTER JOURNEY', cn: '学期轨道', anchor: [0, 0, -70], camPos: [-3.0, 1.8, -60], look: [0.5, 1.4, -70] },
  { id: '06', name: 'OPPORTUNITY DECK', cn: '资源与职业', anchor: [0, 0, -88], camPos: [2.6, 1.9, -78], look: [-0.4, 1.5, -88] },
  { id: '07', name: 'JOIN THE WORLD', cn: '加入', anchor: [0, 0, -106], camPos: [0, 1.5, -96], look: [0, 1.4, -106] },
]

const N = ZONES.length // 7 nodes
const SEG = N - 1 // 6 segments

export const pathCurve = new THREE.CatmullRomCurve3(
  ZONES.map((z) => new THREE.Vector3(...z.camPos)),
  false,
  'catmullrom',
  0.5,
)
export const lookCurve = new THREE.CatmullRomCurve3(
  ZONES.map((z) => new THREE.Vector3(...z.look)),
  false,
  'catmullrom',
  0.5,
)

const smooth = (t: number) => t * t * (3 - 2 * t) // smoothstep

// The page has N stacked HTML sections; section i is centred at scroll offset
// (i+0.5)/N. We want camera node i to land exactly at that offset, with a dwell
// plateau there, so a reader who just scrolls through section i sees zone i.
const nodeOffset = (i: number) => (i + 0.5) / N

/** document scroll offset (0..1) → curve param (0..1) with a dwell per zone. */
export function railU(offset: number): number {
  const o = THREE.MathUtils.clamp(offset, 0, 1)
  if (o <= nodeOffset(0)) return 0
  if (o >= nodeOffset(N - 1)) return 1
  const x = o * N - 0.5 // maps nodeOffset(i) → i
  const i = Math.min(SEG - 1, Math.floor(x))
  const f = x - i
  return (i + smooth(f)) / SEG
}

/** active zone / section index for the overlay + progress rail. */
export function zoneOf(offset: number): number {
  return Math.max(0, Math.min(N - 1, Math.floor(THREE.MathUtils.clamp(offset, 0, 1) * N)))
}

/**
 * Hero "generation" reveal for zone 02: 0 = exploded point cloud, 0.5 = wireframe
 * mesh, 1 = fully textured. Spans the approach into and just past the CORE node.
 */
export function heroReveal(offset: number): number {
  return smooth(THREE.MathUtils.clamp((offset - 0.11) / (0.31 - 0.11), 0, 1))
}

/**
 * Per-zone gyro tuning. The normalised look signal (frame.gyroX/gyroY ∈ -1..1) is
 * mapped to camera POSITION + LOOK-AT offsets (parallax) plus a little extra
 * angular look, so each zone reveals its space differently. yaw/pitch in radians;
 * pos* in world units; look = how much the look-at target follows (orbit vs pan).
 */
export type GyroCfg = { yaw: number; pitch: number; posX: number; posY: number; posZ: number; look: number }
const d = THREE.MathUtils.degToRad
export const GYRO: GyroCfg[] = [
  { yaw: d(20), pitch: d(11), posX: 1.15, posY: 0.5, posZ: 0.28, look: 0.5 }, // 01 Portal — strong lateral
  { yaw: d(16), pitch: d(12), posX: 0.95, posY: 0.62, posZ: 0.22, look: 0.16 }, // 02 Core — orbit the helmet
  { yaw: d(20), pitch: d(10), posX: 1.15, posY: 0.46, posZ: 0.16, look: 0.55 }, // 03 Pipeline — enhanced lateral
  { yaw: d(18), pitch: d(12), posX: 1.05, posY: 0.62, posZ: 0.22, look: 0.36 }, // 04 Lab — foreground occlusion
  { yaw: d(18), pitch: d(11), posX: 1.0, posY: 0.52, posZ: 0.2, look: 0.42 }, // 05 Journey — diagonal parallax
  { yaw: d(19), pitch: d(12), posX: 1.0, posY: 0.55, posZ: 0.2, look: 0.32 }, // 06 Deck — cockpit look-around
  { yaw: d(20), pitch: d(13), posX: 1.1, posY: 0.66, posZ: 0.3, look: 0.5 }, // 07 Join — explore the city (bounded)
]
