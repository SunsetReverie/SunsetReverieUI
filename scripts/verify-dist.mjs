#!/usr/bin/env node
/**
 * 产物校验（对应规划文档 11.9）
 *
 * 逐个包读取 package.json 的 exports，检查非通配条目指向的文件是否真实存在。
 * 目的是拦住「exports 写了但构建没产出」这类只在安装时才暴露的问题。
 *
 * 说明：dist 尚未生成的包会被跳过并提示（如 W1 阶段的 nuxt 包）。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const PACKAGES_DIR = join(ROOT, 'packages')

/** 缺失项 */
const missing = []
/** 已校验的文件数 */
let checkedCount = 0
/** 跳过的包 */
const skipped = []

/**
 * 汇总一个 exports 条目需要校验的全部目标文件
 * 同时覆盖 types 与 import：只校验 JS 会漏掉「类型声明没产出」这类断链
 * @param {string | Record<string, string>} value exports 值
 * @returns {string[]} 相对路径数组
 */
function collectTargets(value) {
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []

  const targets = []
  for (const key of ['types', 'import', 'default']) {
    if (typeof value[key] === 'string') targets.push(value[key])
  }
  return targets
}

for (const name of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
  if (!name.isDirectory()) continue

  const pkgDir = join(PACKAGES_DIR, name.name)
  const pkgJsonPath = join(pkgDir, 'package.json')
  if (!existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))

  if (!existsSync(join(pkgDir, 'dist'))) {
    skipped.push(pkg.name)
    continue
  }

  const exportsField = pkg.exports ?? {}

  for (const [subpath, value] of Object.entries(exportsField)) {
    // 通配子路径无法静态校验（如 ./components/*/style.css）
    if (subpath.includes('*')) continue
    if (subpath === './package.json') continue

    for (const target of collectTargets(value)) {
      if (target.includes('*')) continue

      const abs = join(pkgDir, target)

      if (!existsSync(abs)) {
        missing.push(`${pkg.name} → exports["${subpath}"] 指向的 ${target} 不存在`)
      } else {
        checkedCount += 1
      }
    }
  }
}

if (skipped.length > 0) {
  console.log(`[产物校验] 跳过未构建的包：${skipped.join('、')}`)
}

if (missing.length > 0) {
  console.error(`\n[产物校验] 发现 ${missing.length} 处缺失：\n`)
  for (const item of missing) console.error(`  ✗ ${item}`)
  console.error('')
  process.exit(1)
}

console.log(`[产物校验] 通过（校验 ${checkedCount} 个导出文件，位于 ${relative(ROOT, PACKAGES_DIR)}）`)
