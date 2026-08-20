import { chromium } from 'playwright-core'
import { readFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const jsqrPath = require.resolve('jsqr')
const jsqrSrc = readFileSync(jsqrPath, 'utf8')

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const OUT = '/tmp/tripo'

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

// ---- 1. no horizontal scroll across widths ----
for (const w of [320, 375, 390, 430]) {
  const p = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 })
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  const r = await p.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }))
  console.log(`WIDTH ${w}: scrollW=${r.scrollW} clientW=${r.clientW} -> ${r.scrollW <= r.clientW + 1 ? 'NO H-SCROLL ✓' : 'H-SCROLL ✗'}`)
  await p.close()
}

// ---- 2. main page: console errors, QR decode, long-press, screenshots ----
const errors = []
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// hero screenshot
await page.screenshot({ path: `${OUT}-hero.png` })

// scroll to process flow
await page.evaluate(() => document.getElementById('experience')?.scrollIntoView())
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}-flow.png` })

// career / internship
await page.evaluate(() => document.getElementById('career')?.scrollIntoView())
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}-career.png` })

// QR / join
await page.evaluate(() => document.getElementById('join')?.scrollIntoView())
await page.waitForTimeout(900)
await page.screenshot({ path: `${OUT}-qr.png` })

// full page
await page.screenshot({ path: `${OUT}-full.png`, fullPage: true })

// QR long-press not blocked + decode from the actual rendered <img>
await page.addScriptTag({ content: jsqrSrc })
const qr = await page.evaluate(() => {
  const img = document.querySelector('.qr-card img')
  if (!img) return { ok: false, reason: 'no img' }
  const cs = getComputedStyle(img)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  // eslint-disable-next-line no-undef
  const res = jsQR(data.data, canvas.width, canvas.height)
  return {
    ok: !!res,
    text: res ? res.data : null,
    naturalW: img.naturalWidth,
    naturalH: img.naturalHeight,
    tagName: img.tagName,
    touchCallout: cs.webkitTouchCallout || cs.getPropertyValue('-webkit-touch-callout'),
    userSelect: cs.userSelect || cs.webkitUserSelect,
    pointerEvents: cs.pointerEvents,
  }
})
console.log('QR:', JSON.stringify(qr))
console.log('CONSOLE_ERRORS:', JSON.stringify(errors.filter((e) => !/favicon|404/i.test(e))))
console.log('SCREENSHOTS:', `${OUT}-hero.png ${OUT}-flow.png ${OUT}-career.png ${OUT}-qr.png ${OUT}-full.png`)
await browser.close()
