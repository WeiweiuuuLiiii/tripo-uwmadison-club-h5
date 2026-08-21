import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })

// ---------- Video 1: enhanced gyro follow ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: '/tmp/vid-gyro', size: { width: 390, height: 844 } } })
  const p = await ctx.newPage()
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8500)
  await p.evaluate(() => document.getElementById('z03')?.scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(1000)
  await p.evaluate(() => document.querySelector('.gyro-btn')?.click())
  await p.waitForTimeout(500)
  const fire = (beta, gamma) => p.evaluate(([b2, g2]) => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: b2, gamma: g2, absolute: false })), [beta, gamma])
  // calibrate neutral
  for (let i = 0; i < 16; i++) { await fire(0, 0); await p.waitForTimeout(25) }
  const glide = async (fromB, fromG, toB, toG, steps, ms) => {
    for (let i = 0; i <= steps; i++) { const k = i / steps; await fire(fromB + (toB - fromB) * k, fromG + (toG - fromG) * k); await p.waitForTimeout(ms) }
  }
  await p.waitForTimeout(700) // 1) hold still
  await glide(0, 0, 0, -18, 26, 34) // 2) slow left
  await p.waitForTimeout(500)
  await glide(0, -18, 0, 18, 40, 34) // 3) sweep to right
  await p.waitForTimeout(500)
  await glide(0, 18, 0, 0, 22, 34)
  await glide(0, 0, 15, 0, 24, 34) // 4) tilt up
  await glide(15, 0, -13, 0, 30, 34) // down
  await glide(-13, 0, 0, 0, 16, 34)
  await fire(0, 22); await p.waitForTimeout(120); await fire(0, -22); await p.waitForTimeout(120); await fire(0, 0) // 5) fast turn
  await p.waitForTimeout(900) // 6) stop → settles
  // 7) expand card → background must freeze
  await p.evaluate(() => document.querySelector('#z03 .hud-expand')?.click())
  await p.waitForTimeout(400)
  await glide(0, 0, 0, 20, 20, 34) // tilt while expanded — background stays put
  await glide(0, 20, 0, -20, 30, 34)
  await p.waitForTimeout(500)
  await p.evaluate(() => document.querySelector('#z03 .hud-expand')?.click()) // 8) collapse → resume
  await p.waitForTimeout(400)
  await glide(0, 0, 0, 16, 22, 34)
  await glide(0, 16, 0, -16, 30, 34)
  await fire(0, 0)
  await p.waitForTimeout(700)
  await ctx.close()
}

// ---------- Video 2: expand → scroll to bottom → back to top → collapse ----------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, recordVideo: { dir: '/tmp/vid-expand', size: { width: 390, height: 844 } } })
  const p = await ctx.newPage()
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8500)
  await p.evaluate(() => document.getElementById('z06')?.scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(1200)
  await p.evaluate(() => document.querySelector('#z06 .hud-expand')?.click()) // 1) expand
  await p.waitForTimeout(1100) // 2-3) header below status bar + first line visible
  const max = await p.evaluate(() => document.querySelector('#z06 .hud-body').scrollHeight - document.querySelector('#z06 .hud-body').clientHeight)
  for (let y = 0; y <= max; y += 18) { await p.evaluate((y) => { document.querySelector('#z06 .hud-body').scrollTop = y }, y); await p.waitForTimeout(34) } // 4) scroll down
  await p.waitForTimeout(1100) // 5) last line above footer
  for (let y = max; y >= 0; y -= 18) { await p.evaluate((y) => { document.querySelector('#z06 .hud-body').scrollTop = y }, y); await p.waitForTimeout(34) } // 6) back to top
  await p.waitForTimeout(900) // 7) header + 收起 visible throughout
  await p.evaluate(() => document.querySelector('#z06 .hud-expand')?.click()) // 8) collapse
  await p.waitForTimeout(1000) // 9-10) folded, same zone
  await ctx.close()
}

await b.close()
console.log('recorded')
