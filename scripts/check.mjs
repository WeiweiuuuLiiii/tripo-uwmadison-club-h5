import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
await p.goto('http://localhost:4173/tripo-uwmadison-club-h5/', { waitUntil: 'networkidle' })
const r = await p.evaluate(() => ({
  sections: document.querySelectorAll('section').length,
  heroTitles: document.querySelectorAll('.hero-title').length,
  h2count: document.querySelectorAll('h2').length,
  bodyH: document.body.scrollHeight,
  imgs: [...document.querySelectorAll('.fig img')].map((i) => i.getAttribute('src').split('/').pop()),
}))
console.log(JSON.stringify(r, null, 1))
await b.close()
