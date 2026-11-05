#!/usr/bin/env node
/**
 * 同步 resolver 的组件清单
 *
 * resolver 需要一份「有哪些组件」的列表才能把 <sr-button> 解析到对应子路径。
 * 手写必然漏，所以从 packages/ui/src/components 目录扫描生成。
 *
 * 产物：packages/resolver/src/components.generated.ts
 */

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENTS_DIR = join(ROOT, 'packages/ui/src/components')
const OUT_FILE = join(ROOT, 'packages/resolver/src/components.generated.ts')

/**
 * kebab-case 转 PascalCase
 * @param name 目录名
 * @returns PascalCase 形式
 */
function toPascal(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

// 每个目录必须有 index.ts 才算组件（排除临时目录）
const names = dirs.map(toPascal)

const content = `/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 \`pnpm gen:components\` 扫描 packages/ui/src/components 生成。
 * resolver 依赖这份列表把 <sr-button> 解析到 @sunset-reverie/ui/button。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = ${JSON.stringify(names, null, 2)} as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
`

mkdirSync(resolve(OUT_FILE, '..'), { recursive: true })
writeFileSync(OUT_FILE, content, 'utf-8')

console.log(`[components] 同步 ${names.length} 个组件：${names.join(', ')}`)
