/**
 * 样式产物构建脚本
 *
 * 产出三类文件：
 * - dist/base.css                        仅 CSS 变量 + reset + 动画 + 工具类（全站引入一次）
 * - dist/style.css                       base + 全部组件样式（全量引入场景）
 * - dist/components/<name>/style.css     单组件样式（按需引入场景）
 *
 * 为什么要拆：base 里的 :root 变量块若被打进每个组件 CSS，
 * 体积会重复 N 份；而按需引入时若只能引全量 CSS，按需就失去意义。
 *
 * 说明：直接用 Less 的 render API 编译，不经过 PostCSS。
 * 若后续需要 autoprefixer / cssnano，改为走 Vite 的 CSS 管线即可。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import less from 'less'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT_DIR = resolve(ROOT, 'dist')

/**
 * 编译单个 Less 入口为 CSS 文件
 * @param {string} entry 相对包根目录的 Less 路径
 * @param {string} outFile 输出文件名（位于 dist 下）
 * @returns {Promise<void>}
 */
async function compile(entry, outFile) {
  const entryPath = resolve(ROOT, entry)
  const source = readFileSync(entryPath, 'utf-8')

  const result = await less.render(source, {
    filename: entryPath,
    javascriptEnabled: true,
    paths: [resolve(ROOT, 'src')],
  })

  const target = resolve(OUT_DIR, outFile)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, result.css, 'utf-8')
  return result.css.length
}

/**
 * 入口：编译 base、全量、以及每个组件的独立样式
 * @returns {Promise<void>}
 */
async function main() {
  const baseSize = await compile('src/styles/base/index.less', 'base.css')
  console.log(`[ui] dist/base.css（${(baseSize / 1024).toFixed(1)} KB）`)

  const fullSize = await compile('src/styles/index.less', 'style.css')
  console.log(`[ui] dist/style.css（${(fullSize / 1024).toFixed(1)} KB）`)

  // 遍历全部组件目录，而不是只遍历「有 style/index.less 的」：
  // 像 config-provider（不渲染 DOM）与 transition（样式在 base 里）天然没有组件样式，
  // 但 resolver 会无条件引用 @sunset-reverie/ui/components/<name>/style.css，
  // 文件不存在就会在下游构建时报错。所以这类组件产出一个仅含注释的占位文件。
  const componentDirs = readdirSync(resolve(ROOT, 'src/components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  let total = 0
  let empty = 0

  for (const name of componentDirs) {
    const entry = `src/components/${name}/style/index.less`

    if (existsSync(resolve(ROOT, entry))) {
      const size = await compile(entry, `components/${name}/style.css`)
      total += size
      console.log(`[ui] dist/components/${name}/style.css（${(size / 1024).toFixed(1)} KB）`)
      continue
    }

    // 无样式的组件：产出占位，保证 resolver 的 sideEffects 路径始终有效
    const placeholder = `/* ${name} 无独立样式 */\n`
    const target = resolve(OUT_DIR, `components/${name}/style.css`)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, placeholder, 'utf-8')
    empty += 1
  }

  console.log(
    `[ui] 共 ${componentDirs.length} 个组件样式（${empty} 个为占位），合计 ${(total / 1024).toFixed(1)} KB`,
  )
}

main().catch((error) => {
  console.error('[ui] 样式构建失败：', error.message)
  process.exit(1)
})
