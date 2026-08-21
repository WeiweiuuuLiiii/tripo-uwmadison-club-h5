import { create } from 'zustand'

/**
 * Two channels of journey state:
 *  - `useJourney` (zustand) holds the LOW-FREQUENCY active-section index + a
 *    "world ready" flag that React overlays (the progress rail) subscribe to.
 *  - `frame` is a plain mutable object written by the Rig every animation frame
 *    (camera progress, hero reveal, desktop drag). Nothing React subscribes to
 *    it, so 60fps writes cause ZERO re-renders.
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

// per-frame mutable state (no React re-render); written by the Rig, read in useFrame
export const frame = {
  offset: 0, // 0..1 camera progress along the rail (from real DOM section positions)
  reveal: 0, // 0..1 hero generation (point-cloud → wireframe → textured)
  dragYaw: 0, // desktop mouse-drag look only (never touch)
  dragPitch: 0,
  reducedMotion: false, // calms spins/particles; the 3D world still runs
}
