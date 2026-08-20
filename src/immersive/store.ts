import { create } from 'zustand'

/**
 * Two channels of journey state, on purpose:
 *
 *  - `useJourney` (zustand) holds only LOW-FREQUENCY values that React overlays
 *    care about: the active zone index and a "world ready" flag. These change a
 *    handful of times over the whole scroll, so subscribing is cheap.
 *
 *  - `frame` is a plain mutable object written by the Rig every animation frame
 *    (camera offset, per-zone local progress, hero generation reveal, drag look).
 *    Nothing React subscribes to it, so 60fps writes cause ZERO re-renders — the
 *    3D meshes and the progress rail read it directly inside their own rAF loops.
 */

export type JourneyStore = {
  zoneIndex: number
  ready: boolean
  setZone: (i: number) => void
  setReady: (v: boolean) => void
}

export const useJourney = create<JourneyStore>((set) => ({
  zoneIndex: 0,
  ready: false,
  setZone: (i) => set((s) => (s.zoneIndex === i ? s : { zoneIndex: i })),
  setReady: (v) => set((s) => (s.ready === v ? s : { ready: v })),
}))

export const frame = {
  offset: 0, // 0..1 raw scroll progress
  reveal: 0, // 0..1 hero generation (point-cloud → wireframe → textured)
  dragYaw: 0, // clamped radians, look-around
  dragPitch: 0,
  reducedMotion: false, // calms spins/particles; the 3D world still runs
}
