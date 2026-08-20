import { chromium } from 'playwright-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const b = await chromium.launch({ executablePath: CHROME, headless: true })

// helper: fraction of .reveal blocks that are visibly shown (opacity>0.9)
async function hiddenCount(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('.reveal')]
    let hidden = 0
    for (const el of els) {
      const cs = getComputedStyle(el)
      if (parseFloat(cs.opacity) < 0.85) hidden++
    }
    return { total: els.length, hidden }
  })
}

// 1) Direct anchor entry to #join — the QR content must be visible
const p1 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p1.goto(BASE + '#join', { waitUntil: 'networkidle' })
await p1.waitForTimeout(1300)
const qrVisible = await p1.evaluate(() => {
  const el = [...document.querySelectorAll('.qr-title')][0]
  if (!el) return false
  const cs = getComputedStyle(el.closest('.reveal') || el)
  const r = el.getBoundingClientRect()
  return parseFloat(cs.opacity) > 0.85 && r.width > 0
})
console.log('ANCHOR#join_qr_visible=' + qrVisible)

// 2) Fast scroll to the very bottom instantly, then check nothing is stuck hidden
const p2 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p2.goto(BASE, { waitUntil: 'domcontentloaded' })
await p2.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await p2.waitForTimeout(1300)
console.log('FAST_BOTTOM_hidden=' + JSON.stringify(await hiddenCount(p2)))

// 3) Load, wait past fallback, everything revealed
const p3 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p3.goto(BASE, { waitUntil: 'networkidle' })
// scroll through then back
const h = await p3.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= h; y += 700) { await p3.evaluate((yy) => scrollTo(0, yy), y); await p3.waitForTimeout(60) }
await p3.waitForTimeout(1100)
console.log('AFTER_SCROLL_hidden=' + JSON.stringify(await hiddenCount(p3)))

// 4) reduced-motion: everything visible immediately
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const p4 = await ctx.newPage()
await p4.goto(BASE, { waitUntil: 'networkidle' })
await p4.waitForTimeout(300)
console.log('REDUCED_MOTION_hidden=' + JSON.stringify(await hiddenCount(p4)))

await b.close()
