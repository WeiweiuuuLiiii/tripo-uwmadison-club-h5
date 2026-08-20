import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const OUT = process.env.OUT || '/tmp'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist', '--enable-webgl'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(7000) // let loader finish + first frames render

const info = await p.evaluate(() => {
  const c = document.querySelector('.canvas-layer canvas')
  let gl = null
  try { gl = c && (c.getContext('webgl2') || c.getContext('webgl')) } catch { /* */ }
  return {
    hasCanvas: !!c,
    webgl: !!gl,
    canvasSize: c ? `${c.width}x${c.height}` : null,
    mode: document.documentElement.className,
    loaderGone: !document.querySelector('.world-loader:not(.out)'),
    docHeight: document.documentElement.scrollHeight,
    winH: window.innerHeight,
  }
})
console.log('INFO', JSON.stringify(info))

for (let i = 1; i <= 7; i++) {
  const id = 'z0' + i
  await p.evaluate((id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'instant' })
  }, id)
  await p.waitForTimeout(1700)
  await p.screenshot({ path: `${OUT}/iz-0${i}.png` })
  const txt = await p.evaluate((id) => {
    const el = document.getElementById(id)
    return el ? (el.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : 'MISSING'
  }, id)
  console.log(`zone ${id}:`, txt)
}

// Lite mode
const p2 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p2.goto(URL + '?lite=1', { waitUntil: 'networkidle' })
await p2.waitForTimeout(1500)
const liteInfo = await p2.evaluate(() => ({
  mode: document.documentElement.className,
  hasCanvas: !!document.querySelector('.canvas-layer canvas'),
  hasQR: !!document.querySelector('.qr-card img'),
  hasDisclaimer: [...document.querySelectorAll('.disclaimer')].some((e) => e.textContent.includes('不构成录用保证')),
}))
console.log('LITE', JSON.stringify(liteInfo))
await p2.screenshot({ path: `${OUT}/iz-lite.png` })

console.log('ERRORS', JSON.stringify(errors.slice(0, 12)))
await b.close()
