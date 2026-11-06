#!/usr/bin/env node
/**
 * 同步 resolver 的组件清单
 *
 * resolver 需要一份「有哪些组件」的列表才能把 <sr-button> 解析到对应子路径。
 * 手写必然漏，所以从 packages/ui/src/components 目录扫描生成。
 *
 * 产物：packages/resolver/src/components.generated.ts
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENTS_DIR = join(ROOT, 'packages/ui/src/components')
/** 需要同步的目标文件 */
const TARGETS = [
  {
    file: join(ROOT, 'packages/resolver/src/components.generated.ts'),
    consumer: 'resolver 依赖这份列表把 <sr-button> 解析到 @sunset-reverie/ui/button',
  },
  {
    file: join(ROOT, 'packages/nuxt/src/components.generated.ts'),
    consumer: 'Nuxt module 依赖这份列表在启动时批量 addComponent',
  },
]

const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

/**
 * 从组件的 index.ts 里提取实际导出的组件名
 *
 * 不能只用目录名：一个目录可能导出多个组件
 * （checkbox/ 同时导出 SrCheckbox 与 SrCheckboxGroup），
 * 漏掉会导致 Nuxt 自动注册不全、resolver 解析不到。
 * @param dir 组件目录名
 * @returns 去掉 Sr 前缀的组件名数组
 */
function collectNames(dir) {
  const entry = join(COMPONENTS_DIR, dir, 'index.ts')
  if (!existsSync(entry)) return []

  const source = readFileSync(entry, 'utf-8')
  const matched = [...source.matchAll(/export const (Sr[A-Za-z0-9]+)\s*=/g)].map((m) => m[1])

  return matched.map((name) => name.replace(/^Sr/, ''))
}

const names = [...new Set(dirs.flatMap(collectNames))].sort()

// 手写列表而非 JSON.stringify：后者输出双引号，会被 prettier(singleQuote)
// 在提交时改成单引号，导致「每次构建后工作区都脏」。
const nameList = '[\n' + names.map((name) => `  '${name}',`).join('\n') + '\n]'

for (const target of TARGETS) {
  const content = `/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 \`pnpm gen:components\` 扫描 packages/ui/src/components 生成。
 * ${target.consumer}。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = ${nameList} as const

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
`

  mkdirSync(resolve(target.file, '..'), { recursive: true })
  writeFileSync(target.file, content, 'utf-8')
}

console.log(`[components] 同步 ${names.length} 个组件：${names.join(', ')}`)
