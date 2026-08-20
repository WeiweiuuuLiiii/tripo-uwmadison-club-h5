import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { readFileSync } from 'fs'

const BASEURL = 'http://localhost:4173/tripo-uwmadison-club-h5'
const HDR = `${BASEURL}/env/studio_1k.hdr`
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// which real GLB fills each replaced image slot, plus framing
const JOBS = [
  { out: 'gallery.webp', model: 'DamagedHelmet.glb', w: 1600, h: 1600, yaw: 0.8, pitch: 0.35, dist: 2.0 },
  { out: 'workflow.webp', model: 'RobotExpressive.glb', w: 1600, h: 1600, yaw: 0.7, pitch: 0.3, dist: 2.15, anim: 'Idle' },
  { out: 'roadmap.webp', model: 'ferrari.glb', w: 1600, h: 1200, yaw: 1.1, pitch: 0.28, dist: 2.0 },
  { out: 'career.webp', model: 'ToyCar.glb', w: 1600, h: 1200, yaw: 1.0, pitch: 0.4, dist: 2.0 },
  { out: 'demo.webp', model: 'LittlestTokyo.glb', w: 1600, h: 1000, yaw: 0.9, pitch: 0.55, dist: 2.4 },
]

const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist', '--enable-webgl'] })
for (const j of JOBS) {
  const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 })
  const url = `${BASEURL}/glb-render.html?model=${BASEURL}/models/${j.model}&hdr=${HDR}&w=${j.w}&h=${j.h}&yaw=${j.yaw}&pitch=${j.pitch}&dist=${j.dist}${j.anim ? `&anim=${j.anim}` : ''}`
  await p.goto(url, { waitUntil: 'load' })
  try {
    await p.waitForFunction(() => window.__done === true || window.__err, { timeout: 30000 })
  } catch {
    /* fallthrough */
  }
  const err = await p.evaluate(() => window.__err || null)
  if (err) { console.log(`${j.out} ERROR: ${err}`); await p.close(); continue }
  const png = await p.locator('#c').screenshot({ path: `/tmp/render_${j.out}.png` })
  void png
  await sharp(`/tmp/render_${j.out}.png`).webp({ quality: 82 }).toFile(`public/img/${j.out}`)
  const kb = (readFileSync(`public/img/${j.out}`).length / 1024).toFixed(0)
  console.log(`${j.out}  <- ${j.model}  ${j.w}x${j.h}  ${kb}KB`)
  await p.close()
}
await b.close()
console.log('done')
