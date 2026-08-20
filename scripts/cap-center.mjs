import { chromium } from 'playwright-core'
const U = 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto(U, { waitUntil: 'networkidle' })
await p.waitForTimeout(9000)
for (const id of ['z01', 'z07']) {
  await p.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'center' }), id)
  await p.waitForTimeout(1600)
  await p.screenshot({ path: `/tmp/hud/${id}.png` })
}
await b.close()
console.log('captured z01 z07')
