#!/usr/bin/env node
/**
 * 演示站冒烟体检
 *
 * 原版把端口写死在 4192（vite 实际是 5173），只打开一个 anchor 页、只截图、
 * 有错误也照样 exit 0 —— 等于没接进任何防线。这里改成：
 *   - 端口跟 vite 配置一致，可用 DEMO_PORT 覆盖
 *   - `node scripts/check-demo.mjs --all` 遍历注册表里全部演示页
 *   - 每页断言标题渲染出来，并收集 pageerror / console.error
 *   - 有任一页失败就 exit(1)，可直接挂 CI
 *
 * 用法：先 `pnpm dev`，再
 *   node scripts/check-demo.mjs --all [--shot]
 *   node scripts/check-demo.mjs button tabs
 *
 * 退出码：0 全部通过；1 有页面报错或渲染失败。
 */

import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const REGISTRY = 'playground-vue3/src/demos/registry.ts'
const PORT = Number(process.env.DEMO_PORT ?? 5173)
const BASE = `http://localhost:${PORT}`
const args = process.argv.slice(2)
const all = args.includes('--all')
const shot = args.includes('--shot')
const named = args.filter((item) => !item.startsWith('--'))

/**
 * 从注册表读出全部演示 key
 * @returns 演示 key 列表
 */
function readDemoKeys() {
  const code = readFileSync(REGISTRY, 'utf-8')
  return [...code.matchAll(/\bkey: '([^']+)'/g)].map((match) => match[1])
}

const routes = all ? readDemoKeys() : named.length ? named : ['anchor']

const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch())
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })

const failures = []
let errors = []
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message.slice(0, 200)}`))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text().slice(0, 200)}`)
})

/**
 * 体检单个演示页
 * @param key 注册表中的演示 key
 * @returns 该页的错误列表（空数组表示通过）
 */
async function checkPage(key) {
  errors = []
  try {
    // query 带上 key：hash 变化不会重载页面，旧页面的标题会让断言「假通过」
    await page.goto(`${BASE}/?page=${key}#/c/${key}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForSelector('.demo-page__title', { timeout: 10000 })
    // 异步演示组件与源码按钮都挂上之后再收错误，避免把加载中的噪声算进来
    await page.waitForTimeout(220)

    const title = (await page.locator('.demo-page__title').innerText()).trim()
    if (!title) errors.push('标题为空')
    if (!(await page.locator('.demo-page__source').count())) errors.push('缺少示例源码入口')

    if (shot) await page.screenshot({ path: `/tmp/demo-check-${key}.png` })
  } catch (error) {
    errors.push(`打开失败: ${error.message.slice(0, 160)}`)
  }
  return errors.map((text) => `${key}: ${text}`)
}

for (const key of routes) {
  const found = await checkPage(key)
  failures.push(...found)
}

await browser.close()

if (failures.length) {
  console.error(`\n[演示体检] ${routes.length} 页里 ${failures.length} 处问题：\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  console.error('\n先确认 pnpm dev 已启动，或设置 DEMO_PORT 指向实际端口。\n')
  process.exit(1)
}

console.log(`[演示体检] 通过（${routes.length} 个演示页，无控制台错误 / 渲染失败）`)
