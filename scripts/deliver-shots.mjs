import { chromium } from 'playwright-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.env.URL || 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
p.on('response', (r) => { if (r.url().includes('/img/') && !r.ok()) errs.push('IMG ' + r.status() + ' ' + r.url()) })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
const h = await p.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= h; y += 460) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(110) }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500)
await p.screenshot({ path: '/tmp/d-hero.png' })
const at = async (id, out) => { await p.evaluate((i) => document.getElementById(i)?.scrollIntoView(), id); await p.waitForTimeout(700); await p.screenshot({ path: out }) }
await at('about', '/tmp/d-company.png')
await at('experience', '/tmp/d-experience.png')
await at('roadmap', '/tmp/d-roadmap.png')
await at('career', '/tmp/d-career.png')
await at('demo', '/tmp/d-demo.png')
await p.evaluate(() => document.querySelector('.qr-card')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(600)
await p.screenshot({ path: '/tmp/d-contact.png' })
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300)
await p.screenshot({ path: '/tmp/d-full.png', fullPage: true })
console.log('IMG_ERRORS=' + JSON.stringify(errs))
console.log('done')
await b.close()
