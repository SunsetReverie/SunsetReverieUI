#!/usr/bin/env node
/**
 * 产物校验
 *
 * 四层检查：
 * 1. exports 入口：package.json 里声明的每个非通配路径都必须指向真实文件
 * 2. 组件三件套：每个组件目录必须同时有 index.js / index.d.ts / style.css
 * 3. 清单一致性：resolver / nuxt 的组件清单必须与 ui 的组件目录完全对应
 * 4. 产物新鲜度：nuxt / resolver 的 dist 必须已经包含清单里的全部组件
 *
 * 第 2、3 层是 W6 新增 —— 通配符 exports 无法静态校验，
 * 只能反过来从产物目录与清单去比对，否则「少了一个组件的 CSS」这类问题
 * 要等下游按需引入时才会暴露。
 *
 * 第 4 层是修 Nuxt 站事故时补的：源码清单齐全、dist 停在旧版本时，
 * 构建与类型检查都发现不了，只会在 Nuxt 运行时解析不到组件
 * （带作用域插槽的标签直接在 SSR 抛 Cannot destructure property）。
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
   * 读取组件导出的实际组件名（与 sync 脚本同一套规则）
   *
   * 必须解析 index.ts 而不能只看目录名：一个目录可能导出多个组件
   * （checkbox/ 同时导出 SrCheckbox 与 SrCheckboxGroup）。
   * @param {string} dir 组件目录名
   * @returns {string[]} 组件名
   */
  const collectNames = (dir) => {
    const entry = join(uiSrc, dir, 'index.ts')
    if (!existsSync(entry)) return []

    const source = readFileSync(entry, 'utf-8')
    return [...source.matchAll(/export const (Sr[A-Za-z0-9]+)\s*=/g)].map((matched) =>
      matched[1].replace(/^Sr/, ''),
    )
  }

  const expected = [...new Set(sourceComponents.flatMap(collectNames))].sort()

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

  // ---------- 4. 模块产物新鲜度 ----------
  // 源码清单已经齐全、dist 还是旧的，是最隐蔽的一种「不同步」：
  // Nuxt 站运行时会解析不到这些组件，<sr-virtual-list> 退化成未知标签，
  // 带作用域插槽的子组件还会在 SSR 里直接抛「Cannot destructure property」。
  const artifactChecks = [
    { pkg: '@sunset-reverie/nuxt', file: join(PACKAGES_DIR, 'nuxt/dist/module.mjs') },
    { pkg: '@sunset-reverie/resolver', file: join(PACKAGES_DIR, 'resolver/dist/index.js') },
  ]

  for (const artifact of artifactChecks) {
    if (!existsSync(artifact.file)) continue

    const source = readFileSync(artifact.file, 'utf-8')
    const block = source.match(/SR_COMPONENT_NAMES\s*=\s*(\[[\s\S]*?\])/)?.[1] ?? ''
    const builtNames = block
      ? [...block.matchAll(/['"]([A-Za-z0-9]+)['"]/g)].map((matched) => matched[1])
      : []

    // nuxt 模块产物里名称只以字符串形式出现一次，没有数组时退回全文匹配
    const names = builtNames.length > 0 ? builtNames : expected.filter((name) => source.includes(name))
    const stale = expected.filter((name) => !names.includes(name))

    if (stale.length > 0) {
      missing.push(
        `${artifact.pkg} 的构建产物缺少 ${stale.length} 个组件（${stale.slice(0, 5).join('、')}${stale.length > 5 ? '…' : ''}），请执行 pnpm build`,
      )
    } else {
      checkedCount += 1
    }
  }

  const allConsistent = missing.length === 0
  if (allConsistent) {
    console.log(
      `[产物校验] 组件清单与 ${expected.length} 个组件目录一致（resolver + nuxt，含构建产物新鲜度）`,
    )
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
