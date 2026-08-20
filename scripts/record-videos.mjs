import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })

// ---------- Video 1: gyro follows the phone ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: '/tmp/vid-gyro', size: { width: 390, height: 844 } } })
  const p = await ctx.newPage()
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8500)
  await p.evaluate(() => document.getElementById('z03')?.scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(1000)
  await p.evaluate(() => document.querySelector('.gyro-btn')?.click())
  await p.waitForTimeout(600)
  const fire = (beta, gamma) => p.evaluate(([b2, g2]) => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: b2, gamma: g2, absolute: false })), [beta, gamma])
  await fire(0, 0)
  await p.waitForTimeout(400)
  // smooth sweep: right, left, up, down, circle
  const path = []
  for (let a = 0; a <= 360; a += 6) path.push([Math.sin((a * Math.PI) / 180) * 14, Math.cos((a * Math.PI) / 180) * 24])
  for (const [beta, gamma] of path) { await fire(beta, gamma); await p.waitForTimeout(45) }
  await fire(0, 0)
  await p.waitForTimeout(600)
  await ctx.close()
}

// ---------- Video 2: expand card, scroll body to bottom, camera fixed ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: '/tmp/vid-expand', size: { width: 390, height: 844 } } })
  const p = await ctx.newPage()
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8500)
  await p.evaluate(() => document.getElementById('z06')?.scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(1200)
  await p.evaluate(() => document.querySelector('#z06 .hud-expand')?.click())
  await p.waitForTimeout(700)
  // slowly scroll the card body to the very bottom
  const max = await p.evaluate(() => document.querySelector('#z06 .hud-body').scrollHeight)
  for (let y = 0; y <= max; y += 24) {
    await p.evaluate((y) => { document.querySelector('#z06 .hud-body').scrollTop = y }, y)
    await p.waitForTimeout(40)
  }
  await p.waitForTimeout(900) // hold at bottom — last line + CTA visible
  await p.evaluate(() => document.querySelector('#z06 .hud-expand')?.click())
  await p.waitForTimeout(700)
  await ctx.close()
}

await b.close()
console.log('recorded')
