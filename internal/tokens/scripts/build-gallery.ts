/**
 * Token Gallery 生成器
 *
 * 把 template/gallery.html 里的占位符替换为 token 数据，产出单文件静态页。
 *
 * 为什么必须生成而不能手写：页面里的色值与圆角一旦手写，就成了第二份真相。
 * tokens.ts / semantic.ts 改动后重新生成，页面自动同步。
 *
 * 产物：docs/public/token-gallery.html（VitePress 建站后可直接访问 /token-gallery.html）
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  distances,
  durations,
  easings,
  fontSizes,
  lineHeights,
  palette,
  paletteSeries,
  paletteSteps,
  spacings,
} from '../src/tokens'
import {
  qualityFlat,
  qualityGlass,
  semanticDark,
  semanticLight,
  shadowDarkFlat,
  structural,
  themedDarkGlass,
} from '../src/semantic'

const HERE = dirname(fileURLToPath(import.meta.url))
const TEMPLATE = resolve(HERE, '../template/gallery.html')
const OUT_FILE = resolve(HERE, '../../../docs/public/token-gallery.html')

/**
 * 把语义层键值对渲染为 CSS 声明
 * @param map 键不含 --sr- 前缀
 * @param indent 缩进
 * @returns CSS 声明文本
 */
function toDecls(map: Record<string, string>, indent = '  '): string {
  return Object.entries(map)
    .map(([key, value]) => `${indent}--sr-${key}: ${value};`)
    .join('\n')
}

/**
 * 渲染 L1 原始层声明：色板 + 间距 + 字号 + 动效
 * 这些值不随主题变化，只在 :root 出现一次
 * @param indent 缩进
 * @returns CSS 声明文本
 */
function buildL1Decls(indent = '  '): string {
  const lines: string[] = []

  lines.push(`${indent}/* ---------- L1 原始色板（随主题不变） ---------- */`)
  for (const series of paletteSeries) {
    const ramp = palette[series.key]
    if (!ramp) continue
    lines.push(`${indent}/* ${series.key} · ${series.label}（${series.role}） */`)
    for (const step of paletteSteps) {
      const color = ramp[step]
      if (!color) continue
      lines.push(`${indent}--sr-${series.key}-${step}: ${color.toLowerCase()};`)
    }
  }

  lines.push('', `${indent}/* ---------- 间距 ---------- */`)
  for (const item of spacings) {
    lines.push(`${indent}--sr-space-${item.name}: ${item.value}px;`)
  }

  lines.push('', `${indent}/* ---------- 字号 / 行高 ---------- */`)
  for (const [key, size] of Object.entries(fontSizes)) {
    lines.push(`${indent}--sr-font-size-${key}: ${size}px;`)
  }
  for (const [key, height] of Object.entries(lineHeights)) {
    lines.push(`${indent}--sr-line-height-${key}: ${height}px;`)
  }

  lines.push('', `${indent}/* ---------- 动效 ---------- */`)
  for (const [key, value] of Object.entries(durations)) {
    lines.push(`${indent}--sr-motion-duration-${key}: ${value}ms;`)
  }
  for (const [key, value] of Object.entries(easings)) {
    lines.push(`${indent}--sr-motion-easing-${key}: ${value};`)
  }
  for (const [key, value] of Object.entries(distances)) {
    lines.push(`${indent}--sr-motion-distance-${key}: ${value}px;`)
  }

  return lines.join('\n')
}

/**
 * 渲染色系数据结构为 JS 字面量
 * 只注入「有哪些色系、哪些阶」，具体色值仍由运行期读取 CSS 变量，
 * 避免同一份 hex 在页面里出现两次
 * @returns JS 源码
 */
function buildSeriesJs(): string {
  const rows = paletteSeries.map((s) => `    { key: '${s.key}', label: '${s.label}', role: '${s.role}' },`)
  return `  var SERIES = [\n${rows.join('\n')}\n  ]`
}

/**
 * 渲染色阶顺序为 JS 数组
 * @returns JS 源码
 */
function buildStepsJs(): string {
  return `  var STEPS = [${paletteSteps.join(', ')}]`
}

/**
 * 执行占位符替换并校验无遗漏
 * @param template 模板内容
 * @returns 生成后的 HTML
 */
function render(template: string): string {
  const html = template
    .replace('/* @INJECT:L1 */', buildL1Decls())
    .replace('/* @INJECT:STRUCTURAL */', toDecls(structural))
    .replace('/* @INJECT:L2_LIGHT */', toDecls(semanticLight))
    .replace('/* @INJECT:L2_DARK */', toDecls(semanticDark))
    .replace('/* @INJECT:QUALITY_FLAT */', toDecls(qualityFlat))
    .replace('/* @INJECT:QUALITY_GLASS */', toDecls(qualityGlass))
    .replace('/* @INJECT:DARK_FLAT */', toDecls(shadowDarkFlat))
    .replace('/* @INJECT:DARK_GLASS */', toDecls(themedDarkGlass()))
    .replace('/* @INJECT:PALETTE_SERIES */', buildSeriesJs())
    .replace('/* @INJECT:PALETTE_STEPS */', buildStepsJs())

  // 漏替换的占位符会让页面静默缺数据，必须显式失败
  const leftover = html.match(/@INJECT:[A-Z0-9_]+/g)
  if (leftover) {
    throw new Error(`存在未替换的占位符：${[...new Set(leftover)].join(', ')}`)
  }

  return html
}

function main(): void {
  const template = readFileSync(TEMPLATE, 'utf-8')
  const html = render(template)

  mkdirSync(dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, html, 'utf-8')

  const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1)
  console.log(`[gallery] 生成 docs/public/token-gallery.html（${sizeKb} KB）`)
  console.log(
    `[gallery] 注入：${paletteSeries.length} 个色系 × ${paletteSteps.length} 阶 / ` +
      `${Object.keys(semanticLight).length} 条亮色语义 / ${Object.keys(qualityFlat).length} 条质感`,
  )
}

try {
  main()
} catch (error) {
  console.error('[gallery] 生成失败：', error instanceof Error ? error.message : error)
  process.exit(1)
}
