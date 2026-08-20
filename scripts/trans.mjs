import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:4173/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
await p.waitForTimeout(6500)
const H = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
const frames = [['t10', 0.10], ['t14', 0.14], ['t18', 0.18], ['t50', 0.50], ['t63', 0.63]]
for (const [name, frac] of frames) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(H * frac))
  await p.waitForTimeout(1100)
  await p.screenshot({ path: `/tmp/${name}.png` })
}
await b.close()
console.log('done')
