#!/usr/bin/env node
/**
 * 布局守卫（浏览器级）
 *
 * 静态检查只能证明「文档写了、链接没断」，证不了「页面真的排得下」。
 * 这次排查里出现过两类只在浏览器里才暴露的问题：
 *   1. 演示块里的表格 / 标签页没有可滚动容器，直接把页面撑出横向滚动条
 *   2. SSR 页面水合不匹配，控制台刷 hydration 告警，肉眼看不出来
 * 两者都不会让构建失败，只能靠浏览器抓。这里把这两条固化成检查：
 *
 *   - 页面级：`scrollWidth > clientWidth` 即出现横向滚动 → 记一条
 *   - 演示块级：`.sr-demo`（文档站）/ `.demo > section`（演示站）的子元素
 *     越过容器右边界，且路径上没有任何 `overflow-x: auto|scroll|hidden|clip`
 *     的祖先容器（那种是「本来就该滚」的表格 / 走马灯）→ 记一条
 *   - 控制台：error 一律算问题；warning 里带 hydration 字样的也算
 *     （`/components/image` 故意用一个不存在的图片演示兜底，404 已放行）
 *
 * 用法：
 *   node scripts/check-layout.mjs            # 文档站 + 演示站
 *   node scripts/check-layout.mjs --docs     # 只查文档站
 *   node scripts/check-layout.mjs --demo     # 只查演示站
 *   node scripts/check-layout.mjs table      # 只查名字里带 table 的页
 *
 * 两个站都是「探到就复用、探不到自己起」：
 *   - 文档站默认 5190（DOCS_PORT 覆盖）
 *   - 演示站默认 5174（DEMO_PORT 覆盖）
 * 自己起的进程退出时会连带杀掉子进程，不需要手动收拾。
 *
 * 退出码：0 通过；1 有页面报错 / 溢出 / 水合告警。
 */

import { spawn } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from '@playwright/test'

const ROOT = new URL('..', import.meta.url).pathname
const REGISTRY = 'playground-vue3/src/demos/registry.ts'

/** 控制台里属于「演示本身就要的失败」的消息，不算回归 */
const CONSOLE_ALLOW = [/favicon/i, /not-exist/i]

const args = process.argv.slice(2)
const onlyDocs = args.includes('--docs')
const onlyDemo = args.includes('--demo')
const filters = args.filter((item) => !item.startsWith('--'))

/**
 * 读演示注册表里的全部 key
 * @returns {string[]} 演示 key 列表
 */
function readDemoKeys() {
  const code = readFileSync(REGISTRY, 'utf-8')
  return [...code.matchAll(/\bkey: '([^']+)'/g)].map((match) => match[1])
}

/**
 * 文档站路由清单：首页 + 组件总览 + 全部指南页 + 全部组件页
 * @returns {string[]} 以 `/` 开头的路由列表
 */
function readDocsRoutes() {
  const guides = readdirSync('docs/guide')
    .filter((file) => file.endsWith('.md'))
    .map((file) => `/guide/${file.slice(0, -3)}`)
  const components = readdirSync('docs/components')
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => `/components/${file.slice(0, -3)}`)
  return ['/', '/components/', ...guides, ...components]
}

/**
 * 构造要检查的目标站
 * @returns {Array<{ name: string, url: string, routes: string[], command: [string, string[]] }>}
 */
function buildTargets() {
  const targets = []
  const docsPort = Number(process.env.DOCS_PORT ?? 5190)
  const demoPort = Number(process.env.DEMO_PORT ?? 5174)

  if (!onlyDemo) {
    targets.push({
      name: '文档站',
      url: `http://localhost:${docsPort}`,
      routes: readDocsRoutes(),
      command: [
        'pnpm',
        ['--filter', '@sunset-reverie/docs', 'exec', 'vitepress', 'dev', '--port', String(docsPort)],
      ],
    })
  }

  if (!onlyDocs) {
    targets.push({
      name: '演示站',
      url: `http://localhost:${demoPort}`,
      routes: readDemoKeys().map((key) => `/?page=${key}#/c/${key}`),
      command: ['pnpm', ['--filter', 'playground-vue3', 'exec', 'vite', '--port', String(demoPort)]],
    })
  }

  return targets
}

/**
 * 探测服务是否已经就绪
 * @param {string} url 站点根地址
 * @returns {Promise<boolean>} 可访问为 true
 */
async function isServing(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 等 dev server 起来
 * @param {string} url 站点根地址
 * @param {number} timeout 超时毫秒
 * @returns {Promise<void>}
 */
async function waitForServer(url, timeout = 90_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await isServing(url)) return
    await sleep(500)
  }
  throw new Error(`${url} 在 ${timeout}ms 内没有就绪`)
}

/**
 * 确保站点在跑：已在跑就复用，否则起一个 dev server
 * @param {{ name: string, url: string, command: [string, string[]] }} target 目标站
 * @returns {Promise<() => void>} 停止函数；复用的服务返回空操作
 */
async function ensureServer(target) {
  if (await isServing(target.url)) {
    console.log(`[布局守卫] ${target.name} 复用 ${target.url}`)
    return () => {}
  }

  const [bin, argv] = target.command
  console.log(`[布局守卫] ${target.name} 未启动，正在拉起 ${bin} ${argv.join(' ')}`)
  // detached 让 pnpm → vite / vitepress 的子进程同属一个进程组，退出时一起收掉
  const child = spawn(bin, argv, { cwd: ROOT, stdio: 'ignore', detached: true })
  child.unref()

  await waitForServer(target.url)
  return () => {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      // 进程已经退出了，忽略
    }
  }
}

/**
 * 在页面里测量横向溢出
 *
 * 判定规则刻意偏保守，只报「确实被裁掉或撑出滚动条」的元素：
 *   - 页面上任何可见元素都不可能免费越界，越界就一定有人没设 overflow
 *   - 但表格 / 走马灯自己带 `overflow: auto` 的，子元素越界是设计如此
 *   - `position: fixed` 的浮层是相对视口定位的，跟容器宽度无关
 *
 * @returns {string[]} 问题描述，空数组表示这一页排版正常
 */
function measureOverflowInPage() {
  const TOLERANCE = 1
  const issues = []

  /**
   * 判断元素到容器之间的路径上有没有「会裁剪横向溢出」的祖先
   * @param {Element} element 被检查的元素
   * @param {Element} boundary 演示块容器
   * @returns {boolean} 有裁剪容器则为 true
   */
  function isClipped(element, boundary) {
    let node = element.parentElement
    while (node && node !== boundary) {
      const overflowX = getComputedStyle(node).overflowX
      if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden' || overflowX === 'clip') {
        return true
      }
      node = node.parentElement
    }
    return false
  }

  /**
   * 给元素拼一个短标签，方便定位
   * @param {Element} element 元素
   * @returns {string} 形如 `div.sr-table__wrapper`
   */
  function label(element) {
    const tag = element.tagName.toLowerCase()
    // SVG 元素的 className 是 SVGAnimatedString，取属性才拿得到字符串
    const raw = element.getAttribute('class') || ''
    const cls = raw.split(/\s+/).filter(Boolean)[0]
    return cls ? `${tag}.${cls}` : tag
  }

  /**
   * 判断元素到容器的路径上（含自身）是否有「刻意越出容器」的声明
   *
   * 两种都会被误判成排版溢出，但都是设计如此：
   *   - transform：旋转 / 缩放中的图标（spinner），外接矩形随动画帧涨缩
   *   - 负 margin：栅格的出血补偿（SrRow 用它抵消 SrCol 的水平 padding），
   *     列的实际内容正好贴齐容器边缘，只是边框盒向外多出半个 gutter
   *
   * @param {Element} element 元素
   * @param {Element} boundary 演示块容器
   * @returns {boolean} 有刻意越界声明则为 true
   */
  function isDeliberate(element, boundary) {
    let node = element
    while (node && node !== boundary) {
      const style = getComputedStyle(node)
      if (style.transform !== 'none') return true
      if (parseFloat(style.marginLeft) < 0 || parseFloat(style.marginRight) < 0) return true
      node = node.parentElement
    }
    return false
  }

  // 1) 页面级横向滚动
  const doc = document.documentElement
  if (doc.scrollWidth - doc.clientWidth > TOLERANCE) {
    issues.push(`页面出现横向滚动（scrollWidth ${doc.scrollWidth} > clientWidth ${doc.clientWidth}）`)
  }

  // 2) 演示块内部的横向溢出
  const containers = [...document.querySelectorAll('.sr-demo, .demo > section')]
  for (const container of containers) {
    const box = container.getBoundingClientRect()
    if (!box.width) continue

    // 容器自己就是滚动容器时，里面的内容越界由滚动消化
    const containerOverflowX = getComputedStyle(container).overflowX
    if (containerOverflowX === 'auto' || containerOverflowX === 'scroll') continue

    /** 已经被判定越界的元素，避免父子重复报 */
    const flagged = new Set()

    for (const element of container.querySelectorAll('*')) {
      if (flagged.has(element)) continue

      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) continue

      const style = getComputedStyle(element)
      if (style.position === 'fixed') continue
      if (isDeliberate(element, container)) continue
      if (isClipped(element, container)) continue

      const overRight = rect.right - box.right
      const overLeft = box.left - rect.left
      if (overRight <= TOLERANCE && overLeft <= TOLERANCE) continue

      let parent = element.parentElement
      while (parent) {
        if (flagged.has(parent)) break
        parent = parent.parentElement
      }
      if (parent) {
        flagged.add(element)
        continue
      }

      flagged.add(element)
      const amount = Math.round(Math.max(overRight, overLeft))
      issues.push(`演示块内的 ${label(element)} 越界 ${amount}px`)
    }
  }

  return issues.slice(0, 5)
}

/**
 * 体检单个页面
 *
 * @param {import('@playwright/test').Page} page Playwright 页面
 * @param {string} url 完整地址
 * @returns {Promise<string[]>} 问题列表，空数组表示通过
 */
async function checkPage(page, url) {
  const messages = []
  const pending = []

  /**
   * 收集控制台问题
   * @param {import('@playwright/test').ConsoleMessage} message 控制台消息
   * @returns {void}
   */
  const onConsole = (message) => {
    const type = message.type()
    const text = message.text()
    const from = message.location()?.url ?? ''
    if (CONSOLE_ALLOW.some((pattern) => pattern.test(text) || pattern.test(from))) return

    if (type === 'error') pending.push(`控制台错误：${text.slice(0, 160)}`)
    else if ((type === 'warning' || type === 'error') && /hydrat/i.test(text)) {
      pending.push(`水合告警：${text.slice(0, 160)}`)
    }
  }
  /** @param {Error} error 未捕获异常 */
  const onError = (error) => pending.push(`运行时报错：${error.message.slice(0, 160)}`)

  page.on('console', onConsole)
  page.on('pageerror', onError)

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    // 等首屏结构出现：文档站是 .vp-doc，演示站是 .demo-page__title
    await page.waitForSelector('.vp-doc, .demo-page__title, .VPHero', { timeout: 15_000 })
    // 演示组件是懒加载的，挂载后再等一拍让布局稳定
    await page.waitForTimeout(350)

    const overflow = await page.evaluate(measureOverflowInPage)
    messages.push(...overflow)
  } catch (error) {
    messages.push(`打开失败：${error.message.slice(0, 160)}`)
  }

  // 控制台消息可能比布局晚一拍到达：再等一拍才摘监听、收口
  await page.waitForTimeout(80)
  page.off('console', onConsole)
  page.off('pageerror', onError)
  messages.push(...pending)

  return [...new Set(messages)]
}

/**
 * 跑完一个目标站
 * @param {import('@playwright/test').Browser} browser 浏览器实例
 * @param {{ name: string, url: string, routes: string[] }} target 目标站
 * @returns {Promise<Array<{ page: string, issues: string[] }>>} 失败列表
 */
async function checkTarget(browser, target) {
  const failures = []
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  let routes = target.routes
  if (filters.length) {
    routes = routes.filter((route) => filters.some((filter) => route.includes(filter)))
  }

  for (const route of routes) {
    const issues = await checkPage(page, target.url + route)
    if (issues.length) failures.push({ page: route, issues })
  }

  await page.close()
  console.log(`[布局守卫] ${target.name}：检查 ${routes.length} 页，异常 ${failures.length} 页`)
  return failures
}

// ---------- 主流程 ----------
const targets = buildTargets()
const stops = []
let browser
let totalFailures = []

try {
  for (const target of targets) stops.push(await ensureServer(target))

  browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch())

  for (const target of targets) {
    totalFailures = totalFailures.concat(await checkTarget(browser, target))
  }
} finally {
  await browser?.close()
  for (const stop of stops) stop()
}

if (totalFailures.length) {
  console.error(`\n[布局守卫] 发现 ${totalFailures.length} 页有问题：\n`)
  for (const failure of totalFailures) {
    console.error(`  ${failure.page}`)
    for (const issue of failure.issues) console.error(`    - ${issue}`)
  }
  console.error('\n溢出多半是缺了可滚动容器；水合告警看服务端与客户端首次渲染是否一致。\n')
  process.exit(1)
}

console.log(`[布局守卫] 通过（${targets.length} 个站，无横向溢出 / 控制台错误 / 水合告警）`)
