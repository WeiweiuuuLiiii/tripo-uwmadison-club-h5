import { chromium } from 'playwright-core'
const U = process.env.URL || 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto(U, { waitUntil: 'networkidle' })
await p.waitForTimeout(9000)
const H = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
// scroll smoothly for ~8s while counting the page's own rendered frames (window.__wf, set by the R3F Director)
await p.evaluate(() => { window.__wf = 0 })
const t0 = Date.now()
for (let i = 0; i <= 120; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), Math.round((H * i) / 120))
  await p.waitForTimeout(60)
}
const secs = (Date.now() - t0) / 1000
const wf = await p.evaluate(() => window.__wf || 0)
console.log(`RENDER FPS (R3F): ${(wf / secs).toFixed(1)} over ${secs.toFixed(1)}s (${wf} frames)`)
await b.close()
