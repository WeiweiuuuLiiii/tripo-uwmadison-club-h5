import { useGLTF } from '@react-three/drei'

const BASE = import.meta.env.BASE_URL

/**
 * Real, licensed, textured GLB assets (meshopt-compressed, WebP textures).
 * See README for per-asset source + license. These are actual PBR meshes with
 * normal maps and lighting response — not primitives.
 */
export const MODELS = {
  helmet: `${BASE}models/DamagedHelmet.glb`, // sci-fi hero (CC BY 4.0)
  robot: `${BASE}models/RobotExpressive.glb`, // animated character (CC0)
  city: `${BASE}models/LittlestTokyo.glb`, // animated environment scene (CC BY 4.0)
  ferrari: `${BASE}models/ferrari.glb`, // vehicle (CC via three.js examples)
  toycar: `${BASE}models/ToyCar.glb`, // detailed product/vehicle (CC0)
  fox: `${BASE}models/Fox.glb`, // animated character (CC0)
  lantern: `${BASE}models/Lantern.glb`, // textured prop + base (CC BY 4.0)
} as const

export type ModelKey = keyof typeof MODELS

export function preloadCore() {
  // hero + first environment first; the rest stream via per-zone Suspense
  useGLTF.preload(MODELS.helmet)
  useGLTF.preload(MODELS.robot)
  useGLTF.preload(MODELS.city)
}
