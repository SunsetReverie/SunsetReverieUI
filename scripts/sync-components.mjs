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
 * @returns 组件名（不含 Sr）与所在目录
 */
function collectEntries(dir) {
  const entry = join(COMPONENTS_DIR, dir, 'index.ts')
  if (!existsSync(entry)) return []

  const source = readFileSync(entry, 'utf-8')
  const matched = [...source.matchAll(/export const (Sr[A-Za-z0-9]+)\s*=/g)].map((m) => m[1])

  return matched.map((name) => ({ name: name.replace(/^Sr/, ''), dir }))
}

/** 组件名 → 所在目录（子组件共用主组件的目录） */
const entryMap = new Map()
for (const dir of dirs) {
  for (const item of collectEntries(dir)) {
    if (!entryMap.has(item.name)) entryMap.set(item.name, item)
  }
}

const names = [...entryMap.keys()].sort()

/**
 * 判断组件名是否就是所在目录的主组件
 *
 * 只有主组件才有独立子路径（`@sunset-reverie/ui/checkbox`）；
 * 子组件（`SrCheckboxGroup`）没有自己的目录，只能从包入口引入。
 * 用「去连字符后小写相等」比较，兼容 `QRCode` 与 `qrcode`、`ChinaMap` 与 `china-map`。
 * @param name 组件名（不含 Sr）
 * @param dir 目录名
 * @returns 是否为主组件
 */
function isMainComponent(name, dir) {
  return dir.replace(/-/g, '').toLowerCase() === name.toLowerCase()
}

// 手写列表而非 JSON.stringify：后者输出双引号，会被 prettier(singleQuote)
// 在提交时改成单引号，导致「每次构建后工作区都脏」。
const nameList = '[\n' + names.map((name) => `  '${name}',`).join('\n') + '\n]'

// 入口映射：有独立目录的主组件走子路径，子组件回落到包入口。
// 地图（china-map）刻意不进主入口，靠这份映射才能被自动注册。
const entryList =
  '{\n' +
  names
    .map((name) => {
      const dir = entryMap.get(name).dir
      const from = isMainComponent(name, dir) ? `'@sunset-reverie/ui/${dir}'` : "'@sunset-reverie/ui'"
      return `  ${name}: { dir: '${dir}', from: ${from} },`
    })
    .join('\n') +
  '\n}'

for (const target of TARGETS) {
  const content = `/**
 * 组件清单（自动生成，请勿手改）
 *
 * 由 \`pnpm gen:components\` 扫描 packages/ui/src/components 生成。
 * ${target.consumer}。
 */

/** 所有组件的 PascalCase 名（不含 Sr 前缀） */
export const SR_COMPONENT_NAMES = ${nameList} as const

/**
 * 组件名 → 所在目录与引入路径
 *
 * 主组件（有独立目录）走子路径，例如 \`Button → @sunset-reverie/ui/button\`；
 * 子组件（\`CheckboxGroup\`、\`FormItem\` 这些与主组件同目录）回落到包入口。
 */
export const SR_COMPONENT_ENTRIES: Record<string, { dir: string; from: string }> = ${entryList}

/** 组件名联合类型，供类型体操与文档生成使用 */
export type SrComponentName = (typeof SR_COMPONENT_NAMES)[number]
`

  mkdirSync(resolve(target.file, '..'), { recursive: true })
  writeFileSync(target.file, content, 'utf-8')
}

console.log(`[components] 同步 ${names.length} 个组件：${names.join(', ')}`)
