/**
 * 演示站快速体检
 *
 * 只做三件事：打开页面、收集控制台错误、截一张图。
 * 用法：node scripts/check-demo.mjs [路由]
 */

import { chromium } from '@playwright/test'

const route = process.argv[2] ?? 'anchor'
const url = `http://localhost:4192/#/c/${route}`

const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch())
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 })

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`)
})

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 })
await page.waitForTimeout(2500)

const stats = {
  route,
  sections: await page.locator('.demo-page section').count(),
  anchors: await page.locator('.demo-page .sr-anchor').count(),
  bodyText: (
    await page
      .locator('body')
      .innerText()
      .catch(() => '')
  )
    .slice(0, 60)
    .replace(/\n/g, ' '),
}

console.log(JSON.stringify({ ...stats, errors }, null, 1))

await page.screenshot({ path: '/tmp/demo-check.png' })
await browser.close()
