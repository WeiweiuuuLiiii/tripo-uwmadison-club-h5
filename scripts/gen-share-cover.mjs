import { chromium } from 'playwright-core'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { statSync } from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const __dirname = dirname(fileURLToPath(import.meta.url))
const html = 'file://' + join(__dirname, 'share-cover.html')
const out = join(__dirname, '..', 'public', 'wechat-share-cover.jpg')

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(html, { waitUntil: 'networkidle' })
await page.waitForTimeout(250)
// Tune quality so the file lands near ~300KB.
await page.screenshot({ path: out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } })
await browser.close()

const kb = (statSync(out).size / 1024).toFixed(1)
console.log(`share cover written: ${out} (${kb} KB)`)
