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
  expandedZone: string | null // which HUD card is expanded (null = none)
  gyroOn: boolean
  setZone: (i: number) => void
  setReady: (v: boolean) => void
  setExpanded: (id: string | null) => void
  setGyroOn: (v: boolean) => void
}

export const useJourney = create<JourneyStore>((set) => ({
  zoneIndex: 0,
  ready: false,
  expandedZone: null,
  gyroOn: false,
  setZone: (i) => set((s) => (s.zoneIndex === i ? s : { zoneIndex: i })),
  setReady: (v) => set((s) => (s.ready === v ? s : { ready: v })),
  setExpanded: (id) => set((s) => (s.expandedZone === id ? s : { expandedZone: id })),
  setGyroOn: (v) => set((s) => (s.gyroOn === v ? s : { gyroOn: v })),
}))

// per-frame mutable state (no React re-render); written by Rig/gyro, read in useFrame
export const frame = {
  offset: 0, // 0..1 raw scroll progress
  reveal: 0, // 0..1 hero generation (point-cloud → wireframe → textured)
  dragYaw: 0, // clamped radians, finger look-around
  dragPitch: 0,
  gyroYaw: 0, // clamped radians, device-orientation look
  gyroPitch: 0,
  gyroGain: 1, // 1 normal, reduced when a card is expanded / near QR
  reducedMotion: false, // calms spins/particles; the 3D world still runs
  locked: false, // outer scroll frozen (card expanded) → hold camera in this zone
}
