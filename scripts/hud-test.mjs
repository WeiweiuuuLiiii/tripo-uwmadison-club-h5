import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SIZES = [
  [320, 568],
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
]
const CARDS = ['z02', 'z03', 'z04', 'z05', 'z06']

const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const errors = []
for (const [w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  p.on('console', (m) => m.type() === 'error' && errors.push(`${w}x${h}: ${m.text()}`))
  p.on('pageerror', (e) => errors.push(`${w}x${h} PE: ${e.message}`))
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8000)
  const hScroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  let worst = 'ok'
  for (const id of CARDS) {
    await p.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'center' }), id)
    await p.waitForTimeout(600)
    const yBefore = await p.evaluate(() => window.scrollY)
    await p.evaluate((id) => document.querySelector(`#${id} .hud-expand`)?.click(), id)
    await p.waitForTimeout(450)
    const r = await p.evaluate((id) => {
      const H = window.innerHeight
      const card = document.querySelector(`#${id} .hud-card.open`)
      const head = document.querySelector(`#${id} .hud-head`)
      const collapse = document.querySelector(`#${id} .hud-expand`)
      const body = document.querySelector(`#${id} .hud-body`)
      const inner = document.querySelector(`#${id} .hud-body-inner`)
      const footer = document.querySelector(`#${id} .hud-footer`)
      const cr = card?.getBoundingClientRect()
      const hr = collapse?.getBoundingClientRect()
      // shell fully inside viewport, top below the very top (status bar), header visible
      const shellInView = cr && cr.top >= 0 && cr.top < 130 && cr.bottom <= H + 1
      const collapseVisible = hr && hr.top >= 0 && hr.bottom <= H + 1
      const resetTop = body.scrollTop === 0
      const firstChild = inner?.firstElementChild?.getBoundingClientRect()
      const headRect = head?.getBoundingClientRect()
      const firstVisibleBelowHeader = firstChild && headRect ? firstChild.top >= headRect.bottom - 1 : true
      // scroll to bottom → last line clears footer
      body.scrollTop = body.scrollHeight
      return new Promise((res) => setTimeout(() => {
        const last = inner?.lastElementChild?.getBoundingClientRect()
        const foot = footer?.getBoundingClientRect()
        const lastClearsFooter = last && foot ? last.bottom <= foot.top + 1 : true
        const canScrollDown = body.scrollTop > 5
        res({ shellInView, collapseVisible, resetTop, firstVisibleBelowHeader, lastClearsFooter, canScrollDown, top: Math.round(cr?.top), bottom: Math.round(cr?.bottom) })
      }, 250))
    }, id)
    // scroll back to top
    await p.evaluate((id) => { document.querySelector(`#${id} .hud-body`).scrollTop = 0 }, id)
    await p.waitForTimeout(200)
    const backTop = await p.evaluate((id) => document.querySelector(`#${id} .hud-body`).scrollTop === 0, id)
    const yAfter = await p.evaluate(() => window.scrollY)
    const cameraStill = Math.abs(yAfter - yBefore) < 3
    // canScrollDown is informational: a short card that fits without scrolling is fine
    const okAll = r.shellInView && r.collapseVisible && r.resetTop && r.lastClearsFooter && backTop && cameraStill
    if (!okAll) worst = `FAIL ${id} ${JSON.stringify({ ...r, backTop, cameraStill })}`
    if (w === 390) await p.screenshot({ path: `/tmp/hud/${id}-open.png` })
    await p.evaluate((id) => document.querySelector(`#${id} .hud-expand`)?.click(), id)
    await p.waitForTimeout(250)
  }
  console.log(`${w}x${h}: hScroll=${hScroll} ${worst}`)
  await p.close()
}
console.log('ERRORS', JSON.stringify(errors.slice(0, 10)))
await b.close()
