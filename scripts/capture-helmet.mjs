import { chromium } from 'playwright-core'

const URL = 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(8500)
// First scroll to zone 02 (sections must keep their height so the camera reaches it),
// THEN hide the cards/rail with visibility:hidden (layout preserved) so only the 3D shows.
await p.evaluate(() => document.getElementById('z02')?.scrollIntoView({ block: 'center' }))
await p.waitForTimeout(1500)
await p.evaluate(() => {
  document.querySelectorAll('.hud-card, .prog-rail, .mode-toggle, .fx-scan, .fx-vignette, .world-loader').forEach((el) => (el.style.visibility = 'hidden'))
})
await p.waitForTimeout(1200)
await p.screenshot({ path: '/tmp/helmet_raw.png' })
await b.close()
console.log('captured /tmp/helmet_raw.png')
