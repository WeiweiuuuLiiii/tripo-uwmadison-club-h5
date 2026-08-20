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
  const hs = await p.evaluate(() => document.documentElement.scrollHeight > window.innerWidth) // horizontal?
  const hScroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  let worst = 'ok'
  for (const id of CARDS) {
    // scroll section into view, record camera zone
    await p.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'center' }), id)
    await p.waitForTimeout(700)
    const zoneBefore = await p.evaluate(() => window.scrollY)
    // expand
    await p.evaluate((id) => document.querySelector(`#${id} .hud-expand`)?.click(), id)
    await p.waitForTimeout(500)
    // scroll the body to the very bottom
    const res = await p.evaluate((id) => {
      const body = document.querySelector(`#${id} .hud-body`)
      if (!body) return { ok: false, why: 'no body' }
      body.scrollTop = body.scrollHeight
      const inner = document.querySelector(`#${id} .hud-body-inner`)
      const footer = document.querySelector(`#${id} .hud-footer`)
      const last = inner?.lastElementChild?.getBoundingClientRect()
      const foot = footer?.getBoundingClientRect()
      // last content bottom must be above the footer top (fully visible, clears CTA)
      const lastVisible = last && foot ? last.bottom <= foot.top + 1 : true
      const panelExpanded = document.documentElement.classList.contains('panel-expanded')
      const railHidden = getComputedStyle(document.querySelector('.prog-rail')).visibility === 'hidden'
      return { ok: true, lastVisible, panelExpanded, railHidden, scrolled: body.scrollTop > 0 }
    }, id)
    // camera must not have moved (outer scroll frozen)
    const zoneAfter = await p.evaluate(() => window.scrollY)
    const cameraStill = Math.abs(zoneAfter - zoneBefore) < 3
    if (!res.lastVisible || !res.panelExpanded || !cameraStill) {
      worst = `FAIL ${id} lastVisible=${res.lastVisible} expanded=${res.panelExpanded} cameraStill=${cameraStill} railHidden=${res.railHidden}`
    }
    // screenshot the expanded state at 390x844 only (representative)
    if (w === 390) await p.screenshot({ path: `/tmp/hud/${id}-open.png` })
    // collapse
    await p.evaluate((id) => document.querySelector(`#${id} .hud-expand`)?.click(), id)
    await p.waitForTimeout(300)
  }
  console.log(`${w}x${h}: hScroll=${hScroll} ${worst}`)
  await p.close()
}
console.log('ERRORS', JSON.stringify(errors.slice(0, 10)))
await b.close()
