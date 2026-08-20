import { chromium } from 'playwright-core'
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import jpeg from 'jpeg-js'
import {
  MultiFormatReader, BarcodeFormat, DecodeHintType,
  RGBLuminanceSource, BinaryBitmap, HybridBinarizer,
} from '@zxing/library'

const require = createRequire(import.meta.url)
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'

const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto(URL, { waitUntil: 'networkidle' })
const h = await p.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= h; y += 500) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(90) }
await p.evaluate(() => window.scrollTo(0, 0))
await p.waitForTimeout(400)
await p.screenshot({ path: '/tmp/tripo-final-full.png', fullPage: true })

// decode the LIVE-served QR with ZXing
const buf = readFileSync(require.resolve('../public/qr-host-wechat.jpg'))
const raw = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true })
const lum = new Uint8ClampedArray(raw.width * raw.height)
for (let i = 0, j = 0; i < raw.data.length; i += 4, j++) lum[j] = (raw.data[i] * 299 + raw.data[i + 1] * 587 + raw.data[i + 2] * 114) / 1000
const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(lum, raw.width, raw.height)))
const reader = new MultiFormatReader()
const hints = new Map(); hints.set(DecodeHintType.TRY_HARDER, true); hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE])
try { console.log('ZXING_QR=' + reader.decode(bitmap, hints).getText()) } catch (e) { console.log('ZXING_QR=fail') }
console.log('FULL_SHOT=/tmp/tripo-final-full.png')
await b.close()
