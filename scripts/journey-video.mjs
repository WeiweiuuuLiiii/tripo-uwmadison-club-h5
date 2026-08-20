import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: '/tmp/journey-vid', size: { width: 390, height: 844 } },
})
const p = await ctx.newPage()
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(2600) // loader + settle

const H = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)

// smooth scripted scroll top→bottom while measuring rendered frames
await p.evaluate(() => { window.__wf = 0 })
const t0 = Date.now()
const STEPS = 150
for (let i = 0; i <= STEPS; i++) {
  const y = Math.round((H * i) / STEPS)
  await p.evaluate((y) => window.scrollTo(0, y), y)
  await p.waitForTimeout(70)
}
await p.waitForTimeout(600)
const secs = (Date.now() - t0) / 1000
const wf = await p.evaluate(() => window.__wf || 0)
console.log(`FPS: ${(wf / secs).toFixed(1)} avg over ${secs.toFixed(1)}s (${wf} rendered frames during scroll)`)

// a little drag-look at the bottom to show interactivity
await p.mouse.move(195, 420)
await p.mouse.down()
await p.mouse.move(300, 440, { steps: 12 })
await p.mouse.move(90, 400, { steps: 12 })
await p.mouse.up()
await p.waitForTimeout(500)

await ctx.close()
await b.close()
console.log('video saved to /tmp/journey-vid')
