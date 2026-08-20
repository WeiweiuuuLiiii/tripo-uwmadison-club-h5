import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:4173/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1400)
await p.screenshot({ path: '/tmp/hero-check.png' })
await b.close()
