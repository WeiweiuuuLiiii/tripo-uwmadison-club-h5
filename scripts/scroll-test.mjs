import { chromium } from 'playwright-core'

const URL = process.env.URL || 'http://localhost:4173/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SIZES = [[320, 568], [375, 667], [390, 844], [393, 852], [430, 932]]

const b = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const errors = []
let deviceOrientationRequested = false

for (const [w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  p.on('console', (m) => m.type() === 'error' && errors.push(`${w}x${h}: ${m.text()}`))
  p.on('pageerror', (e) => errors.push(`${w}x${h} PE: ${e.message}`))
  await p.addInitScript(() => {
    window.__doListen = false
    const orig = window.addEventListener
    window.addEventListener = function (t, ...rest) { if (t === 'deviceorientation' || t === 'devicemotion') window.__doListen = true; return orig.call(this, t, ...rest) }
  })
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(8000)

  const activeIdx = () => p.evaluate(() => { const li = [...document.querySelectorAll('.prog-rail li')]; return li.findIndex((e) => e.classList.contains('on')) })
  const scrollTo = (y) => p.evaluate((y) => window.scrollTo(0, y), y)
  const H = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)

  const gyro = await p.evaluate(() => !!document.querySelector('.gyro-btn, .gyro-toast, .gyro-recal'))
  const doListen = await p.evaluate(() => window.__doListen === true)
  if (doListen) deviceOrientationRequested = true
  const hScroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)

  // 1) collapsed continuous scroll → reach the last section without clicking
  const seen = new Set()
  for (let i = 0; i <= 30; i++) { await scrollTo(Math.round((H * i) / 30)); await p.waitForTimeout(70); seen.add(await activeIdx()) }
  const reachedCollapsed = seen.has(6) && seen.has(0)

  // 2) card-top stability on expand + section grows (measured at z04, card ~30% down)
  const cardDocTop = await p.evaluate(() => document.querySelector('#z04 .hud-card').getBoundingClientRect().top + window.scrollY)
  await scrollTo(Math.round(cardDocTop - h * 0.3))
  await p.waitForTimeout(500)
  const topBefore = await p.evaluate(() => Math.round(document.querySelector('#z04 .hud-card').getBoundingClientRect().top))
  const shBefore = await p.evaluate(() => document.documentElement.scrollHeight)
  await p.evaluate(() => document.querySelector('#z04 .hud-expand')?.click())
  await p.waitForTimeout(550)
  const topAfter = await p.evaluate(() => Math.round(document.querySelector('#z04 .hud-card').getBoundingClientRect().top))
  const shAfter = await p.evaluate(() => document.documentElement.scrollHeight)
  const topStable = Math.abs(topAfter - topBefore) <= 4
  const heightGrew = shAfter > shBefore + 40

  // 3) EXPANDED (not collapsed) → keep scrolling into the next section
  const yStart = await p.evaluate(() => window.scrollY)
  const aStart = await activeIdx()
  await p.evaluate(() => window.scrollBy(0, window.innerHeight * 1.6))
  await p.waitForTimeout(500)
  const yEnd = await p.evaluate(() => window.scrollY)
  const aEnd = await activeIdx()
  const stillOpen = await p.evaluate(() => !!document.querySelector('#z04 .hud-card.open'))
  const advancedWhileOpen = yEnd > yStart + 100 && aEnd > aStart && stillOpen

  // 4) scroll back up returns to a previous section
  await p.evaluate(() => window.scrollBy(0, -window.innerHeight * 1.3))
  await p.waitForTimeout(400)
  const aBack = await activeIdx()
  const wentBack = aBack < aEnd

  const ok = !gyro && !doListen && !hScroll && reachedCollapsed && topStable && heightGrew && advancedWhileOpen && wentBack
  console.log(`${w}x${h}: ${ok ? 'ok' : 'FAIL'} ${JSON.stringify({ gyro, doListen, hScroll, reachedCollapsed, topStable, heightGrew, advancedWhileOpen, wentBack, topBefore, topAfter })}`)
  await p.close()
}
console.log('deviceOrientationRequestedAnywhere:', deviceOrientationRequested)
console.log('ERRORS', JSON.stringify(errors.slice(0, 10)))
await b.close()
