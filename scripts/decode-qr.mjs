import { readFileSync } from 'fs'
import jpeg from 'jpeg-js'
import jsQR from 'jsqr'
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} from '@zxing/library'

const file = process.argv[2] || 'public/qr-host-wechat.jpg'
const raw = jpeg.decode(readFileSync(file), { useTArray: true, formatAsRGBA: true })
const { data, width, height } = raw
console.log(`image ${width}x${height}`)

// --- jsQR attempts (with inversion) ---
const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length)
for (const inv of ['dontInvert', 'onlyInvert', 'attemptBoth']) {
  try {
    const r = jsQR(clamped, width, height, { inversionAttempts: inv })
    console.log(`jsQR[${inv}]: ${r ? 'OK -> ' + r.data : 'fail'}`)
    if (r) break
  } catch (e) {
    console.log(`jsQR[${inv}]: error ${e?.message || e}`)
  }
}

// --- ZXing (TRY_HARDER + PURE_BARCODE off) on RGB luminance ---
try {
  // RGBLuminanceSource expects a luminance/int32 array or RGB; build luminance.
  const lum = new Uint8ClampedArray(width * height)
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    lum[j] = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
  }
  const source = new RGBLuminanceSource(lum, width, height)
  const bitmap = new BinaryBitmap(new HybridBinarizer(source))
  const reader = new MultiFormatReader()
  const hints = new Map()
  hints.set(DecodeHintType.TRY_HARDER, true)
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE])
  const result = reader.decode(bitmap, hints)
  console.log('ZXing: OK -> ' + result.getText())
} catch (e) {
  console.log('ZXing: fail (' + (e?.message || e) + ')')
}
