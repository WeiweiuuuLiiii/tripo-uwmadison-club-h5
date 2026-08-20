import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle'] })
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 MicroMessenger/8.0.0',
})
await p.goto('https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2200)
await p.evaluate(() => document.querySelector('.qr-card img')?.scrollIntoView({block:'center'}))
await p.waitForTimeout(1400)
const qr = await p.evaluate(() => {
  const img = document.querySelector('.qr-card img')
  if (!img) return { found: false }
  const cs = getComputedStyle(img)
  const r = img.getBoundingClientRect()
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return {
    found: true, tag: img.tagName, natural: `${img.naturalWidth}x${img.naturalHeight}`,
    complete: img.complete, callout: cs.webkitTouchCallout || cs.getPropertyValue('-webkit-touch-callout'),
    pointer: cs.pointerEvents, topElementIsTheImg: top === img, alt: img.alt,
  }
})
console.log('QR', JSON.stringify(qr))
await p.screenshot({ path: '/tmp/live/iz-07-wechat.png' })
await b.close()
