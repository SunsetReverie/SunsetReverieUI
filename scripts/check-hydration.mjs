#!/usr/bin/env node
/**
 * Nuxt 水合校验
 *
 * 启动构建产物，逐个访问冒烟页，断言：
 * 1. 服务端返回的 HTML 里已有组件结构（说明 SSR 真的渲染了）
 * 2. 客户端水合完成后，水合告警计数为 0
 *
 * 为什么必须做成 e2e：水合不匹配只在「服务端 HTML + 客户端接管」这两个阶段
 * 同时存在时才会暴露，单测里用 renderToString 只能证明服务端不抛错。
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from '@playwright/test'

const PORT = Number(process.env.SR_HYDRATION_PORT ?? 4319)
const BASE = `http://localhost:${PORT}`
const ROOT = new URL('..', import.meta.url).pathname

/** 页面清单：路径与至少要出现的选择器 */
const PAGES = [
  { path: '/', name: '首页', selector: '.page' },
  { path: '/smoke', name: '组件冒烟', selector: '.smoke__grid' },
]

/**
 * 启动 nitro 产物服务器
 * @returns {import('node:child_process').ChildProcess}
 */
function startServer() {
  return spawn(process.execPath, ['playground-nuxt4/.output/server/index.mjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), NITRO_PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: 'ignore',
  })
}

/**
 * 等待服务可用
 * @param {number} timeout 超时毫秒
 */
async function waitForServer(timeout = 30_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`)
      if (res.ok) return
    } catch {
      // 还没起来，继续等
    }
    await sleep(300)
  }
  throw new Error(`服务在 ${timeout}ms 内没有就绪`)
}

/**
 * 运行校验
 */
async function main() {
  const server = startServer()
  let browser
  let failed = 0

  try {
    await waitForServer()
    browser = await chromium.launch({ channel: 'msedge' })

    for (const target of PAGES) {
      const page = await browser.newPage()
      /** 控制台里出现 hydration 字样的告警 */
      const consoleWarnings = []

      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          const text = msg.text()
          if (/hydrat/i.test(text)) consoleWarnings.push(text.slice(0, 200))
        }
      })
      page.on('pageerror', (error) => {
        consoleWarnings.push(`pageerror: ${error.message.slice(0, 200)}`)
      })

      const response = await page.goto(`${BASE}${target.path}`, { waitUntil: 'networkidle' })
      const html = await response?.text()

      // 1) 服务端输出里必须有组件结构
      const ssrRendered = Boolean(html?.includes(target.selector.replace('.', 'class="')))
      if (!ssrRendered) {
        console.error(`✗ ${target.name}：服务端 HTML 里没找到 ${target.selector}`)
        failed += 1
      }

      // 2) 等页面把水合告警数暴露出来
      await page.waitForSelector('[data-hydration-count]', { timeout: 8000 })
      // 告警是在水合过程中异步 push 的，等一拍让响应式更新落到 DOM 上
      await page.waitForTimeout(400)

      const result = await page.$eval('[data-hydration-count]', (el) => ({
        count: Number(el.getAttribute('data-count')),
        hydrated: el.getAttribute('data-hydrated'),
      }))

      const ok = result.count === 0 && result.hydrated === '1' && consoleWarnings.length === 0
      if (!ok) {
        console.error(`✗ ${target.name}：告警 ${result.count} 条，水合态 ${result.hydrated}`)
        for (const item of consoleWarnings.slice(0, 5)) console.error(`   ${item}`)
        failed += 1
      } else {
        console.log(`✓ ${target.name}：SSR 已渲染，水合无告警`)
      }

      await page.close()
    }
  } finally {
    await browser?.close()
    server.kill('SIGTERM')
  }

  if (failed > 0) {
    console.error(`\n水合校验失败：${failed} 个页面有问题`)
    process.exit(1)
  }

  console.log('\n水合校验通过')
}

await main()
