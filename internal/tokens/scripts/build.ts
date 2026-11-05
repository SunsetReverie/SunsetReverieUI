/**
 * Token 代码生成器
 *
 * 从 src/tokens.ts 这一份唯一手写源，生成三份产物：
 * 1. Less 变量      → packages/ui/src/tokens/generated/vars.less
 * 2. TS 常量与类型  → packages/ui/src/tokens/generated/index.ts
 * 3. L1 CSS 变量    → packages/ui/src/styles/base/primitives.generated.css
 *
 * 分工原则：Less 负责编译期结构（断点、数学计算），CSS 变量负责运行期皮肤。
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  breakpoints,
  breakpointOrder,
  durations,
  easings,
  distances,
  fontSizes,
  lineHeights,
  palette,
  paletteSeries,
  paletteSteps,
  radii,
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
const UI_SRC = resolve(HERE, '../../../packages/ui/src')
const TOKENS_OUT = resolve(UI_SRC, 'tokens/generated')
const STYLES_OUT = resolve(UI_SRC, 'styles/base')

/** 生成文件统一头部声明 */
const BANNER = [
  '该文件由 @sunset-reverie/internal-tokens 自动生成，请勿手改。',
  '源文件：internal/tokens/src/tokens.ts',
  '重新生成：pnpm build:tokens',
].join('\n')

/**
 * 把纯数据递归序列化为 TS 字面量源码
 * @param value 待序列化的值（对象 / 数组 / 原始值）
 * @param indent 当前缩进层级（空格数）
 * @returns TS 源码文本
 */
function toTsLiteral(value: unknown, indent = 0): string {
  const pad = ' '.repeat(indent + 2)
  const closePad = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${pad}${toTsLiteral(v, indent + 2)},`).join('\n')
    return `[\n${items}\n${closePad}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const body = entries
      .map(([key, val]) => {
        const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`
        return `${pad}${safeKey}: ${toTsLiteral(val, indent + 2)},`
      })
      .join('\n')
    return `{\n${body}\n${closePad}}`
  }

  return JSON.stringify(value)
}

/**
 * 生成 Less 变量文件
 * 只包含编译期需要的内容：断点（@media 不支持 CSS 变量）与可参与数学运算的数值
 * @returns Less 源码
 */
function buildLess(): string {
  const lines: string[] = [`// ${BANNER.replace(/\n/g, '\n// ')}`, '']

  lines.push('// ---------- 断点（媒体查询必须用 Less 变量） ----------')
  for (const bp of breakpointOrder) {
    lines.push(`@sr-breakpoint-${bp}: ${breakpoints[bp]}px;`)
  }

  lines.push('', '// ---------- 间距 ----------')
  for (const item of spacings) {
    lines.push(`@sr-space-${item.name}: ${item.value}px;`)
  }

  lines.push('', '// ---------- 字号 / 行高 ----------')
  for (const [key, size] of Object.entries(fontSizes)) {
    lines.push(`@sr-font-size-${key}: ${size}px;`)
  }
  for (const [key, height] of Object.entries(lineHeights)) {
    lines.push(`@sr-line-height-${key}: ${height}px;`)
  }

  lines.push('', '// ---------- 动效 ----------')
  for (const [key, value] of Object.entries(durations)) {
    lines.push(`@sr-motion-duration-${key}: ${value}ms;`)
  }
  for (const [key, value] of Object.entries(easings)) {
    lines.push(`@sr-motion-easing-${key}: ${value};`)
  }
  for (const [key, value] of Object.entries(distances)) {
    lines.push(`@sr-motion-distance-${key}: ${value}px;`)
  }

  return `${lines.join('\n')}\n`
}

/**
 * 生成 TS 常量与类型
 * 供 useSrBreakpoint 等 JS 逻辑复用同一份断点数值
 * @returns TS 源码
 */
function buildTs(): string {
  const blocks: string[] = [`// ${BANNER.replace(/\n/g, '\n// ')}`, '']

  blocks.push(`export const SR_BREAKPOINTS = ${toTsLiteral(breakpoints)} as const`)
  blocks.push('')
  blocks.push('export type SrBreakpoint = keyof typeof SR_BREAKPOINTS')
  blocks.push('')
  blocks.push(`export const SR_BREAKPOINT_KEYS = ${toTsLiteral(breakpointOrder)} as const`)
  blocks.push('')
  blocks.push(`export const SR_SPACINGS = ${toTsLiteral(spacings)} as const`)
  blocks.push('')
  blocks.push(`export const SR_FONT_SIZES = ${toTsLiteral(fontSizes)} as const`)
  blocks.push('')
  blocks.push(`export const SR_LINE_HEIGHTS = ${toTsLiteral(lineHeights)} as const`)
  blocks.push('')
  blocks.push(`export const SR_MOTION_DURATIONS = ${toTsLiteral(durations)} as const`)
  blocks.push('')
  blocks.push(`export const SR_MOTION_EASINGS = ${toTsLiteral(easings)} as const`)
  blocks.push('')
  blocks.push(`export const SR_RADII = ${toTsLiteral(radii)} as const`)
  blocks.push('')
  blocks.push(`export const SR_PALETTE_STEPS = ${toTsLiteral(paletteSteps)} as const`)
  blocks.push('')
  blocks.push(`export const SR_PALETTE_SERIES = ${toTsLiteral(paletteSeries)} as const`)

  return `${blocks.join('\n')}\n`
}

/**
 * 生成 L1 原始层 CSS 变量
 * 只包含不随主题 / 风格变化的值；L2 语义层由 styles/base/tokens.css 手写
 * @returns CSS 源码
 */
function buildCss(): string {
  const lines: string[] = [`/* ${BANNER.replace(/\n/g, '\n   ')} */`, '', ':root {']

  lines.push('  /* ---------- L1 原始色板 ---------- */')
  for (const series of paletteSeries) {
    lines.push(`  /* ${series.key} · ${series.label}（${series.role}） */`)
    const ramp = palette[series.key]
    for (const step of paletteSteps) {
      const color = ramp[step]
      if (!color) continue
      lines.push(`  --sr-${series.key}-${step}: ${color.toLowerCase()};`)
    }
    lines.push('')
  }

  lines.push('  /* ---------- 间距 ---------- */')
  for (const item of spacings) {
    lines.push(`  --sr-space-${item.name}: ${item.value}px;`)
  }

  lines.push('', '  /* ---------- 字号 / 行高 ---------- */')
  for (const [key, size] of Object.entries(fontSizes)) {
    lines.push(`  --sr-font-size-${key}: ${size}px;`)
  }
  for (const [key, height] of Object.entries(lineHeights)) {
    lines.push(`  --sr-line-height-${key}: ${height}px;`)
  }

  lines.push('', '  /* ---------- 动效 ---------- */')
  for (const [key, value] of Object.entries(durations)) {
    lines.push(`  --sr-motion-duration-${key}: ${value}ms;`)
  }
  for (const [key, value] of Object.entries(easings)) {
    lines.push(`  --sr-motion-easing-${key}: ${value};`)
  }
  for (const [key, value] of Object.entries(distances)) {
    lines.push(`  --sr-motion-distance-${key}: ${value}px;`)
  }

  lines.push('}', '')
  return lines.join('\n')
}

/**
 * 把键值对渲染为 CSS 声明块
 * @param map 键不含 --sr- 前缀
 * @param indent 缩进字符串
 * @returns CSS 声明文本
 */
function toDecls(map: Record<string, string>, indent = '  '): string {
  return Object.entries(map)
    .map(([key, value]) => `${indent}--sr-${key}: ${value};`)
    .join('\n')
}

/**
 * 生成 L2 语义层 + 质感层 CSS
 *
 * 块顺序即优先级，不可随意调整：
 * 1. :root          结构语义
 * 2. 明暗主题       只换语义色
 * 3. 质感风格       只换圆角 / 阴影 / 玻璃
 * 4. 交叉修正       暗色 + 风格 必须放在风格层之后，否则被覆盖
 * @returns CSS 源码
 */
function buildSemanticCss(): string {
  const blocks: string[] = [`/* ${BANNER.replace(/\n/g, '\n   ')} */`, '']

  blocks.push('/* ---------- 结构语义（不随主题变化） ---------- */', ':root {')
  blocks.push(toDecls(structural))
  blocks.push('}', '')

  blocks.push('/* ---------- L2 语义层 · 亮色 ---------- */', "[data-sr-theme='light'] {")
  blocks.push(toDecls(semanticLight))
  blocks.push('}', '')

  blocks.push('/* ---------- L2 语义层 · 暗色 ---------- */', "[data-sr-theme='dark'] {")
  blocks.push(toDecls(semanticDark))
  blocks.push('}', '')

  blocks.push('/* ---------- 质感层 · flat ---------- */', "[data-sr-style='flat'] {")
  blocks.push(toDecls(qualityFlat))
  blocks.push('}', '')

  blocks.push('/* ---------- 质感层 · glass ---------- */', "[data-sr-style='glass'] {")
  blocks.push(toDecls(qualityGlass))
  blocks.push('}', '')

  blocks.push(
    '/* ---------- 交叉修正 · 暗色 + 扁平 ----------',
    '   必须写在风格层之后：与 [data-sr-style] 特异性相同，后写者胜出 ---------- */',
    "[data-sr-theme='dark'][data-sr-style='flat'] {",
  )
  blocks.push(toDecls(shadowDarkFlat))
  blocks.push('}', '')

  blocks.push(
    '/* ---------- 交叉修正 · 暗色 + 玻璃 ---------- */',
    "[data-sr-theme='dark'][data-sr-style='glass'] {",
  )
  blocks.push(toDecls(themedDarkGlass()))
  blocks.push('}', '')

  // 主题作用域：属性本身就代表「此处应用该主题」。
  // 没有这条时，局部嵌套的主题只换了 CSS 变量，color 仍继承外层的深色，
  // 暗色卡片里的图标会变成「深色字 + 深色底」直接看不见。
  blocks.push(
    '/* ---------- 主题作用域 ----------',
    '   放在 data 属性上而非 html：局部嵌套时同样生效 ---------- */',
    '[data-sr-theme] {',
    '  color: var(--sr-color-text);',
    '}',
    '',
  )

  blocks.push('/* ---------- 动效降级 ---------- */', '@media (prefers-reduced-motion: reduce) {')
  blocks.push('  :root {')
  for (const key of Object.keys(durations)) {
    blocks.push(`    --sr-motion-duration-${key}: 0.01ms;`)
  }
  blocks.push('  }', '}', '')

  return blocks.join('\n')
}

/**
 * 写入文件并确保目录存在
 * @param file 绝对路径
 * @param content 文件内容
 */
function emit(file: string, content: string): void {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content, 'utf-8')
  console.log(`[tokens] 生成 ${file.replace(resolve(HERE, '../../..'), '.')}`)
}

/**
 * 入口：生成全部产物
 */
function main(): void {
  emit(resolve(TOKENS_OUT, 'vars.less'), buildLess())
  emit(resolve(TOKENS_OUT, 'index.ts'), buildTs())
  emit(resolve(STYLES_OUT, 'primitives.generated.css'), buildCss())
  emit(resolve(STYLES_OUT, 'semantic.generated.css'), buildSemanticCss())

  const colorCount = paletteSeries.length * paletteSteps.length
  console.log(
    `[tokens] 完成：${paletteSeries.length} 个色系 / ${colorCount} 个色阶 / ` +
      `${spacings.length} 个间距 / ${Object.keys(fontSizes).length} 档字号`,
  )
}

main()
