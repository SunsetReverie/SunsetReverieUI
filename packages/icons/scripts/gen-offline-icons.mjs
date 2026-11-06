#!/usr/bin/env node
/**
 * 离线图标子集化
 *
 * 流程：
 * 1. 扫描源码中所有「集合:图标名」字面量
 * 2. 从 @iconify-json/<集合> 中只提取用到的图标
 * 3. 生成 packages/icons/src/collections/<集合>.json 与 usage.json
 *
 * 为什么必须子集化：Lucide 全量 2100+ 图标（≈2MB），整体打包会把库体积毁掉。
 * usage.json 同时是 check-icons.mjs 的比对依据 —— 漏扫会导致 CI 报错而不是线上缺图标。
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../../..')
const OUT_DIR = join(ROOT, 'packages/icons/src/collections')
const require = createRequire(import.meta.url)

/** 扫描范围：组件库源码 + playground（不含文档，文档里大量示例图标名） */
const SCAN_DIRS = [
  join(ROOT, 'packages/ui/src'),
  join(ROOT, 'packages/icons/src'),
  join(ROOT, 'playground-vue3/src'),
  join(ROOT, 'playground-nuxt4/app'),
]

/** 图标名字面量 */
const ICON_PATTERN = /['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/g

/**
 * 递归收集源码文件
 * @param {string} dir 目录
 * @param {string[]} out 结果
 * @returns {string[]} 文件列表
 */
function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'collections', '__tests__'].includes(entry.name)) continue
      walk(full, out)
      continue
    }
    if (/\.(vue|ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

/**
 * 扫描所有图标引用
 * @returns {Map<string, string>} 图标全名 → 首次出现的文件
 */
function scanUsage() {
  const found = new Map()
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const code = readFileSync(file, 'utf-8')
      for (const m of code.matchAll(ICON_PATTERN)) {
        const icon = m[1]
        if (!found.has(icon)) found.set(icon, relative(ROOT, file))
      }
    }
  }
  return found
}

/**
 * 载入某个集合的全量数据
 * @param {string} prefix 集合前缀，如 lucide
 * @returns {object | null} Iconify 集合数据；未安装则返回 null
 */
function loadCollection(prefix) {
  try {
    const path = require.resolve(`@iconify-json/${prefix}/icons.json`)
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

const usage = scanUsage()
const byPrefix = new Map()

for (const icon of usage.keys()) {
  const [prefix, name] = icon.split(':')
  if (!byPrefix.has(prefix)) byPrefix.set(prefix, new Set())
  byPrefix.get(prefix).add(name)
}

mkdirSync(OUT_DIR, { recursive: true })

let totalIcons = 0
const missing = []

for (const [prefix, names] of byPrefix) {
  const source = loadCollection(prefix)
  if (!source) {
    missing.push(prefix)
    continue
  }

  /** 子集数据：保留集合元信息，只挑用到的图标 */
  const subset = {
    prefix,
    info: source.info,
    ...(source.width ? { width: source.width } : {}),
    ...(source.height ? { height: source.height } : {}),
    ...(source.lastModified ? { lastModified: source.lastModified } : {}),
    ...(source.aliases ? { aliases: {} } : {}),
    icons: {},
  }

  for (const name of names) {
    const icon = source.icons?.[name]
    if (icon) {
      subset.icons[name] = icon
      totalIcons += 1
    } else if (source.aliases?.[name]) {
      subset.aliases[name] = source.aliases[name]
      totalIcons += 1
    } else {
      missing.push(`${prefix}:${name}`)
    }
  }

  const outFile = join(OUT_DIR, `${prefix}.json`)
  writeFileSync(outFile, `${JSON.stringify(subset, null, 2)}\n`, 'utf-8')
  console.log(`[icons] ${prefix}: ${Object.keys(subset.icons).length} 个图标 → ${relative(ROOT, outFile)}`)
}

writeFileSync(join(OUT_DIR, 'usage.json'), `${JSON.stringify([...usage.keys()].sort(), null, 2)}\n`, 'utf-8')

if (missing.length > 0) {
  console.error(`\n[icons] 以下图标不存在或集合未安装：\n  ${missing.join('\n  ')}\n`)
  process.exit(1)
}

console.log(`[icons] 完成：${totalIcons} 个图标，${byPrefix.size} 个集合`)
