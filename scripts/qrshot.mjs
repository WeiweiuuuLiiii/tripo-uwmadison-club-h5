import { chromium } from 'playwright-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:4173/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
// Scroll through the page in steps so every reveal fires.
const h = await p.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= h; y += 500) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y)
  await p.waitForTimeout(120)
}
await p.evaluate(() => document.querySelector('.qr-card')?.scrollIntoView({ block: 'center' }))
await p.waitForTimeout(900)
const info = await p.evaluate(() => {
  const el = document.querySelector('.qr-card')
  const r = el.getBoundingClientRect()
  const cta = document.querySelector('.cta-bar')
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight, ctaHidden: cta?.classList.contains('hidden') }
})
console.log('QRCARD_RECT=' + JSON.stringify(info))
await p.screenshot({ path: '/tmp/tripo-qrcard.png' })
await b.close()
