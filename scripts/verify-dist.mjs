#!/usr/bin/env node
/**
 * 产物校验
 *
 * 三层检查：
 * 1. exports 入口：package.json 里声明的每个非通配路径都必须指向真实文件
 * 2. 组件三件套：每个组件目录必须同时有 index.js / index.d.ts / style.css
 * 3. 清单一致性：resolver 的组件清单必须与 ui 的组件目录完全对应
 *
 * 第 2、3 层是 W6 新增 —— 通配符 exports 无法静态校验，
 * 只能反过来从产物目录与清单去比对，否则「少了一个组件的 CSS」这类问题
 * 要等下游按需引入时才会暴露。
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

// ---------- 1. exports 入口 ----------
for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue

  const pkgDir = join(PACKAGES_DIR, entry.name)
  const pkgJsonPath = join(pkgDir, 'package.json')
  if (!existsSync(pkgJsonPath)) continue

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))

  if (!existsSync(join(pkgDir, 'dist'))) {
    skipped.push(pkg.name)
    continue
  }

  for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
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

// ---------- 2. 组件三件套 ----------
const uiDist = join(PACKAGES_DIR, 'ui/dist/components')
const uiSrc = join(PACKAGES_DIR, 'ui/src/components')

if (existsSync(uiDist)) {
  const builtComponents = readdirSync(uiDist, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const name of builtComponents) {
    for (const file of ['index.js', 'index.d.ts', 'style.css']) {
      const abs = join(uiDist, name, file)
      if (!existsSync(abs)) {
        missing.push(`@sunset-reverie/ui → components/${name}/${file} 未产出`)
      } else {
        checkedCount += 1
      }
    }
  }
}

// ---------- 3. resolver 清单一致性 ----------
const generatedFiles = [
  join(PACKAGES_DIR, 'resolver/src/components.generated.ts'),
  join(PACKAGES_DIR, 'nuxt/src/components.generated.ts'),
]

if (generatedFiles.some((file) => existsSync(file)) && existsSync(uiSrc)) {
  const sourceComponents = readdirSync(uiSrc, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  /**
   * kebab-case 转 PascalCase，与 sync 脚本保持同一规则
   * @param {string} name 目录名
   * @returns {string} PascalCase
   */
  const toPascal = (name) =>
    name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

  const expected = sourceComponents.map(toPascal)

  for (const file of generatedFiles) {
    if (!existsSync(file)) continue

    // 不能用 JSON.parse：Prettier 会把生成文件里的双引号改成单引号。
    // 直接从数组字面量里提取引号包裹的标识符，单双引号都兼容。
    const block =
      readFileSync(file, 'utf-8').match(/SR_COMPONENT_NAMES = (\[[\s\S]*?\]) as const/)?.[1] ?? '[]'
    const generated = [...block.matchAll(/['"]([A-Za-z0-9]+)['"]/g)].map((matched) => matched[1])

    const missingInList = expected.filter((name) => !generated.includes(name))
    const extraInList = generated.filter((name) => !expected.includes(name))

    if (missingInList.length > 0 || extraInList.length > 0) {
      missing.push(
        `${relative(ROOT, file)} 与组件目录不一致（缺：${missingInList.join(', ') || '无'}；多：${extraInList.join(', ') || '无'}），请执行 pnpm gen:components`,
      )
    }
  }

  const allConsistent = missing.length === 0
  if (allConsistent) {
    console.log(`[产物校验] 组件清单与 ${expected.length} 个组件目录一致（resolver + nuxt）`)
  }
}

if (skipped.length > 0) {
  console.log(`[产物校验] 跳过未构建的包：${skipped.join('、')}`)
}

if (missing.length > 0) {
  console.error(`\n[产物校验] 发现 ${missing.length} 处问题：\n`)
  for (const item of missing) console.error(`  ✗ ${item}`)
  console.error('')
  process.exit(1)
}

console.log(`[产物校验] 通过（校验 ${checkedCount} 个文件，位于 ${relative(ROOT, PACKAGES_DIR)}）`)
