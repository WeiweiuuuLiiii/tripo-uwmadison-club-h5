import * as THREE from 'three'

/**
 * The guided rail. Seven zones sit along -Z; the camera dollies forward through
 * them. The rail parameter comes from real DOM section positions (see
 * sectionRail), so the camera dwells on a zone while you read its (possibly
 * expanded) card and eases to the next as that section arrives.
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

/**
 * Hero "generation" reveal for zone 02 (CORE, section index 1 → rail param ≈ 1/6):
 * 0 = exploded point cloud, 0.5 = wireframe mesh, 1 = fully textured. The rail
 * param `u` comes from real DOM section positions (see sectionRail).
 */
export function heroReveal(u: number): number {
  return smooth(THREE.MathUtils.clamp((u - 0.06) / (0.2 - 0.06), 0, 1))
}
