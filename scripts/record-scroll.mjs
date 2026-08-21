import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: '/tmp/vid-scroll', size: { width: 390, height: 844 } } })
const p = await ctx.newPage()
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(8500)

const y = () => p.evaluate(() => window.scrollY)
const docTop = (id) => p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + window.scrollY, id)
const glide = async (to, steps = 42, ms = 28) => {
  const from = await y()
  for (let i = 1; i <= steps; i++) {
    const yy = Math.round(from + (to - from) * (i / steps))
    await p.evaluate((yy) => window.scrollTo(0, yy), yy)
    await p.waitForTimeout(ms)
  }
}

// 1) collapsed: continuously scroll from section 1 down through 2 → 3
await p.waitForTimeout(700)
await glide(await docTop('z02'))
await p.waitForTimeout(500)
await glide((await docTop('z03')) - 40)
await p.waitForTimeout(500)

// 2) expand a card and, WITHOUT collapsing, keep scrolling into the next section
await glide((await docTop('z04')) + 120)
await p.waitForTimeout(500)
await p.evaluate(() => document.querySelector('#z04 .hud-expand')?.click()) // 展开详情
await p.waitForTimeout(1200) // details expand in flow
await glide((await docTop('z04')) + 520, 40) // read down the expanded details
await p.waitForTimeout(500)
await glide((await docTop('z05')) + 60, 46) // continue straight into next section — card NOT collapsed
await p.waitForTimeout(700)

// 3) scroll back up to the previous section
await glide((await docTop('z04')) + 120, 40)
await p.waitForTimeout(700)

// 4) continuous run from the top all the way to section 7
await glide(0, 46)
await p.waitForTimeout(500)
await glide(await docTop('z07'), 120, 26)
await p.waitForTimeout(400)

// 5) settle on the contact QR (unobstructed, long-press area)
await p.evaluate(() => document.getElementById('z07')?.scrollIntoView({ block: 'center' }))
await p.waitForTimeout(1600)

await ctx.close()
await b.close()
console.log('recorded')
