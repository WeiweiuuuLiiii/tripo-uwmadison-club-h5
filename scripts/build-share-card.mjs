import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// 1) crop the helmet + spotlight cone + pedestal out of the app capture (1800×1800)
await sharp('/tmp/helmet_raw.png')
  .extract({ left: 470, top: 96, width: 860, height: 1040 })
  .toFile('/tmp/helmet_crop.png')
const heroB64 = 'data:image/png;base64,' + readFileSync('/tmp/helmet_crop.png').toString('base64')

// 2) compose the titanium share card (browser render → perfect CJK + layout)
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; box-sizing:border-box; }
  html,body { width:800px; height:800px; overflow:hidden; }
  .card { position:relative; width:800px; height:800px;
    background: radial-gradient(72% 60% at 50% 36%, #161b21 0%, #0a0d11 58%, #06080b 100%);
    font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',-apple-system,sans-serif; color:#e9edf2; }
  .grid { position:absolute; inset:0; opacity:.5;
    background-image:linear-gradient(rgba(184,192,200,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(184,192,200,.05) 1px,transparent 1px);
    background-size:46px 46px; }
  .frame { position:absolute; inset:26px; border:1px solid rgba(184,192,200,.16); border-radius:26px; }
  .glow { position:absolute; left:50%; top:33%; width:540px; height:540px; transform:translate(-50%,-50%);
    background:radial-gradient(circle, rgba(110,231,255,.18), transparent 62%); }
  .hero { position:absolute; left:50%; top:39%; transform:translate(-50%,-50%); width:508px; }
  .hero img { width:100%; display:block; }
  .fade { position:absolute; left:0; right:0; bottom:0; height:360px;
    background:linear-gradient(180deg, transparent, #06080b 70%); }
  .kicker { position:absolute; top:66px; left:0; right:0; text-align:center;
    font-family:ui-monospace,Menlo,monospace; font-size:21px; letter-spacing:.34em; color:#b8c0c8; }
  .kicker .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#6ee7ff; vertical-align:middle; margin:0 14px; box-shadow:0 0 12px #6ee7ff; }
  .title { position:absolute; left:0; right:0; bottom:212px; text-align:center; font-size:88px; font-weight:800; letter-spacing:-.02em; color:#f4f7fb; text-shadow:0 4px 40px rgba(0,0,0,.6); }
  .title .ice { color:#6ee7ff; }
  .rule { position:absolute; left:50%; bottom:186px; transform:translateX(-50%); width:70px; height:2px; background:linear-gradient(90deg,transparent,#6ee7ff,transparent); }
  .sub { position:absolute; left:0; right:0; bottom:120px; text-align:center; font-size:38px; font-weight:700; letter-spacing:.08em; color:#eef3f7; }
  .tag { position:absolute; left:0; right:0; bottom:70px; text-align:center; font-family:ui-monospace,Menlo,monospace; font-size:17px; letter-spacing:.24em; color:#8b96a0; }
</style></head><body>
  <div class="card">
    <div class="grid"></div>
    <div class="glow"></div>
    <div class="hero"><img src="${heroB64}"/></div>
    <div class="fade"></div>
    <div class="frame"></div>
    <div class="kicker">UW–MADISON<span class="dot"></span>TRIPO</div>
    <div class="title">TRIPO <span class="ice">AI&nbsp;3D</span></div>
    <div class="rule"></div>
    <div class="sub">2026 秋季招新</div>
    <div class="tag">IMMERSIVE&nbsp;3D&nbsp;·&nbsp;沉浸式招新</div>
  </div>
</body></html>`
writeFileSync('/tmp/share-card.html', html)

const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 })
await p.goto('file:///tmp/share-card.html', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.screenshot({ path: '/tmp/share-card.png' })
await b.close()

// 3) → JPG (WeChat-friendly), reasonable size
await sharp('/tmp/share-card.png').resize(800, 800).jpeg({ quality: 88, mozjpeg: true }).toFile('public/share-2026-800.jpg')
console.log('share-2026-800.jpg', (readFileSync('public/share-2026-800.jpg').length / 1024).toFixed(0) + 'KB')
