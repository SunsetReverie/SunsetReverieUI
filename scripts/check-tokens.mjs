#!/usr/bin/env node
/**
 * CSS 变量引用校验
 *
 * `var(--sr-xxx)` 里的名字拼错时浏览器不会报错，只会安静地回退到初始值 ——
 * 这条声明整条失效。典型症状是「动画没了」「圆角掉了」「颜色没变」，
 * 排查起来非常费时（本项目已经踩过四次）。
 *
 * 这里把「定义过的变量」和「引用过的变量」对上账，缺一个就报错。
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

/** 变量定义来源：tokens 生成的 CSS + 各组件自己声明的局部变量 */
const DEFINE_GLOBS = [
  join(ROOT, 'packages/ui/src/styles/base'),
  join(ROOT, 'packages/ui/src/components'),
  join(ROOT, 'playground-vue3/src'),
  join(ROOT, 'packages/icons/src'),
]

/** 引用来源：组件样式与演示站 */
const USE_GLOBS = [join(ROOT, 'packages/ui/src'), join(ROOT, 'playground-vue3/src')]

/** 递归收集文件 */
function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }

  for (const entry of entries) {
    if (['node_modules', 'dist', '.nuxt', '.output', '__tests__'].includes(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(less|css|vue|ts)$/.test(entry.name)) out.push(full)
  }
  return out
}

/** 定义表：变量名 → 首次出现位置 */
const defined = new Map()

/** 逐个文件登记定义 */
for (const dir of DEFINE_GLOBS) {
  for (const file of walk(dir)) {
    const code = readFileSync(file, 'utf-8')
    for (const match of code.matchAll(/(--sr-[a-z0-9-]+)\s*:/g)) {
      if (!defined.has(match[1])) defined.set(match[1], relative(ROOT, file))
    }
  }
}

/** 引用表：变量名 → 首次出现位置 */
const used = new Map()

for (const dir of USE_GLOBS) {
  for (const file of walk(dir)) {
    const code = readFileSync(file, 'utf-8')
    // 只认「没有回退值」的引用：var(--x, fallback) 缺变量时会用回退值，不算错误；
    // 名字以 - 结尾的是 less 变量拼接（var(--sr-color-bg-@{level})），同样跳过
    for (const match of code.matchAll(/var\(\s*(--sr-[a-z0-9-]+)\s*([,)])/g)) {
      const [, name, next] = match
      if (next === ',') continue
      if (name.endsWith('-')) continue
      if (!used.has(name)) used.set(name, relative(ROOT, file))
    }
  }
}

/** 只在 var() 里写了「变量名」但其实没定义过的 */
const missing = [...used.entries()].filter(([name]) => !defined.has(name))

if (missing.length > 0) {
  console.error(`[变量校验] 以下变量被引用但没有定义（共 ${missing.length} 个）：\n`)
  for (const [name, file] of missing) {
    console.error(`  ✗ ${name}`)
    console.error(`     首次出现于 ${file}`)
  }
  console.error('\n拼错的变量名会让整条声明失效（例如 transition 回退成 all 0s）。')
  console.error('请改成 tokens 里已存在的变量，或在对应组件里补上定义。')
  process.exit(1)
}

console.log(`[变量校验] 通过（定义 ${defined.size} 个，引用 ${used.size} 个，均已对齐）`)
