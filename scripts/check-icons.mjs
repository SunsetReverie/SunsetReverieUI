#!/usr/bin/env node
/**
 * 图标离线集合校验（对应规划文档 8.3）
 *
 * 扫描源码中所有「集合:图标名」字面量，与离线集合子集比对，
 * 缺一个就在 CI 报错，避免上线后图标空白。
 *
 * W1 阶段离线集合为空；W4 由 scripts/gen-offline-icons.mjs 产出
 * packages/icons/src/collections/usage.json 后，本脚本自动读取比对。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const USAGE_FILE = join(ROOT, 'packages/icons/src/collections/usage.json')

/** 扫描范围：只扫组件库源码与 playground，不扫 docs（文档里大量示例图标名） */
const SCAN_DIRS = [
  join(ROOT, 'packages/ui/src'),
  join(ROOT, 'playground-vue3/src'),
  join(ROOT, 'playground-nuxt4/app'),
].filter((dir) => existsSync(dir))

/** 图标名字面量：'集合:图标名' */
const ICON_PATTERN = /['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/g

/**
 * 递归收集源码文件
 * @param {string} dir 起始目录
 * @param {string[]} out 结果累积
 * @returns {string[]} 文件路径列表
 */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      walk(full, out)
      continue
    }
    if (/\.(vue|ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

/**
 * 读取已收录的离线图标
 * @returns {Set<string>} 图标全名集合
 */
function loadRegistered() {
  if (!existsSync(USAGE_FILE)) return new Set()
  try {
    const list = JSON.parse(readFileSync(USAGE_FILE, 'utf-8'))
    return new Set(Array.isArray(list) ? list : [])
  } catch {
    return new Set()
  }
}

const registered = loadRegistered()
const found = new Map()

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const code = readFileSync(file, 'utf-8')
    for (const m of code.matchAll(ICON_PATTERN)) {
      const icon = m[1]
      // 'update:page' 这类事件名形状和「集合:图标」一致，不能算图标引用
      if (icon.startsWith('update:') || icon.startsWith('v-slot:')) continue
      if (!found.has(icon)) found.set(icon, relative(ROOT, file))
    }
  }
}

const missing = [...found.entries()].filter(([icon]) => !registered.has(icon))

if (missing.length > 0) {
  console.error(`\n[图标校验] 有 ${missing.length} 个图标未收录进离线集合：\n`)
  for (const [icon, file] of missing) console.error(`  ✗ ${icon}  （首次出现于 ${file}）`)
  console.error('\n请执行 pnpm gen:icons 重新生成子集，或移除这些引用。\n')
  process.exit(1)
}

console.log(`[图标校验] 通过（引用 ${found.size} 个图标，均已收录）`)
