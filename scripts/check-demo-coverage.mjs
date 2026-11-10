#!/usr/bin/env node
/**
 * 演示覆盖守卫
 *
 * 演示站的注册表、组件目录、API 产物是三份各自维护的数据，过去靠人记：
 * 新组件加了 demo 却忘了重新生成 props.json，页面就静默少一整块 Props 表；
 * Row/Col 共用一个演示但 props.json 里的 col 键没人读，也没人发现。
 *
 * 这里把四张表对齐，挂进 `pnpm lint`，让「漏一个」当场失败：
 *   ① 组件目录 → 注册表条目（或显式声明的合并演示）
 *   ② 注册表条目 → props.json 的键
 *   ③ props.json 的键 → 组件目录
 *   ④ 注册表条目 → 真实存在的 demo 文件
 *   ⑤ demos 下的 .vue 文件 → 要么被注册表、要么被别的 demo 引用（防孤儿）
 *
 * 退出码：0 全部通过；1 发现缺口（打印清单，不抛异常）。
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'packages/ui/src/components')
const DEMOS = join(ROOT, 'playground-vue3/src/demos')
const REGISTRY = join(DEMOS, 'registry.ts')
const PROPS_JSON = join(DEMOS, 'props.json')

/** 合并演示：key 的组件没有独立页面，API 由 value 指向的页面一起展示 */
const MERGED_INTO = { col: 'row' }

/** 壳层文件，不属于任何组件演示 */
const SHELL_FILES = new Set(['DemoPage.vue'])

/**
 * 递归列出目录下的 .vue 文件
 * @param dir 起始目录
 * @param out 累积结果
 * @returns 相对 DEMOS 的路径列表
 */
function walkVue(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walkVue(full, out)
    } else if (entry.name.endsWith('.vue')) {
      out.push(relative(DEMOS, full).split('\\').join('/'))
    }
  }
  return out
}

/**
 * 从注册表源码里解析条目
 *
 * 直接读文本而不 import：registry.ts 是 TS 且带动态 import，node 无法直接执行。
 * @param code 注册表源码
 * @returns 条目列表（key / api / 文件路径）
 */
function parseRegistry(code) {
  const entries = []
  const blocks = code.split(/\n {6}\{/).slice(1)
  for (const block of blocks) {
    const key = /\bkey: '([^']+)'/.exec(block)?.[1]
    const file = /\bdemo: \(\) => import\('\.\/([^']+)'\)/.exec(block)?.[1]
    if (!key || !file) continue
    const extra = /\bextraApi: \[([^\]]+)\]/.exec(block)?.[1] ?? ''
    entries.push({
      key,
      api: /\bapi: '([^']+)'/.exec(block)?.[1] ?? key,
      extraApi: [...extra.matchAll(/'([^']+)'/g)].map((match) => match[1]),
      file,
    })
  }
  return entries
}

/**
 * 收集 .vue 文件里所有相对 import 路径（用于判定辅助组件是否被引用）
 * @param file 相对 DEMOS 的路径
 * @returns 被引用文件的绝对路径集合
 */
function referencedFiles(file) {
  const code = readFileSync(join(DEMOS, file), 'utf-8')
  const found = new Set()
  for (const match of code.matchAll(/from\s+['"](\.[^'"]+)['"]|import\(['"](\.[^'"]+)['"]\)/g)) {
    const spec = match[1] ?? match[2]
    const target = resolve(dirname(join(DEMOS, file)), spec)
    if (existsSync(target)) found.add(target.split('\\').join('/'))
    else if (existsSync(`${target}.vue`)) found.add(`${target}.vue`.split('\\').join('/'))
  }
  return found
}

const problems = []

if (!existsSync(PROPS_JSON)) {
  console.error('[演示覆盖] 找不到 props.json，先跑 pnpm gen:demo-props')
  process.exit(1)
}

const componentNames = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
const api = JSON.parse(readFileSync(PROPS_JSON, 'utf-8'))
const entries = parseRegistry(readFileSync(REGISTRY, 'utf-8'))
const keys = new Set(entries.map((entry) => entry.key))
const usedApiKeys = new Set(entries.flatMap((entry) => [entry.api, ...entry.extraApi]))

// ① 组件目录必须有页面（合并演示按映射放行）
for (const name of componentNames) {
  if (keys.has(name)) continue
  const merged = MERGED_INTO[name]
  if (merged && keys.has(merged) && api[name]) continue
  problems.push(`组件 ${name} 没有演示条目（也没有登记合并演示）`)
}

// ② / ④ 每条 demo 都要有 API 数据与真实文件
for (const entry of entries) {
  if (!api[entry.api]) problems.push(`演示 ${entry.key} 的 API 键 ${entry.api} 不在 props.json 里`)
  if (!existsSync(join(DEMOS, entry.file))) problems.push(`演示 ${entry.key} 指向的文件不存在：${entry.file}`)
  if (!entry.file.startsWith(`${entry.key}/`)) {
    problems.push(`演示 ${entry.key} 的文件不在同名目录下：${entry.file}（源码展示依赖这个约定）`)
  }
}

// ③ props.json 里的键必须对应真实组件，且不能谁都不读
for (const name of Object.keys(api)) {
  if (!componentNames.includes(name)) problems.push(`props.json 的 ${name} 没有对应组件目录`)
  if (!usedApiKeys.has(name) && !keys.has(name)) problems.push(`props.json 的 ${name} 没有任何演示页面读取`)
}

// ⑤ 孤儿文件：既不是壳层，也没被注册表或别的 demo 引用
const vueFiles = walkVue(DEMOS)
const imported = new Set(entries.map((entry) => entry.file))
const referenced = new Set()
for (const file of vueFiles) {
  for (const target of referencedFiles(file)) referenced.add(relative(DEMOS, target).split('\\').join('/'))
}
for (const file of vueFiles) {
  if (SHELL_FILES.has(basename(file)) || imported.has(file) || referenced.has(file)) continue
  problems.push(`孤儿演示文件 ${file}（既没注册，也没被别的 demo 引用）`)
}

if (problems.length) {
  console.error(`\n[演示覆盖] 发现 ${problems.length} 处缺口：\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('\n补 registry.ts / 跑 pnpm gen:demo-props / 删除无用文件后重试。\n')
  process.exit(1)
}

console.log(
  `[演示覆盖] 通过（${componentNames.length} 个组件 / ${entries.length} 个演示 / ${Object.keys(api).length} 组 API / ${vueFiles.length} 个 .vue）`,
)
