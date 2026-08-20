import { chromium } from 'playwright-core'
const U = 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-gl=angle','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errs=[]; p.on('console',m=>m.type()==='error'&&errs.push(m.text())); p.on('pageerror',e=>errs.push('PE:'+e.message))
await p.goto(U, { waitUntil: 'networkidle' })
await p.waitForTimeout(9000)
const r = await p.evaluate(() => {
  const full = document.querySelector('.canvas-layer canvas')
  const legacy = document.querySelector('.hero-visual')
  let gl=null; try{ gl = full && (full.getContext('webgl2')||full.getContext('webgl')) }catch{}
  return {
    htmlClass: document.documentElement.className,
    fullscreenCanvas: !!full,
    canvasCoversViewport: full ? (full.clientWidth>=window.innerWidth-2 && full.clientHeight>=window.innerHeight-2) : false,
    legacyHeroVisual: !!legacy,
    webgl: !!gl,
    toggleVisible: !!document.querySelector('.mode-toggle'),
  }
})
console.log('LIVE-3D', JSON.stringify(r))
console.log('ERRORS', JSON.stringify(errs.slice(0,8)))
// also confirm ?lite=0 forces 3D
const p2 = await b.newPage({ viewport:{width:390,height:844} })
await p2.goto(U+'?lite=0',{waitUntil:'domcontentloaded'}); await p2.waitForTimeout(1500)
console.log('LITE0-CLASS', await p2.evaluate(()=>document.documentElement.className))
await b.close()
