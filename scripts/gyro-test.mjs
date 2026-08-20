import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
p.on('pageerror', (e) => errors.push('PE:' + e.message))
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(8000)

// scroll to a zone with clear near/far parallax (pipeline)
await p.evaluate(() => document.getElementById('z03')?.scrollIntoView({ block: 'center' }))
await p.waitForTimeout(800)

const hasBtn = await p.evaluate(() => !!document.querySelector('.gyro-btn'))
const doeExists = await p.evaluate(() => 'DeviceOrientationEvent' in window)
console.log('gyro button present:', hasBtn, '| DeviceOrientationEvent:', doeExists)
if (hasBtn) await p.evaluate(() => document.querySelector('.gyro-btn')?.click())
await p.waitForTimeout(400)

const fire = (beta, gamma) =>
  p.evaluate(
    ([beta, gamma]) => {
      const e = new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta, gamma, absolute: false })
      window.dispatchEvent(e)
    },
    [beta, gamma],
  )

// first event = zero reference
await fire(0, 0)
await p.waitForTimeout(300)
// overlay reference position (must NOT move with the phone)
const overlayBefore = await p.evaluate(() => {
  const el = document.querySelector('#z03 .hud-head')
  const r = el.getBoundingClientRect()
  return { x: Math.round(r.left), y: Math.round(r.top) }
})

// tilt right (gamma +22) → look right
for (let i = 0; i < 12; i++) { await fire(0, 22); await p.waitForTimeout(30) }
await p.waitForTimeout(500)
const shotRight = await p.locator('.canvas-layer canvas').screenshot({ path: '/tmp/gyro_right.png' })
// tilt left (gamma -22) → look left
for (let i = 0; i < 12; i++) { await fire(0, -22); await p.waitForTimeout(30) }
await p.waitForTimeout(500)
const shotLeft = await p.locator('.canvas-layer canvas').screenshot({ path: '/tmp/gyro_left.png' })

const overlayAfter = await p.evaluate(() => {
  const r = document.querySelector('#z03 .hud-head').getBoundingClientRect()
  return { x: Math.round(r.left), y: Math.round(r.top) }
})
const same = (a, b) => Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1
const moved = Buffer.compare(shotRight, shotLeft) !== 0

console.log('camera moved between tilt-right and tilt-left:', moved)
console.log('overlay stayed fixed while phone tilted:', same(overlayBefore, overlayAfter), JSON.stringify(overlayBefore), JSON.stringify(overlayAfter))
console.log('ERRORS', JSON.stringify(errors.slice(0, 8)))
await b.close()
