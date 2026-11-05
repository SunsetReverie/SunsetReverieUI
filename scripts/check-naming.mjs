#!/usr/bin/env node
/**
 * 命名规范校验（对应规划文档第二章）
 *
 * 校验三件事：
 * 1. 组件目录 kebab-case，且 src/<目录名>.vue 存在
 * 2. 组件 defineOptions({ name }) 等于 Sr + PascalCase(目录名)
 * 3. 样式文件中 CSS 变量与类名都带 sr- 前缀
 *
 * CI 与 pre-commit 都会执行，失败即阻断。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const UI_SRC = join(ROOT, 'packages/ui/src')
const COMPONENTS_DIR = join(UI_SRC, 'components')

/** kebab-case 规则：小写字母开头，单词间单连字符 */
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** 违规信息收集 */
const errors = []

/**
 * 目录名转 PascalCase
 * @param {string} name kebab-case 目录名
 * @returns {string} PascalCase 形式
 */
function toPascal(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * 递归收集指定扩展名的文件
 * @param {string} dir 起始目录
 * @param {string[]} exts 扩展名列表，如 ['.less']
 * @param {string[]} out 结果累积数组
 * @returns {string[]} 文件绝对路径列表
 */
function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, exts, out)
      continue
    }
    if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full)
  }
  return out
}

/**
 * 校验组件目录与组件名
 * @returns {number} 扫描到的组件数量
 */
function checkComponents() {
  if (!existsSync(COMPONENTS_DIR)) return 0

  const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory())

  for (const dir of dirs) {
    const rel = relative(ROOT, join(COMPONENTS_DIR, dir.name))

    if (!KEBAB.test(dir.name)) {
      errors.push(`[组件目录] ${rel}：目录名必须是 kebab-case`)
      continue
    }

    const expectedName = `Sr${toPascal(dir.name)}`
    const vueFile = join(COMPONENTS_DIR, dir.name, 'src', `${dir.name}.vue`)

    if (!existsSync(vueFile)) {
      errors.push(`[组件文件] ${rel}：缺少 src/${dir.name}.vue`)
      continue
    }

    const code = readFileSync(vueFile, 'utf-8')
    const matched = code.match(/name:\s*['"]([^'"]+)['"]/)

    if (!matched) {
      errors.push(`[组件名] ${rel}：未找到 defineOptions({ name })`)
    } else if (matched[1] !== expectedName) {
      errors.push(`[组件名] ${rel}：name 为 "${matched[1]}"，按规范应为 "${expectedName}"`)
    }
  }

  return dirs.length
}

/**
 * 校验样式文件中的 CSS 变量前缀
 * @returns {void}
 */
function checkCssVars() {
  const files = walk(join(UI_SRC, 'styles'), ['.less', '.css']).filter((f) => !f.includes('generated'))

  for (const file of files) {
    const code = readFileSync(file, 'utf-8')
    const rel = relative(ROOT, file)

    for (const line of code.split('\n')) {
      const trimmed = line.trim()
      // 跳过注释行
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

      for (const m of line.matchAll(/(?:^|[\s{;])(--[a-zA-Z0-9-]+)\s*:/g)) {
        const varName = m[1]
        if (!varName.startsWith('--sr-')) {
          errors.push(`[CSS 变量] ${rel}：${varName} 缺少 --sr- 前缀`)
        }
      }
    }
  }
}

/**
 * 校验样式文件中的类名前缀
 * @returns {void}
 */
function checkClassNames() {
  const files = walk(join(UI_SRC, 'styles'), ['.less']).filter((f) => !f.includes('generated'))

  for (const file of files) {
    const code = readFileSync(file, 'utf-8')
    const rel = relative(ROOT, file)

    for (const line of code.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

      const matched = line.match(/^\s*\.([a-zA-Z][\w-]*)/)
      if (!matched) continue

      const cls = matched[1]
      if (!cls.startsWith('sr-') && !cls.startsWith('is-')) {
        errors.push(`[类名] ${rel}：.${cls} 缺少 sr- 前缀`)
      }
    }
  }
}

const componentCount = checkComponents()
checkCssVars()
checkClassNames()

if (errors.length > 0) {
  console.error(`\n[命名校验] 发现 ${errors.length} 处违规：\n`)
  for (const err of errors) console.error(`  ✗ ${err}`)
  console.error('')
  process.exit(1)
}

console.log(`[命名校验] 通过（组件 ${componentCount} 个，样式文件已检查前缀）`)
