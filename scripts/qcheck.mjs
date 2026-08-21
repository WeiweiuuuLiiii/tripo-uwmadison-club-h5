import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2 })
const errs = []
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
p.on('pageerror', (e) => errs.push('PE:' + e.message))
await p.goto('http://localhost:4173/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
await p.waitForTimeout(8000)
const r = await p.evaluate(() => ({
  title: document.title,
  hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
  mode: document.documentElement.className,
  canvas: !!document.querySelector('.canvas-layer canvas'),
  hiddenImg: !!document.querySelector('img[alt*="2026"]'),
}))
console.log(JSON.stringify(r))
console.log('ERRORS', JSON.stringify(errs.slice(0, 6)))
await b.close()
