import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { statSync, mkdirSync } from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'img')
mkdirSync(outDir, { recursive: true })

// { file, w, h (source px), outW (display px), q }
const jobs = [
  { file: 'gallery.html', w: 1080, h: 1080, outW: 760, q: 74 },
  { file: 'workflow.html', w: 900, h: 1320, outW: 640, q: 76 },
  { file: 'roadmap.html', w: 900, h: 1180, outW: 620, q: 76 },
  { file: 'career.html', w: 1000, h: 900, outW: 720, q: 74 },
  { file: 'demo.html', w: 1280, h: 720, outW: 900, q: 72 },
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 2 })
  await page.goto('file://' + join(__dirname, 'assets', j.file), { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: j.w, height: j.h } })
  await page.close()
  const name = j.file.replace('.html', '.webp')
  const out = join(outDir, name)
  const outH = Math.round((j.h / j.w) * j.outW)
  await sharp(png).resize(j.outW, outH).webp({ quality: j.q, effort: 6 }).toFile(out)
  console.log(`${name}  ${j.outW}x${outH}  ${(statSync(out).size / 1024).toFixed(1)} KB`)
}
await browser.close()
