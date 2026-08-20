import * as THREE from 'three'

/**
 * Everything the hero needs, generated procedurally in-code (no network, no
 * files) so it always ships and always loads inside WeChat. One shared geometry
 * feeds three synchronized render states (points / wireframe / textured) and is
 * reused across zones, so it is a module singleton kept alive for the app.
 */

// deterministic layered-trig "noise" — gives the icosphere a machined, faceted
// surface instead of a smooth ball, so its silhouette reads as a built artifact.
function displace(x: number, y: number, z: number): number {
  let n = Math.sin(x * 2.1 + y * 1.7) * Math.cos(z * 1.9)
  n += 0.5 * Math.sin(x * 4.3 - z * 3.7 + 1.3) * Math.cos(y * 3.1)
  n += 0.28 * Math.sin(y * 7.9 + z * 6.1 + 2.2)
  // faint faceting bands so panels/greeble read around the equator
  n += 0.18 * Math.cos((x + y + z) * 5.5)
  return n / 1.9
}

let _geo: THREE.BufferGeometry | null = null
export function heroGeometry(): THREE.BufferGeometry {
  if (_geo) return _geo
  const g = new THREE.IcosahedronGeometry(1, 4) // ~2562 verts, dense enough for a point cloud
  const pos = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const scatter = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const d = 1 + displace(v.x, v.y, v.z) * 0.26
    v.multiplyScalar(d)
    pos.setXYZ(i, v.x, v.y, v.z)
    // per-vertex outward direction used to "explode" the point cloud pre-reveal
    const s = 0.6 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 1.6
    scatter[i * 3] = v.x * s
    scatter[i * 3 + 1] = v.y * s
    scatter[i * 3 + 2] = v.z * s
  }
  pos.needsUpdate = true
  g.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3))
  g.computeVertexNormals()
  _geo = g
  return g
}

let _edges: THREE.BufferGeometry | null = null
export function heroEdges(): THREE.BufferGeometry {
  if (_edges) return _edges
  _edges = new THREE.EdgesGeometry(heroGeometry(), 18) // facet edges → clean topological wireframe
  return _edges
}

let _matcap: THREE.Texture | null = null
export function titaniumMatcap(): THREE.Texture {
  if (_matcap) return _matcap
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  g.fillStyle = '#05070a'
  g.fillRect(0, 0, s, s)
  const grad = g.createRadialGradient(s * 0.36, s * 0.3, s * 0.02, s * 0.5, s * 0.5, s * 0.5)
  grad.addColorStop(0, '#f6f9fc')
  grad.addColorStop(0.16, '#cdd4dc')
  grad.addColorStop(0.44, '#828b93')
  grad.addColorStop(0.72, '#3b414a')
  grad.addColorStop(1, '#0a0d11')
  g.fillStyle = grad
  g.beginPath()
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
  g.fill()
  // cool ice rim, lower-right crescent
  const rim = g.createRadialGradient(s * 0.72, s * 0.76, s * 0.3, s * 0.72, s * 0.76, s * 0.52)
  rim.addColorStop(0, 'rgba(110,231,255,0)')
  rim.addColorStop(0.82, 'rgba(110,231,255,0)')
  rim.addColorStop(1, 'rgba(150,236,255,0.55)')
  g.globalCompositeOperation = 'lighter'
  g.fillStyle = rim
  g.beginPath()
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
  g.fill()
  g.globalCompositeOperation = 'source-over'
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  _matcap = tex
  return tex
}

let _disc: THREE.Texture | null = null
export function pointSprite(): THREE.Texture {
  if (_disc) return _disc
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.4, 'rgba(232,238,244,0.85)')
  grad.addColorStop(1, 'rgba(232,238,244,0)')
  g.fillStyle = grad
  g.beginPath()
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
  g.fill()
  _disc = new THREE.CanvasTexture(c)
  return _disc
}

// singletons protected from disposal when zones unmount
export const HERO_KEEP = new Set<unknown>()
export function primeHeroKeep() {
  HERO_KEEP.add(heroGeometry())
  HERO_KEEP.add(heroEdges())
  HERO_KEEP.add(titaniumMatcap())
  HERO_KEEP.add(pointSprite())
}
