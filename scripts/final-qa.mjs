import { chromium, devices } from 'playwright-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const WECHAT_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003123) NetType/WIFI Language/zh_CN'

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  viewport: { width: 390, height: 844 },
  userAgent: WECHAT_UA,
  locale: 'zh-CN',
})
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

const resp = await page.goto(URL, { waitUntil: 'networkidle' })
console.log('HTTP_STATUS=' + resp.status())
console.log('UA_HAS_WECHAT=' + (await page.evaluate(() => /MicroMessenger/i.test(navigator.userAgent))))

// --- metadata / share ---
const meta = await page.evaluate(() => ({
  title: document.title,
  ogTitle: document.querySelector('meta[property="og:title"]')?.content,
  ogDesc: document.querySelector('meta[property="og:description"]')?.content,
  ogImage: document.querySelector('meta[property="og:image"]')?.content,
  canonical: document.querySelector('link[rel="canonical"]')?.href,
}))
console.log('TITLE=' + meta.title)
console.log('OG_TITLE=' + meta.ogTitle)
console.log('OG_IMAGE=' + meta.ogImage)
const cover = await page.request.get(meta.ogImage)
console.log('OG_IMAGE_STATUS=' + cover.status() + ' bytes=' + (await cover.body()).length)

const inJoin = () =>
  page.evaluate(() => {
    const r = document.getElementById('join').getBoundingClientRect()
    return r.top < window.innerHeight * 0.9 && r.bottom > 0
  })
const atTop = () => page.evaluate(() => window.scrollY < 40)

// --- CTA 1: hero primary -> join ---
await page.evaluate(() => window.scrollTo(0, 0))
await page.getByRole('button', { name: '加入 2026 秋季招新' }).click()
await page.waitForTimeout(1200)
console.log('CTA_hero_primary_reaches_join=' + (await inJoin()))

// --- CTA 2: hero secondary -> #what ---
await page.evaluate(() => window.scrollTo(0, 0))
await page.getByRole('button', { name: '看看我们要做什么' }).click()
await page.waitForTimeout(1200)
console.log('CTA_hero_secondary_reaches_what=' +
  (await page.evaluate(() => { const r = document.getElementById('what').getBoundingClientRect(); return r.top < window.innerHeight * 0.6 && r.bottom > 0 })))

// --- CTA 3: fixed bottom bar -> join ---
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
const ctaVisibleAtTop = await page.evaluate(() => { const c = document.querySelector('.cta-bar'); return c && !c.classList.contains('hidden') })
console.log('fixed_CTA_visible_at_top=' + ctaVisibleAtTop)
await page.getByRole('button', { name: '立即加入' }).click()
await page.waitForTimeout(1200)
console.log('CTA_fixed_reaches_join=' + (await inJoin()))
console.log('fixed_CTA_hidden_in_join=' + (await page.evaluate(() => document.querySelector('.cta-bar').classList.contains('hidden'))))

// --- CTA 4: showcase jumplink -> join ---
await page.evaluate(() => document.getElementById('demo').scrollIntoView())
await page.waitForTimeout(400)
await page.getByRole('button', { name: /想了解核心项目组/ }).click()
await page.waitForTimeout(1000)
console.log('CTA_jumplink_reaches_join=' + (await inJoin()))

// --- CTA 5: final button stays in join ---
await page.getByRole('button', { name: '加入 TRIPO AI 3D Club' }).click()
await page.waitForTimeout(600)
console.log('CTA_final_stays_join=' + (await inJoin()))

// --- QR long-press attributes ---
const qr = await page.evaluate(() => {
  const img = document.querySelector('.qr-card img')
  const cs = getComputedStyle(img)
  return {
    tag: img.tagName, w: img.naturalWidth, h: img.naturalHeight, complete: img.complete,
    callout: cs.webkitTouchCallout || cs.getPropertyValue('-webkit-touch-callout'),
    userSelect: cs.userSelect || cs.webkitUserSelect, pointerEvents: cs.pointerEvents,
  }
})
console.log('QR_IMG=' + JSON.stringify(qr))

// --- final full-page screenshot ---
await page.evaluate(() => window.scrollTo(0, 0))
const h = await page.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= h; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80) }
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/tripo-qa-full.png', fullPage: true })

console.log('CONSOLE_ERRORS=' + JSON.stringify(errors.filter((e) => !/favicon|404/i.test(e))))
console.log('SCREENSHOT=/tmp/tripo-qa-full.png')
await browser.close()
