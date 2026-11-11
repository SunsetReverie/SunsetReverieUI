#!/usr/bin/env node
/**
 * 产物体积报告 + 预算守卫
 *
 * 规划里「产物体积达标」一直是句空话：文档写着全量 120~160KB gzip，
 * 但那是 34 个组件时期的估算，从没有人真的测过。组件涨到 69 个之后，
 * 下游拿到手到底多大、按需引入能省多少，全靠猜。
 *
 * 这里把口径固定下来，两种情况各自算一遍：
 *   - 全量：从 `dist/index.js` 出发的 import 闭包（install 全量注册时真会加载的代码）
 *           + `dist/style.css`
 *   - 按需：某个组件 `components/<n>/index.js` 的 import 闭包
 *           + 该组件的 `style.css` + 必引的 `base.css`
 *
 * 算法：逐个文件单独 gzip 后求和。比「合并成一个文件再压」略大（每个文件各有
 * gzip 头，也不跨文件复用字典），对预算判定来说是偏保守的方向。
 *
 * 预算值不是拍脑袋：先实测一轮，再取整到「当前值 + 一点余量」，
 * 目的是拦住下一次悄悄膨胀，而不是追求一个好看的数字。
 *
 * 用法：
 *   node scripts/check-size.mjs          # 报告 + 判预算
 *   node scripts/check-size.mjs --json   # 只输出 JSON，给 CI 或其它脚本用
 *
 * 退出码：0 未超预算；1 有项目超预算。
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'packages/ui/dist')

/**
 * 预算（KB，gzip）。超了就是回归，不是「参考值」。
 *
 * 69 个组件时实测：全量 JS 254.2 / CSS 49.3 / 合计 303.5，按需最重 67.4（comment，
 * 它自己依赖 textarea + emoji-picker + music-player 一套）。这里各留约 5% 余量。
 */
const BUDGET = {
  fullJs: 268,
  fullCss: 51,
  fullTotal: 320,
  requiredMax: 72,
}

/** 报告里单独列出的按需样本，覆盖「最小原子组件」到「最重业务组件」 */
const SAMPLES = ['button', 'input', 'table', 'markdown-editor']

/**
 * 沿相对 import 收集 JS 闭包
 *
 * 只跟随以 `./`、`../` 开头的相对路径：Vue 等外部依赖由下游提供，
 * 不该算进本包的体积。
 *
 * @param {string} entry 入口文件的绝对路径
 * @returns {string[]} 闭包内全部文件的绝对路径（已去重）
 */
function collectJsClosure(entry) {
  const visited = new Set()
  const queue = [entry]

  while (queue.length > 0) {
    const file = queue.pop()
    if (visited.has(file) || !existsSync(file)) continue
    visited.add(file)

    const code = readFileSync(file, 'utf-8')
    for (const match of code.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      const spec = match[1]
      if (!spec.startsWith('.')) continue
      const target = resolve(dirname(file), spec)
      if (existsSync(target)) queue.push(target)
    }
  }

  return [...visited]
}

/**
 * 逐文件 gzip 求和
 * @param {string[]} files 文件绝对路径列表
 * @returns {number} 字节数
 */
function gzipBytes(files) {
  let total = 0
  for (const file of files) total += gzipSync(readFileSync(file)).length
  return total
}

/**
 * 字节转 KB，保留一位小数
 * @param {number} bytes 字节数
 * @returns {number} KB
 */
function toKB(bytes) {
  return Math.round((bytes / 1024) * 10) / 10
}

/**
 * 算一个组件的按需体积
 * @param {string} name 组件目录名，如 `button`
 * @returns {{ name: string, js: number, css: number, total: number }} 体积（KB）
 */
function measureComponent(name) {
  const entry = join(DIST, 'components', name, 'index.js')
  const style = join(DIST, 'components', name, 'style.css')
  const base = join(DIST, 'base.css')

  if (!existsSync(entry)) {
    throw new Error(`找不到组件入口 ${entry}，先执行 pnpm build:ui`)
  }

  const js = toKB(gzipBytes(collectJsClosure(entry)))
  const css = toKB(gzipBytes([style, base].filter((file) => existsSync(file))))

  return { name, js, css, total: Math.round((js + css) * 10) / 10 }
}

// ---------- 全量 ----------
const fullEntry = join(DIST, 'index.js')
const fullStyle = join(DIST, 'style.css')

if (!existsSync(fullEntry) || !existsSync(fullStyle)) {
  console.error('[体积报告] 产物缺失，先执行 pnpm build')
  process.exit(1)
}

const fullJsFiles = collectJsClosure(fullEntry)
const fullCssFiles = [fullStyle]
const fullJs = toKB(gzipBytes(fullJsFiles))
const fullCss = toKB(gzipBytes(fullCssFiles))
const fullTotal = Math.round((fullJs + fullCss) * 10) / 10

// ---------- 按需 ----------
const samples = SAMPLES.map((name) => measureComponent(name))

// 全部组件里最重的那一个：预算按它来定，避免「没人用的组件」把线拉爆
let requiredMax = { name: '', js: 0, css: 0, total: 0 }
const componentDir = join(DIST, 'components')
const allNames = readdirSync(componentDir).filter((name) => existsSync(join(componentDir, name, 'index.js')))

for (const name of allNames) {
  const measured = measureComponent(name)
  if (measured.total > requiredMax.total) requiredMax = measured
}

const report = {
  full: { js: fullJs, css: fullCss, total: fullTotal, files: fullJsFiles.length },
  samples,
  requiredMax,
  budget: BUDGET,
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

// ---------- 输出 ----------
const rows = []
const violations = []

/**
 * 收一行报告并顺带判预算
 * @param {string} label 行标签
 * @param {number} value 实测 KB
 * @param {number} limit 预算 KB
 * @returns {void}
 */
function row(label, value, limit) {
  const over = value > limit
  if (over) violations.push(`${label} 超预算：${value}KB > ${limit}KB`)
  rows.push(
    `${label.padEnd(26)} ${String(value).padStart(7)}KB   预算 ${String(limit).padStart(4)}KB   ${over ? '✗' : '✓'}`,
  )
}

console.log('\n[体积报告] 全量引入（不含 Vue）')
console.log(`  入口 ${fullJsFiles.length} 个 JS 文件 + style.css`)
row('  全量 JS', fullJs, BUDGET.fullJs)
row('  全量 CSS', fullCss, BUDGET.fullCss)
row('  全量合计', fullTotal, BUDGET.fullTotal)

console.log('\n[体积报告] 按需引入（组件 JS 闭包 + 组件 CSS + base.css）')
for (const item of samples) {
  console.log(`  ${item.name.padEnd(20)} JS ${item.js}KB + CSS ${item.css}KB = ${item.total}KB`)
}
row('  按需最重（' + requiredMax.name + '）', requiredMax.total, BUDGET.requiredMax)

console.log('')
for (const line of rows) console.log(`  ${line}`)

if (violations.length > 0) {
  console.error(`\n[体积报告] 有 ${violations.length} 项超预算：`)
  for (const item of violations) console.error(`  - ${item}`)
  console.error('\n体积涨了就先确认是不是新组件本身带来的；确认合理就同步上调 BUDGET，别让它变成摆设。\n')
  process.exit(1)
}

console.log(`\n[体积报告] 通过（全量 ${fullTotal}KB gzip，按需最重 ${requiredMax.total}KB）`)
