import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync } from 'fs'

const URL = process.argv[2] || 'https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const chrome = await chromeLauncher.launch({
  chromePath: CHROME,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
})

const result = await lighthouse(
  URL,
  { logLevel: 'error', output: 'json', port: chrome.port },
  {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 562.5,
        downloadThroughputKbps: 1474.56,
        uploadThroughputKbps: 675,
      },
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    },
  },
)

await chrome.kill()

const c = result.lhr.categories
const line = (k) => `${k}: ${Math.round((c[k].score ?? 0) * 100)}`
console.log('LIGHTHOUSE (mobile) —', URL)
console.log(line('performance'))
console.log(line('accessibility'))
console.log(line('best-practices'))
console.log(line('seo'))

const a = result.lhr.audits
const metric = (id) => (a[id] ? `${a[id].displayValue ?? a[id].score}` : 'n/a')
console.log('--- metrics ---')
console.log('FCP:', metric('first-contentful-paint'))
console.log('LCP:', metric('largest-contentful-paint'))
console.log('TBT:', metric('total-blocking-time'))
console.log('CLS:', metric('cumulative-layout-shift'))
console.log('Speed Index:', metric('speed-index'))

writeFileSync('/tmp/lh.json', JSON.stringify(result.lhr, null, 0))
